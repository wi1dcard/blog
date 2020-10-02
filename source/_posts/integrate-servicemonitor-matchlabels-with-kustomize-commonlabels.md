---
id: integrate-servicemonitor-matchlabels-with-kustomize-commonlabels
tags: [Kustomize, Kubernetes]
date: 2020-09-12 09:35:43
title: Integrate ServiceMonitor matchLabels with Kustomize commonLabels
---

While I deploying [v2ray-exporter](https://github.com/wi1dcard/v2ray-exporter) with [Kustomize](https://kustomize.io/), I realized that `commonLabels` in `kustomization.yaml` doesn't take care of the `spec.selector.matchLabels` field in `ServiceMonitor`s. That makes sense, as ServiceMonitor is a part of CoreOS's Prometheus Operator project, neither included nor maintained by Kubernetes. But how can we direct Kustomize to fill the labels in ServiceMonitors or even any fields in customized resources?

<!--more-->

## TL;DR

`kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - servicemonitor.yaml
  # ...

configurations:
  - ../kustomize-configurations/servicemonitor-matchlabels.yaml

commonLabels:
  app: example-exporter
```

`../kustomize-configurations/servicemonitor-matchlabels.yaml`:

```yaml
commonLabels:
  - path: spec/selector/matchLabels
    create: true
    group: monitoring.coreos.com
    kind: ServiceMonitor
```

It seems to me really easy to get confused with `commonLabels` in Kustomize configuration files or `kustomization.yaml`. The name `commonLabels` exists in both of them, but the definitions are totally different.

`servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: example-exporter
spec:
  endpoints:
    - port: http
      path: /scrape
```

Results:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  labels:
    app: example-exporter # <-- Here commonLabels originally handles
  name: example-exporter
spec:
  endpoints:
  - path: /scrape
    port: http
  selector:
    matchLabels:
      app: example-exporter # <-- Here we added labels from commonLabels
```

## References

- <https://kubectl.docs.kubernetes.io/pages/reference/kustomize.html#configurations>
