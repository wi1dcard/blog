---
id: getting-to-know-helm
tags: [Kubernetes, Helm]
date: 2020-03-24 00:35:55
title: K8s 下的应用管理 — 了解 Helm
categories: Tutorials
---

[Helm](https://helm.sh/) 是一款针对 Kubernetes 的「包管理器」，虽说称它为包管理器，其实与应用开发过程中使用的包管理器略有不同，后者管理的是应用开发过程中的依赖，Helm 则管理着 Kubernetes 中应用部署时各项资源的依赖。

如果你对 Kubernetes 有一定了解，相信你已经对 Deployment、Service、Ingress 等资源有了一定认识，大多数 Web 应用在部署到 K8s 集群上时需要大量不同类型的资源。你可以将这些资源声明的 YAML 文件放在同一个文件夹下管理，但是随着数量的增加，如何复用这些 YAML、如何灵活又不繁琐地调整配置以适应不同环境、如何将这些 YAML 作为一个整体管理，成了一个不小的问题。

<!--more-->

于是，像 Helm、[Ksonnet](https://github.com/ksonnet/ksonnet) 这样的项目出现了。它们的思路大多可以分为两类 — 模板渲染派和代码配置派。Helm 属于前者。

尽管我个人不是很喜欢 Go template 的语法，以及考虑到 YAML 的缩进层级，可能不太适合使用模板引擎渲染。但不可否认：

1. Helm 是目前 Kubernetes 圈内应用最广泛的资源管理器，拥有强大的社区和生态。从官方前期推广的 chart 仓库提交记录就可以看得出来：<https://github.com/helm/charts/commits/master>。
2. 最近推出的 Helm 3.0 解决了不少上一个大版本中存在的设计问题（例如 Tiller）。

因此我认为 Helm 仍然是目前的最佳选择之一。

为了让读者有更加直观的感受，接下来我将简单介绍一下使用 Helm 部署应用到 Kubernetes 的工作流。

## 部署社区提供的 Chart

charts 是 Helm 的核心概念之一，包含着 Kubernetes 应用所需的资源模板。在安装 chart 时修改 values 的值即可调整配置参数。

首先你可以在 <https://hub.helm.sh/> 查找社区提供的 charts。在安装之前需要添加 chart repo，repo 内包含 chart 的声明。例如 bitnami 提供的 chart repo：

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

以 Redis chart 为例，我们可以使用以下命令安装它，说白了就是部署 chart 内的资源到 Kubernetes 集群：

```bash
helm install my-release bitnami/redis
```

安装成功后会出现类似这样的提示：

```plain
NAME: my-release
LAST DEPLOYED: Mon Mar 23 22:24:12 2020
NAMESPACE: staging
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
** Please be patient while the chart is being deployed **
Redis can be accessed via port 6379 on the following DNS name from within your cluster:

...
```

其中，`my-release` 是 release 名称。Releases 也是 Helm 的概念之一。每次安装都会产生新的 release，更新时则会产生新的 release revision。你可以使用 `helm list` 命令查看当前命名空间下的所有 releases：

<!-- markdownlint-capture -->
<!-- markdownlint-disable MD010 -->
```plain
NAME      	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART        	APP VERSION
my-release	staging  	1       	2020-03-23 22:24:12.345011 +0800 CST	deployed	redis-10.5.11	5.0.8
```
<!-- markdownlint-restore -->

另外，在执行 `helm install` 命令时，

## 升级、回滚与删除

使用 `helm upgrade` 命令可用于更新 releases，例如当修改了某个 value 的值，需要重新部署应用：

```bash
helm upgrade my-release bitnami/redis --set cluster.enabled=false
```

这里的 `--set` 或 `--values` 选项可以修改特定 value 或指定 YAML 格式的 values 配置文件。这两个选项同样适用于 `helm install` 命令。

通过 `helm history` 命令即可查看某个 release 部署过的历史 revisons，输出类似于：

<!-- markdownlint-capture -->
<!-- markdownlint-disable MD010 -->
```plain
REVISION	UPDATED                 	STATUS    	chart        	APP VERSION	DESCRIPTION
1       	Mon Mar 23 22:24:12 2020	superseded	redis-10.5.11	5.0.8      	Install complete
2       	Tue Mar 24 00:17:34 2020	deployed  	redis-10.5.11	5.0.8      	Upgrade complete
```
<!-- markdownlint-restore -->

Helm 在部署时会将使用 values 渲染出来的资源声明存储到 release revison 中。也就是说我们每次安装、升级 chart 都可回退。当应用因为某些原因需要回滚时，使用 `helm rollback` 可将所有相关资源回滚到特定 revison 的状态：

```bash
helm rollback my-release # 回滚到上一个 revision
helm rollback my-release n # 回滚到第 n 个 revision
```

最后，在需要卸载应用时使用 `helm delete` 命令删除 release 即可：

```bash
helm delete my-release
```

## 小结

以上是使用 Helm 管理 Kubernetes 资源的大致工作流。可以看出，大多数流程仍然是「面向过程」，而不是「声明式」的，需要由人工输入命令、判断是 install 还是 upgrade。理想的工作流应当将这些过程编写成配置文件，并且能够良好地集成 CI/CD。这一部分我们已经有了相对比较完善的解决方案，我会在下一篇文章为大家详细介绍。
