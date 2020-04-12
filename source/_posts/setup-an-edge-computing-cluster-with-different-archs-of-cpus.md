---
id: setup-an-edge-computing-cluster-with-different-archs-of-cpus
tags: [Docker, Kubernetes, RaspberryPi]
date: 2020-04-13 00:00:38
title: 搭建异构 CPU 组成的边缘计算 Kubernetes 集群
categories: Tutorials
---

平时除了维护公司和私人在公有云的 Kubernetes clusters 之外，个人网络环境下还有些需要运行在本地的 workload；比如用于监控本地路由设备（~作~ XD）的 Prometheus exporters 和一些新奇玩意儿。为了能够运行这些应用，我在家组建了一套「边缘计算集群」，来看看是怎么做的吧。

<!--more-->

## 硬件准备

我手头上目前有一台 [Raspberry Pi 3 B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/)，我想使用它作为 Master 节点：

![](/resources/e3bbeb04097925d7a81fa377156350aa.png)

和两块 [Nanopi NEO 2](https://www.friendlyarm.com/index.php?route=product/product&product_id=180)：

![](/resources/cf88d169db45970ca298f4e434b80c5f.png)

## 搭建集群

### K3s

为了能够适应较低的计算性能，我选择了使用 [K3s](https://k3s.io/) 部署 Kubernetes 集群。K3s 是一款 Rancher 开源的轻量 Kubernetes 实现，主要目标为物联网和边缘计算等场景。

如果你是在搭建测试集群，不妨试试 Minikube 和 Microk8s，它们能够提供更加接近生产环境集群的体验。

不同于以上两款产品，K3s 除了更加轻量外，还支持多节点，因此比较符合我的使用场景。

> 以上产品的详细对比可参考 [这篇帖子](https://www.reddit.com/r/kubernetes/comments/be0415/k3s_minikube_or_microk8s/el2xy5r/)。

### K3sup

[K3sup](https://github.com/alexellis/k3sup) 是由 OpenFaaS 的创始人 Alex Ellis 开发的一款小工具，可用于快速部署 K3s 节点，例如部署 master node：

```bash
k3sup install --ip "$MASTER" --user pi
```

执行以上命令，K3sup 将以用户 `pi` 的身份通过 SSH 连接 `$MASTER`（也就是作为 Master 节点的树莓派 IP 地址），在下载并安装 K3s 后，K3sup 会将生成的 Kubeconfig 从远端拉取到本地的工作目录中。

接下来部署 worker node：

```bash
k3sup join --ip "$WORKER" --server-ip "$MASTER" --user pi
```

随后即可通过 `kubectl` 管理集群了：

```bash
export KUBECONFIG="$(pwd)/kubeconfig"
kubectl get node
```

![](/resources/5e6d3227ecba7623049bd9b89f18c00f.png)

具体的安装过程限于篇幅不再详述，可参考 [Alex Ellis 的这篇博客](https://blog.alexellis.io/test-drive-k3s-on-raspberry-pi/)。

## 使用 NodeAffinity 处理不同 CPU 架构问题

根据上图可以发现，树莓派的 CPU arch 是 `arm`，而 NanoPi 是 `arm64`。为了能够将对应其架构的容器镜像调度到正确的节点，使用 NodeAffinity 是解决方案之一。例如部署内网穿透项目 [inlets](https://github.com/inlets/inlets)：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inlets-arm64
spec:
  selector:
    matchLabels:
      app: inlets
  replicas: 1
  template:
    metadata:
      labels:
        app: inlets
    spec:
      containers:
        - name: inlets
          image: inlets/inlets:2.6.4-arm64 # 镜像为 arm64 版本
          args: [server]
      affinity:
        nodeAffinity:
          # 在 Pod Scheduling 时强制要求
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:     # 节点选择器数组
              - matchExpressions:  # 匹配节点 labels
                  - key: kubernetes.io/arch  # label 名称
                    operator: In             # 要求满足以下任意值其一
                    values: [arm64]          # 可指定多个值
```

可以看到我们在 Pod Spec 内定义了 `affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms` 字段，值为 NodeSelectorTerm 数组。我们定义了一条规则为：label `kubernetes.io/arch` 的值必须存在于数组 `[arm64]` 中。本例中只有单个值，因此等效于：必须等于 `arm64`。

## Docker Manifests

如果你想要部署的应用镜像是你自己构建的话，那么强烈推荐试试看 [Docker image manifest v2](https://docs.docker.com/registry/spec/manifest-v2-2/) 的特性 —— 可创建 manifest lists 包含多个不同 platform 和 architecutre 的 image manifests。

Docker Client 也提供了一个实验性的命令 [`docker manifest`](https://docs.docker.com/engine/reference/commandline/manifest/) 来创建、推送 manifest lists。我结合实例来说说它的用法。

由于该命令目前是「实验性」的，首先需要通过环境变量开启才能够使用。我们顺便配置几个变量备用：

```bash
export DOCKER_CLI_EXPERIMENTAL=enabled # 开启 Docker CLI 的实验性功能
export IMAGE_REPO=vendor/app           # 镜像名称，请按需填写
export IMAGE_TAG=v1.0.0                # 镜像 tag，请按需填写
```

假设你已经分别构建好针对 `arm64` 和 `arm` 的镜像，接下来先将它们推送到 registry：

```bash
docker push "${IMAGE_REPO}:${IMAGE_TAG}-arm64"
docker push "${IMAGE_REPO}:${IMAGE_TAG}-arm"
```

随后创建 manifest list 指向多个 image manifests：

```bash
docker manifest create --amend \
  "${IMAGE_REPO}:${IMAGE_TAG}" \       # manifest list 名称
  "${IMAGE_REPO}:${IMAGE_TAG}-arm64" \ # 针对 arm64 的镜像
  "${IMAGE_REPO}:${IMAGE_TAG}-arm"     # 针对 arm 的镜像
```

最关键的一步到了，为它们添加注解。将每个 manifest 绑定至特定的 `os` 和 `arch`：

```bash
# 注解 arm64 image manifest
docker manifest annotate \
  --os linux \                        # 系统为 Linux
  --arch arm64 \                      # 架构为 arm64
  "${IMAGE_REPO}:${IMAGE_TAG}" \      # manifest list 名称
  "${IMAGE_REPO}:${IMAGE_TAG}-arm64"  # 被注解的 manifest

# 注解 arm image manifest
docker manifest annotate \
  --os linux \                      # 系统同为 Linux
  --arch arm \                      # 架构为 arm
  "${IMAGE_REPO}:${IMAGE_TAG}" \    # manifest list 名称
  "${IMAGE_REPO}:${IMAGE_TAG}-arm"  # 被注解的 manifest
```

此时 manifest list 已经创建好了，可使用 `docker manifest inspect` 命令检查一下具体信息。确认无误后，推送到 registry 即可：

```bash
docker manifest push --purge "${IMAGE_REPO}:${IMAGE_TAG}"
```

需要注意的是，此处的 `--purge` 参数是必不可少的。因为 Docker CLI 并没有提供 `docker manifest remove` 或是 `docker manifest purge` 之类的命令。如果不随着推送直接清理，那就只能到本地的 `$HOME/.docker/manifests` 目录手动删除了... 虽然早在 2018 年初就有人针对此问题提出 [issue](https://github.com/docker/cli/issues/954)，但截止发稿前仍没有仓库 member 回复。

最后，使用刚刚创建的 manifest list 名称代替有后缀的 image manifest 名称即可，甚至可以增加 `replicas` 的数量，通过 `PodAntiAffinity` 刻意将多个副本部署在不同 CPU 架构的节点上而无需区分 `image`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inlets
spec:
  selector:
    matchLabels:
      app: inlets
  replicas: 2
  template:
    metadata:
      labels:
        app: inlets
    spec:
      containers:
        - name: inlets
          image: inlets/inlets:2.6.4 # 后缀 `arm64` 已被移除
          args: [server]
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - topologyKey: kubernetes.io/arch
              labelSelector:
                matchLabels:
                  app: inlets
```

![](/resources/762c17ab2fdbe84f79c93635ca3cbcce.png)

完。
