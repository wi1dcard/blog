---
id: create-and-maintain-a-helm-chart
tags: [Helm, CI/CD]
date: 2020-03-27 23:14:36
title: 创建并维护商业项目的 Helm Chart
categories: Tutorials
---

在之前的文章中，我介绍了：

- 如何使用 GitLab CI 实现持续部署。
- 如何使用 Helm 和 Helmfile 部署应用到 Kubernetes 集群中。

但这其中缺少了关键的一环：创建一个属于你的项目的 Chart，这样才能把我们开发的项目通过 Helm 部署到集群中。本文将会为大家介绍我们如何创建并维护 Chart，打通从提交代码到部署的完整流程。

<!--more-->

## Chart 放在哪

在创建 Chart 前，首先要考虑的问题是 Chart 放在哪。目前社区中普遍的做法是与应用代码分开存放，将 Chart 放在单独的仓库中，并由 CI 负责打包、更新。这样的好处是：

- Chart 的发版周期与应用不必保持同步。
- Commit tree 更加清晰。

因为开源项目的 Chart 可能会在其它地方安装，或是成为某个 Chart 的依赖，所以必须 publish 这些 Chart。而对于我们这类闭源商业项目，Chart 不会在其它地方依赖，我更推荐直接放在应用代码仓库。原因如下：

- 不必单独配置 CI 打包。
- 发版节奏与应用保持同步，出问题时方便回滚。

例如我司几个主要项目的 Chart 全部存放在各自代码仓库内 `deploy/chart` 目录下：

![](/resources/3f65722bc604f306abd8954935d6d5e8.png)

## 创建 Chart 和 Helmfile.yaml

在确定存放位置后，可以开始创建 Chart 了。具体操作很简单，在执行以下命令即可：

```bash
cd deploy
helm create api # api 是你希望创建的 Chart 名称
```

不过需要注意的是，Helm 默认会在 working directory 创建一个名为 `api`（取决于你填写的具体名称）的子目录用于存放 Chart。因此你需要手动执行 `mv api chart`。不要尝试直接运行 `helm create chart`，因为在创建新 Chart 的过程中，你填写的名称会在 Chart 内被使用，更难以替换。

另外，我们还创建了 `helmfile.yaml`，这样在 CI 中我们只需要运行 `helmfile -e $ENV apply` 即可。

```yaml
repositories:
  - name: stable
    url: https://kubernetes-charts.storage.googleapis.com
  - name: bitnami
    url: https://charts.bitnami.com/bitnami

environments:
  stg:
    values:
      - ./deploy/values/env.stg.yaml.gotmpl
  prd:
    values:
      - ./deploy/values/env.prd.yaml.gotmpl

helmDefaults:
  wait: true
  timeout: 180

releases:
  - name: {{ .Environment.Values.releaseName }}
    namespace: {{ .Environment.Values.namespace }}
    chart: ./deploy/chart # 直接填写 Chart 的相对路径
    secrets:
      - ./deploy/env/secrets.{{ .Environment.Values.envName }}.yaml
    values:
      - ./deploy/values/values.{{ .Environment.Name }}.yaml.gotmpl
```

关于 Helmfile 的基础使用，可参考我们之前的博文（**此处超链接待定**）。

值得一提的是，我们配置了两个 Helm 的参数。其中，`wait` 配置为 `true`，这样在 CI 环境中运行时，直到部署的资源状态变为 Ready 后，Pipeline 才会变为成功状态。如果不启用该参数，那么只要资源正常创建，Helm 就会完成、退出，这时 Pod 或许并没有启动，可能出现无法调度、拉取镜像失败等，这些问题应当属于部署失败的范畴。因此，为了让 CI 执行结果更加准确，我们开启了该参数。

另外，为了防止 Pipeline 时间过长，`timeout` 设置为 `180` 秒。

## 新增或调整资源模板

新创建的 Chart 包含一些常用资源的模板，例如 Ingress、Deployment 等。你可以根据需要添加其它资源，模板语法可参考 Go template 官方文档即可。如果不知从何下手创建一个新资源，我推荐看看这个项目：<https://github.com/dennyzhang/kubernetes-yaml-templates>，这其中包含了不少常用的 Kubernetes 资源例子，你可以直接复制并改造成 Go template 即可。

一般来说需要改造的有两点，以 ConfigMap 为例：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "api.fullname" . }}
  labels:
    {{- include "api.labels" . | nindent 4 }}
# ...
```

首先将资源名称修改为与其它资源一致，使用模板渲染的 fullname。其次修改 `labels` 字段，一般来说使用 Helm 自带辅助函数渲染的 labels 即可。

注意，`api.fullname` 和 `api.labels` 不是固定的，`api` 是你的 Chart 名称。

## 编辑 Values

在新增其它资源后，你可以引用更多自定义的 Values，例如：

```yaml
apiVersion: v1
kind: ConfigMap
# ...
data:
  APP_ENV: {{ .Values.app.env }}
```

我们将 `APP_ENV` 配置为 Values 中 `app.env` 的值。在引用新的 Values 后，我推荐一并修改 Chart 内 `values.yaml` 的内容，保持模板与 Values 的同步，这样在增加新环境时就有一份「基础」Values 用于参考可供修改的配置。例如：

```yaml
# ...
app:
  env: production
# ...
```

## 依赖其它 Chart

通常我们的应用会依赖一些知名的开源组件，例如 Redis、MySQL 等。Helm 允许我们将其它 Chart 声明为依赖，这样在你的 Chart 的安装过程中，也会同时安装依赖的 Chart，从而达成了安装应用以及相关所需服务的目的。

新版 Helm v3 中提供了对 Chart v2 的支持。原先 Chart v1 中的 `dependencies.yaml` 被废弃了。编辑 `Chart.yaml`，添加 `dependencies` 部分即可：

```yaml
apiVersion: v2
# ...
dependencies:
  - name: redis       # Chart 名称
    version: 10.5.10  # Chart 版本
    repository: https://charts.bitnami.com/bitnami # Chart Repo
```

执行 `helm dep build` 即可拉取依赖并生成 `Chart.lock`。最后，由于依赖的 Chart 的发行包直接存储在 Chart 下的 `charts` 子目录中，因此建议将 `deploy/chart/charts` 路径添加到 `.gitignore` 文件内，以防止将依赖代码提交到 Git 版本管理内。

## 小结

创建并维护一个可靠的 Chart 并不容易，在不断完善的过程中我们投入的大量精力。有兴趣的同学推荐读一下 Helm 官方和 Bitnami 提供的 Helm Chart 最佳实践文档。相信会对你有所帮助：

- <https://helm.sh/docs/chart_best_practices/>
- <https://docs.bitnami.com/tutorials/series/best-practices-helm/>
