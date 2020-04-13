---
id: getting-to-know-helmfile
tags: [Kubernetes, CI/CD, Helm]
date: 2020-03-24 23:45:01
title: K8s 下的应用管理 — 了解 Helmfile
categories: Tutorials
---

在上一篇文章中，为大家介绍了 Helm 的初步使用。然而这仍然不能满足我司的工作流，主要问题有：

1. Helm 不提供 `apply` 命令；因此在 CI/CD 场景中必须考虑到判断是 install 还是 upgrade。
2. 不方便控制安装的 chart 版本；例如指定版本范围、锁定某一版本等。
3. Values 必须是纯文本；不支持模板渲染、不方便区分环境。

因此我们需要 `Helm Releases as Code`。我听说过的产品有 [Helmsman](https://github.com/Praqma/helmsman) 和 [Helmfile](https://github.com/roboll/helmfile) 两款。目前我们团队已经使用后者一段时间，并且有团队成员贡献过部分代码。

<!--more-->

至于为什么选择 Helmfile，背后的真正原因是在发现 Helmfile 的时候还没听说过 Helmsman。后来了解 Helmsman 并尝试后发现它并没有解决我们后两个问题，因此也就没有替换了。

接下来我针对以上几个痛点来说说我们是怎么做的。

## 一键 Apply

Helmfile 的文档非常简明、直接，[示例配置文件](https://github.com/roboll/helmfile#configuration)就在 README 里。我节选一小段来说几个必要的配置项：

```yaml
repositories:
  - name: bitnami
    url: https://charts.bitnami.com/bitnami

releases:
  - name: my-release     # Release name
    namespace: staging   # Release namespace
    chart: bitnami/redis # Chart name
    values:              # 等效于 helm 的 --values 选项
      - foo.yaml
    set:                 # 等效于 helm 的 --set 选项
      - name: cluster.enabled
        value: "false"
```

将以上内容保存为 `helmfile.yaml` 文件，随后执行 `helmfile apply` 即可。Helmfile 将会帮我们：

1. 添加 `repositories` 中声明的 Helm chart repo。
2. 根据 `release` 小节内的配置，安装或更新 chart。

上篇文章中提到的：

```bash
helm repo add ...
helm install ...
helm upgrade ...
```

可直接被简化为：

```bash
helmfile apply
```

同时，如果你安装了 [helm-diff](https://github.com/databus23/helm-diff) 插件，Helmfile 还会在执行操作前输出清晰的 diff：

![](/resources/599a0cfe2ff551edfe0ca384f5560b5d.png)

具体安装过程本文不再详述。

### Chart 版本控制

大多数社区提供的 chart 都采用 [Semver 2.0](https://semver.org/) 作为版本号。因此大多数情况下我们都希望锁定主版本，防止误升级引入 breaking change。Helmfile 提供了 `version` 参数可用于指定版本范围，例如：

```yaml
# ...

releases:
  - name: my-release
    namespace: staging
    chart: bitnami/redis
    version: ^10.5.13 # 防止升级到 v11.x.x
    # ...
```

同时，Helmfile 还提供了 lock 文件，功能与常见版本管理器中的 lock 类似。配合 CI 时，除非提交代码改动 lock 文件，否则在任意时间点执行 CI 安装的 chart 版本是一致的。

你可以通过 `helmfile deps` 命令生成 lock，以上 `helmfile.yaml` 生成的示例 `helmfile.lock` 文件长这样：

```yaml
version: v0.102.0
dependencies:
- name: redis
  repository: https://charts.bitnami.com/bitnami
  version: 10.5.13
digest: sha256:20f2840c2642bf98f03d2b5cf890c73e1f2c100a0f0475777ae7788b2a0ae98d
generated: "2020-03-24T14:14:01.663801+08:00"
```

可看出包含具体的 chart 版本、Helmfile 版本、哈希值、生成时间等参数。

当需要更新 lock 文件时，同样执行 `helmfile deps` 即可。

### 动态 Values

在 CI 上部署时，有些 values 的值不是固定的，可能来自于环境变量，也可能根据环境的不同而不同。

### 环境变量

在之前的文章中我们介绍过 review apps，其中有一项很重要的需求是，每次开新分支部署的 release name 不能相同，否则资源会因为重名而安装失败。所以我们要读取 GitLab CI 的 `$CI_ENVIRONMENT_SLUG` 环境变量，并拼接到最终的 Helm release name。因此可以这样做：

```yaml
# ...

releases:
  - name: api-{{ requiredEnv "CI_ENVIRONMENT_SLUG" }}
    chart: ./deploy/chart
    # ...
```

其实 `helmfile.yaml` 是个 Go template 格式的模板，因此你还可以把环境变量传递给 values，也可以使用 `if` 之类的语法。例如：

```yaml
# ...

releases:
  - name: my-release
    namespace: staging
    chart: bitnami/redis
    set:
      - name: cluster.enabled
        value: {{ requiredEnv "REDIS_CLUSTER_ENABLED" }}
```

### 区分环境

Helmfile 提供了名为 `environments` 的配置，此处并不是指环境变量，而是一个专属于 Helmfile 的概念。来看看例子。首先创建两个文件：

```yaml
# environments/staging/values.yaml
releaseName: staging-release

# environment/production/values.yaml
releaseName: production-release
```

配置 `helmfile.yaml`：

```yaml
# ...

environments:
  staging:
    values: # 针对 staging 环境的 values，可通过 {{ .Environment.Values.* }} 读取
      - environments/staging/values.yaml
  production:
    values: # 针对 production 环境的 values，读取方式相同
      - environment/production/values.yaml

releases:
  - name: {{ .Environment.Values.releaseName }} # 引用 environment values 的值（例如 staging-release 或 production-release）
    namespace: {{ .Environment.Name }} # 引用 envrionment 名称（例如 staging 或 production）
    chart: bitnami/redis
    values:
      - values/{{ .Environment.Name }}/values.yaml # 根据环境名称读取不同的 Helm values 文件
{{ if eq .Environment.Name "production" }} # Go template 的 if 语句
      - values/production-specified-values.yaml # 仅用于 production 环境的 Helm values
{{ end }}
```

在执行 `helmfile` 时使用 `-e` 参数即可指定安装的环境：

```bash
helmfile -e staging apply
```

注意 `-e` 必须在子命令 `apply` 之前，它是一个全局参数。

## 小结

以上就是我们关于 Helmfile 的相关实践经验。不得不说，Helmfile 的确很灵活，但采用 Go template + YAML 语法编写配置的方式稍有些难以阅读。
