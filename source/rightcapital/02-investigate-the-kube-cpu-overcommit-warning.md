---
title: 一次 KubeCPUOvercommit 告警排查过程小记
---

## 问题表现

在配置好 Prometheus Operator 后，我们决定开启由 [kubernetes-mixin] 项目提供的 Rules。我司使用的是 Helm Chart [prometheus-operator]，因此配置 `defaultRules.create` 为 `"true"` 即可。在其后的几天里，每到傍晚六点钟左右就会出现 `KubeCPUOvercommit` 的告警：

![](/resources/02de1b851a5be86302f6817cd12de4b3.png)

我们已经集群内安装了 [Cluter Autoscaler](https://github.com/kubernetes/autoscaler)，理论上不会出现 CPU Resource Requests 超量的情况。于是开始排查具体原因。

## 排查过程

### 最初的猜测

首先，我们拿到了该报警规则的表达式（[来源][kube-cpu-overcommit-rule-expr]）：

```js
sum(namespace:kube_pod_container_resource_requests_cpu_cores:sum)
  /
sum(kube_node_status_allocatable_cpu_cores)
  >
(count(kube_node_status_allocatable_cpu_cores)-1) / count(kube_node_status_allocatable_cpu_cores)
```

随后检查 Metrics `kube_pod_container_resource_requests_cpu_cores` 发现不包含 Pod Status 的 Label。每天 18:00 左右我们刚好有大量的定时任务启动，手动删除一部分 Failed Pod 后 Alert 恢复。所以我们误以为它将 Failed 和 Completed 的 Pod Resource Requests 全部纳入了计算范围。

### 研究表达式

为了证实该猜想，我们开始深入研究这个报警规则表达式。

其中，`namespace:kube_pod_container_resource_requests_cpu_cores:sum` 是 Prometheus 的 [Recording Rule][prometheus-recording-rules]。主要用于预先计算那些使用率高或是计算量较大的表达式，并将其结果保存为一组新的时间序列，这样不仅能够提高报警规则的计算速度，同时可以达到复用复杂表达式的效果。

> `level:metric:operations` 是官方推荐的 [Recording Rules 命名协定][prometheus-recording-rules-best-practice]。

经过一番查找，该 Recording Rule 的表达式为（[来源][the-recording-rule]）：

```js
sum by (namespace) (
    sum by (namespace, pod) (
        max by (namespace, pod, container) (
            kube_pod_container_resource_requests_cpu_cores{job="kube-state-metrics"}
        ) * on(namespace, pod) group_left() max by (namespace, pod) (
          kube_pod_status_phase{phase=~"Pending|Running"} == 1
        )
    )
)
```

稍微有点长，我们简化一下，先看内层。

```js
max by (namespace, pod, container) (
    kube_pod_container_resource_requests_cpu_cores{job="kube-state-metrics"}
)

* on(namespace, pod) group_left()

max by (namespace, pod) (
  kube_pod_status_phase{phase=~"Pending|Running"} == 1
)
```

为了方便理解，我将其中一段表达式拆分成三部分：

- 第 1 部分 `max by ()` 是常见的聚合运算，同一 `namespace`、`pod`、`container` 仅保留最大值。
- 第 3 部分同理。
- 第 2 部分中，`on(namespace, pod) group_left()` 是 PromQL 的语法之一，直译为 [向量匹配][vector-matching]。本例的含义为：依次查找运算符（`*`）左侧样本中 `namespace` 和 `pod` 相匹配的右侧样本，若有匹配则参与运算并形成新的时间序列，若未找到则直接丢弃样本。

此处将 `kube_pod_container_resource_requests_cpu_cores` 和 `kube_pod_status_phase` 相乘，同时带有条件 `kube_pod_status_phase{phase=~"Pending|Running"} == 1`，也就是说：

1. Pod 的状态必须满足 Pending 或 Running，否则样本会被丢弃。
2. `kube_pod_status_phase` 的值仅可能为 `1`。因此样本相乘，值不变。

最后，在外层再进行一些聚合运算，Recording Rule `namespace:kube_pod_container_resource_requests_cpu_cores:sum` 就计算完成了：

```js
sum by (namespace) (
    sum by (namespace, pod) (
        ...
    )
)
```

经过排查，否定了我们的猜想，因为该时间序列已经排除了非 Pending 或 Running 状态的 Pod，它们的 Resource Requests 数值不会纳入到最终的样本中。

### 继续深入

确定 `namespace:kube_pod_container_resource_requests_cpu_cores:sum` 没有问题后，我们继续把目光转向本文开头提到的告警表达式，发现它的含义为：

`Pod所需要的CPU核心总数 / 可分配的核心总数 > (Node数量-1) / Node 数量` 则报警。

仔细阅读告警的 [描述][kube-cpu-overcommit-alert-description]：

> Cluster has overcommitted CPU resource requests for Pods and cannot tolerate node failure.

恍然发现它表述的意思是：集群已承受超量的 Pod CPU 资源请求，无法容忍 Node 失效（例如节点崩溃、Drain/Taint 造成的 Evict 等）。

这么说来就可以解释为何 `CPU 核心数的利用率` 要与 `(Node数量-1) / Node 数量` 做比较了。可简单地理解为：目前集群中的工作负载已不容许出现 Node 数量减少 1，一旦有 Node 失效，Pod 所需要的 CPU 资源就超出集群的资源总量了。

## 问题解释

综上所述，该 Alert 属于「预警」，并非「报警」。它的出现是为了提示该扩容集群了，而不是已经出现了 Unscheduled Pod。

因为有 Cluster Autoscaler 的存在，扩容操作不需要我们手动执行，因此文章开头提到的「手动删除一部分 Failed Pod 后 Alert 恢复」实际上是一个「迷惑行为」，此时刚好碰上新的 Node 启动完成而已。

## 解决方案

为了能够保证集群的超高可用（至少可以容忍一台 Node 失效），我们需要 **Overprovisoning**。虽然 Cluster Autoscaler 并没有直接提供参数实现，但我们在 FAQ 发现了一个小技巧：[How can I configure overprovisioning with Cluster Autoscaler][how-can-i-configure-overprovisioning-with-cluster-autoscaler]。

大致思路如下：

1. 创建较低的 `PriorityClass`，例如名为 `overprovisioning` 值为 `-1`。
2. 创建 `Deployment` 作为「占位」，将 `spec.template.spec.priorityClassName` 设置为 `overprovisioning`，同时配置 Containers 的 Resource Requests 为预留的资源数量。
3. Cluster Autoscaler 将会 **Overprovisoning** 一部分 Node 以满足占位 Pods 的 Resource Requests。
4. 因为占位 Pods 优先级较低，在其它优先级较高的 Pods 需要资源时，占位 Pods 将会被驱逐，将预留的资源提供给其它 Pods。
5. 此时占位 Pods 无法被调度，Cluster Autoscaler 将会再次 **Overprovisoning** 新的 Node。

最终，在 kubernetes-mixin 项目中，修改告警规则的 `ignoringOverprovisionedWorkloadSelector` [配置项][ignoring-overprovisioned-workload-selector]。使用 Selectors 忽略 Overprovisoning 的 Pods，使其不纳入工作负载的计算，即可解决以上问题。

[kubernetes-mixin]: https://github.com/kubernetes-monitoring/kubernetes-mixin
[prometheus-operator]: https://github.com/helm/charts/tree/master/stable/prometheus-operator
[kube-cpu-overcommit-rule-expr]: https://github.com/helm/charts/blob/6914e76c33683ea2d7a2e793c180b6a0d09345f8/stable/prometheus-operator/templates/prometheus/rules-1.14/kubernetes-resources.yaml#L29-L34
[kube-cpu-overcommit-alert-description]: https://github.com/helm/charts/blob/6914e76c33683ea2d7a2e793c180b6a0d09345f8/stable/prometheus-operator/templates/prometheus/rules-1.14/kubernetes-resources.yaml#L27
[the-recording-rule-expr]: https://github.com/helm/charts/blob/6914e76c33683ea2d7a2e793c180b6a0d09345f8/stable/prometheus-operator/templates/prometheus/rules-1.14/k8s.rules.yaml#L61-L70
[prometheus-recording-rules]: (https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)
[prometheus-recording-rules-best-practice]: https://prometheus.io/docs/practices/rules/
[vector-matching]: https://prometheus.io/docs/prometheus/latest/querying/operators/#vector-matching
[how-can-i-configure-overprovisioning-with-cluster-autoscaler]: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md#how-can-i-configure-overprovisioning-with-cluster-autoscaler
[ignoring-overprovisioned-workload-selector]: https://github.com/kubernetes-monitoring/kubernetes-mixin/blob/master/alerts/resource_alerts.libsonnet#L14-L17
