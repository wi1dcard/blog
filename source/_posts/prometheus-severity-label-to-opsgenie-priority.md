---
id: prometheus-severity-label-to-opsgenie-priority
tags: [Kubernetes, Prometheus]
date: 2020-09-30 16:11:36
title: Convert Kubernetes-Mixin Severities to OpsGenie Priorities in Prometheus
---

In [kubernetes-mixin][] (a dependency of [kube-prometheus-stack][] and [prometheus-operator][] charts) rules, the severity label of alrets can be `critical`, `warning`, or `info` etc. However, OpsGenie's priority field only accepts values like `P1`, `P2` ... `P5`.

As a user of both of them, I would have to convert the "severity" to OpsGenie's "priority". For example, if a `critical` alert was fired, a matched `P1` alert to be created in OpsGenie is expected, and `warning` -> `P2`, `info` -> `P3`, as well.

[kubernetes-mixin]: https://github.com/kubernetes-monitoring/kubernetes-mixin
[kube-prometheus-stack]: https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
[prometheus-operator]: https://github.com/helm/charts/tree/d0f9bcc80f0282519bee34d81175895c8a776b1f/stable/prometheus-operator

<!--more-->

We can use go-template in `receivers.*.opsgenie_configs.*.priority` of Alertmanager's config to generate the priority. However it will finnally end with something like:

```yaml
priority: >-
  {{ with .GroupLabels.priority }}
  {{ if eq . "critical" }}
  P1
  {{ else if eq . "warning" }}
  P2
  {{ else if ... }}
  ...
  {{ end }}
```

That's a bit hard to maintain or debug, and I personnaly don't really like to write tons of go-templates in a short config file, it should be much clearer. Therefore, I prefer the second way - use the `relabel_config` in Prometheus, instead of doing this in Alertmanager.

If you're using kube-prometheus-stack (formerly known as prometheus-operator chart), just add these configs in `prometheus.prometheusSpec.additionalAlertRelabelConfigs`:

```yaml
additionalAlertRelabelConfigs:
- source_labels: [severity]
  target_label: priority
  regex: "none" # Seem only the WatchDog alert has "none" severity
  replacement: "P5"

- source_labels: [severity]
  target_label: priority
  regex: "info"
  replacement: "P3"

- source_labels: [severity]
  target_label: priority
  regex: "warning"
  replacement: "P2"

- source_labels: [severity]
  target_label: priority
  regex: "critical"
  replacement: "P1"
```

And use the grouped label in Alertmanager's priority field:

```yaml
priority: {{ .GroupLabels.priority }}
```

These relabel configs will apply to alerts only, add the `priority` label according to the value of `severity`. This also makes it easier to debug - if the alert priority in your OpsGenie dashboard is not correct, just go check out Alertmanager's dashboard, it shows directly the labels of the alerts included `priority` sent from Prometheus! But if we made a lot of logic in Alertmanager's go-template, I can't seem to find a simple way to get the value of the rendered results in Alertmanager's templating context.

![](/resources/60ab5c681514c84fee1bee90d8410a7a.png)

For more information about `alert_relabel_configs`, please check out [Prometheus official docs](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alert_relabel_configs).
