---
id: migrate-to-kubernetes-ii
tags: [Blogging, CI/CD, Kubernetes, Helm]
date: 2019-09-12 18:58:42
title: 我如何将博客迁移到 Kubernetes - II
categories: Tutorials
---

（接上文）

前面的部分介绍了如何为我的博客打包 Docker 镜像，接下来就是重头戏 —— 部署到 Kubernetes。

<!--more-->

## Google Kubernetes Engine

没错，我现在自用的 Kubernetes 集群就是 Google 家的 GKE。暂时没有遇到什么太大的坑，各方面集成做得不错，适合我这种小白上手。

## Helm

有 Kubernetes 当然少不了 Helm。在我的理解中，Helm 除了是一个模板引擎之外，还能把一整个「应用」所需要的 YAML 文件组合为一个整体（Chart），多个 Chart 之间可以互相依赖，组合成为一整个系统；搭配 `helm-diff`，`helm-secret` 等插件还可以展示 YAML 文件变更、管理敏感密钥信息等。

首先，我使用 `helm create` 创建了一个 Chart，并将它直接放在了 [deploy/chart](https://github.com/wi1dcard/blog/tree/master/deploy/chart) 目录。

默认 Chart 内的 YAML 模板基本没有修改，只有 `values.yaml` 改了一些值：

```yaml
image:
  repository: wi1dcard/blog
```

正如你看到的，镜像被修改成了 `wi1dcard/blog`（上文中推送到 Docker Hub 的镜像）。同时，我启用了 Ingress，还给 Ingress 添加了一些注解：

```yaml
ingress:
  enabled: true
  annotations:
    kubernetes.io/tls-acme: "true"
    ingress.kubernetes.io/ssl-redirect: "true"
    ingress.kubernetes.io/browser-xss-filter: "true" # X-XSS-Protection: 1; mode=block
    ingress.kubernetes.io/content-type-nosniff: "true" # X-Content-Type-Options: nosniff
    ingress.kubernetes.io/referrer-policy: strict-origin-when-cross-origin # Referrer-Policy: same-origin
    ingress.kubernetes.io/custom-frame-options-value: SAMEORIGIN # X-Frame-Options: SAMEORIGIN
    ingress.kubernetes.io/custom-response-headers: X-Powered-By:Wi1dcard Kubernetes Engine
```

我使用的是 [Traefik](https://github.com/containous/traefik/) Ingress Controller，相比于 Nginx Ingress Controller 给 Nginx 加个中间层来说，Traefik 本身既是 Ingress Controller 又是 Ingress 的具体实现；而且我没有四层协议的需求，性能更是完全无所谓（当然 Traefik 不一定比 Nginx 差），所以直接选择了为「云原生」设计的 Traefik。

这些 Annotations 多数都是我从 [Traefik Kubernetes Ingress Docs](https://docs.traefik.io/configuration/backends/kubernetes/#security-headers-annotations) 抄过来的😂，除了强制跳转 HTTPS 之外，它们还可以让 Traefik Ingress 返回的 HTTP 响应包含特定的「安全头信息（Security Headers）」，对限制浏览器权限、保障用户浏览站点时的安全性有一定作用。

> 更多有关 Security Headers 的说明，可以参考 <https://securityheaders.com/>。

另外，值得注意的是 `kubernetes.io/tls-acme: "true"`，这条注解是为了配置自动申请证书使用，我使用的是 [cert-manager](https://github.com/jetstack/cert-manager)，它能够帮我解决「老大难」的 Let's Encrypt 证书申请、续期问题。在此不再展开，待有空时另开博客详细说明。

## Helmfile

不少人说 Helm 用于管理 Kubernetes 的 YAML，而 [Helmfile](https://github.com/roboll/helmfile) 就是用来管理 Helm 的 Helm... 😂

算是个比较形象，带有玩笑成分的比喻吧。Helmfile 的功能很多，以我现在的知识量无法一一列出；至少在部署我的博客的过程中，它可以提供以下帮助：

1. Helm v2 Tillerless（此处注明版本是因为 Helm v3 已经进入 Alpha 阶段，升级后完全取消 Tiller 概念，因此 Tillerless 暂不详述，有兴趣可自行 Google 了解）。
2. 输出 YAML 文件变更（通过 `helm-diff` 插件）。
3. 管理 Helm Chart 仓库，自动保持更新。
4. 最重要的一点 —— 通过环境变量覆盖特定 Values 的值。

在 [helmfile.yaml](https://github.com/wi1dcard/blog/blob/master/deploy/helmfile.yaml) 内可以查看到我的 Helmfile 配置，最主要的部分就是 `releases` 小节：

```yaml
releases:
  - name: blog # Helm Release 名称
    namespace: blog # 部署到的 Kubernetes 命名空间
    chart: ./chart # Helm Chart 的名称或本地路径
    values: # 覆盖 Chart 的默认 Values
      - image:
          tag: {{ requiredEnv "DOCKER_TAG" }}
        ingress:
          hosts:
            - host: {{ requiredEnv "INGRESS_HOST" }}
              paths: [ / ]
            - host: wi1dcard.dev
              paths: [ / ]
          tls:
            - secretName: ingress-tls
              hosts: [ {{ requiredEnv "INGRESS_HOST" }} ]
```

与 Helm 类似，Helmfile 会将 `helmfile.yaml` 作为 Go Template 渲染。如你所见，在以上片段中，我使用了 `{% raw %}{{ ... }}{% endraw %}` 语法和 `requiredEnv` 函数。

`requiredEnv` 是 Helmfile 提供的功能之一，能够获取指定环境变量的值，并参与模板渲染；例如 `{% raw %}{{ requiredEnv "INGRESS_HOST" }}{% endraw %}` 即为读取 `INGRESS_HOST` 变量。

配合覆盖 Chart 默认的 Values，便能够实现上文中提到的第「4」点。

## 持续交付（CD）

这样一来，借助于 Helmfile，我可以在 CI/CD 过程中灵活地控制部署的镜像（`$DOCKER_TAG`）、隐藏 CDN 背后的裸域名（`$INGRESS_HOST`）...

最后一步，CD。在 [deploy/deploy.sh](https://github.com/wi1dcard/blog/blob/master/deploy/deploy.sh) 中，我使用了 Helmfile 的官方镜像：

```bash
echo "Applying helm releases..."
docker run --rm -v "$PWD/deploy:/deploy" \
    -e HELM_TILLER_STORAGE=configmap \
    -e KUBECONFIG_BASE64="$KUBECONFIG_BASE64" \
    -e DOCKER_TAG="$DOCKER_TAG" \
    -e INGRESS_HOST="$INGRESS_HOST" \
    quay.io/roboll/helmfile:v0.82.0 /deploy/helmfile.sh
```

> 这不是规范的做法！若是后期迁移到类似 GitLab CI 等 Dockerized CI，那么只需要声明另一个 Job 即可，而不必自行启动容器。

在容器内，我使用了 [deploy/helmfile.sh](https://github.com/wi1dcard/blog/blob/master/deploy/helmfile.sh) 脚本；它除了帮我解码 `$KUBECONFIG_BASE64` 并填到 `~/.kube/config` 之外，只有两条命令与真正意义上的「部署」有关：

```bash
# 初始化 Helm，但不安装 Tiller。
helm init --client-only
# 部署。
helmfile -f deploy/helmfile.yaml apply --suppress-secrets
```

没错，到最后部署只剩下一行命令。其中：

- `-f deploy/helmfile.yaml` 用于指定 `helmfile.yaml` 的路径。
- `apply` 是 Helmfile 的子命令，直译为「应用」，你可以理解为「部署」。
- `--suppress-secrets` 表示隐藏 Secrets，避免密钥内容被直接输出到 CI 日志中。

## 最终效果

剩下的都交给 Helmfile、Helm、Kubernetes 就好。它们紧密协作，根据你的配置，最终将应用部署到集群中：

```
$ kubectl get pods -n blog

NAME                    READY   STATUS    RESTARTS   AGE
blog-74d758cb84-w5z9k   1/1     Running   0          21h
```

你可以在 [这里](https://travis-ci.com/wi1dcard/blog) 查看完整的构建和部署日志，以及 [历史](https://travis-ci.com/wi1dcard/blog/builds)。

以及我的博客：

```
$ curl -I https://wi1dcard.dev/

HTTP/2 200
date: Thu, 12 Sep 2019 13:05:37 GMT
content-type: text/html
...
x-powered-by: Wi1dcard Kubernetes Engine
```

😄

## 结语

首先感谢 Xiangxuan Liu（@nauxliu）在我学习 Kubernetes 过程中的帮助和指导，节省了大量试错成本，少绕了很多弯路，算得上是受益匪浅吧。<del>在公司不好意思说，就还是写在博客里吧... 咳咳。</del>

文中涉及的技术栈均取自（或衍生自）我司现有的 Kubernetes 相关技术，感兴趣的话，简历丢来吧：<https://join.rightcapital.com/>（虽然暂时不招 DevOps 😂，不过前后端都在招呀）。

最后，Kubernetes 是个非常繁复精美的项目，我最近刚刚入门；本文的目的并不是为大家提供详尽的参考，而是在我漫漫学习长路中的一些随笔记录吧。

当然，新手 ≠ 不追求专业，如文中有任何错误敬请指出，我会尽快修改。
