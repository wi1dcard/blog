---
id: customize-kube-prometheus-built-in-alerts
tags: [Prometheus, Kubernetes]
date: 2021-02-16 20:49:12
title: Customize Kube-Prometheus Built-in Alerts
---

[Kube-prometheus](https://github.com/prometheus-operator/kube-prometheus) provides quite a few great collections of components and alerts that help us monitoring our Kubernetes cluster. I've used it in the production cluster for serveral months. Although the project exposes a bunch of options via `_config+::` to makes it partially configurable, the scope of parameters that we can modify is still limited.

<!--more-->

## The Real-life Problems

For example, we currently deploy our workloads on Google Kubernetes Engine (a.k.a. GKE) on Google Cloud Platform. GKE hosts the master node of the cluster, which could mean some components such as the scheduler and controller manager are "invisible" to users.

Therefore, the alert rule groups `kube-scheduler.rules`, `kubernetes-system-scheduler`, and `kubernetes-system-controller-manager` is unnecessary for us, as well as some Grafana dashboards. I personnally want to remove them to prevent potential confusion.

Another example would be editing the `for` field of alert rules. The default threshold of alert `KubePodNotReady` is `15m`. This is a bit too long for our SLA. We want a shorter duration that we can tolerate.

## Solutions

The good news is, credit to the powerful Jsonnet syntax, we have the ability to customize and tinker the project without forking or copy-pasting.

Tl;DR:

```jsonnet
//
// Part One
//
local prometheusRuleManipulators = [
  function(rule)
    if !std.objectHas(rule, "alert") || rule.alert != "KubePodNotReady" then // Skip other rules
      rule
    else rule + {
      'for': '5m', // Shorten the duration
      annotations+: { // Update durations in the description at the same time
        description: std.strReplace(super.description, "15 minutes", "5 minutes"),
      },
    },

  function(rule) rule, // Do whatever you want

  // Add more functions in the array to customize rules
];


//
// Part Two
//
local applyRuleManipulators(rule, idx) =
  if !std.objectHas(rule, "alert") then // Don't apply to record rules
    rule
  else if idx >= std.length(prometheusRuleManipulators) then // Exit the recursion
    rule
  else
    local f = prometheusRuleManipulators[idx];
    local r = f(rule);
    applyRuleManipulators(r, idx + 1);

//
// Part Three
//
local manipulatePrometheusRules(rules) = [
  applyRuleManipulators(rule, 0)
  for rule in rules // Add optional `if` to filter rules like below
];

local manipulatePrometheusGroups(groups) = [
  group + { rules: manipulatePrometheusRules(group.rules) }
  for group in groups if !std.member([ // Filter and remove some rule groups
    'kube-scheduler.rules',
    'kubernetes-system-scheduler',
    'kubernetes-system-controller-manager',
  ], group.name)
];

local kp =
  (import 'kube-prometheus/kube-prometheus.libsonnet') + {
    prometheusAlerts+:: {
      groups: manipulatePrometheusGroups(super.groups)
    },
  };

// ...
```

### Part One: `prometheusRuleManipulators`

As you can see, my idea was to define a bunch of "manipulators" in an array (`prometheusRuleManipulators`). Like middlewares in the web apps development, all HTTP requests pass through middlewares serially and can be changed before it arrives the app, I want all alerts to be sent to the manipulators and save the outputs of the last manipulator as the final results.

### Part Two: `applyRuleManipulators`

I initally tended to implement this using `for`:

```jsonnet
// Won't work
for fn in manipulators
  alert = fn(alert)

// Won't work either
local alert = fn(alert) for fn in manipulators
```

However, Jsonnet seemed not allowing that. So I ended up using a recursion in `applyRuleManipulators`. It calls the function in `prometheusRuleManipulators[idx]`, increments `idx` by one, then calls itself with a larger `idx`, until `idx >= std.length(prometheusRuleManipulators)`.

### Part Three

I made 2 functions `manipulatePrometheusGroups` and `manipulatePrometheusRules`, which traverse the groups and rules respectively, and optionally filter out ones that we don't utilize with the Python-style `for` and `if`.

The function `manipulatePrometheusRules` also calls `applyRuleManipulators` mentioned above to apply manipulators.

Finally, we can override the alerts by calling `manipulatePrometheusGroups(super.groups)` at the end.

## Read More

I also found a way to edit the alerts using `std.map` after I've made this, check it out: <https://github.com/prometheus-operator/kube-prometheus/discussions/607>.
