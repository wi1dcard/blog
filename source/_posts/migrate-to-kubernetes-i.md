---
id: migrate-to-kubernetes-i
tags: [Blogging, CI/CD, Docker]
date: 2019-09-11 22:06:15
title: 我如何将博客迁移到 Kubernetes - I
categories: Tutorials
---

最近 Kubernetes 的发展，以及在我司的大量应用，自己也迫不及待想要尝尝鲜，虽然我的博客是基于 Hexo 的纯静态站点，但这并不能阻挡我把它迁移上 Kubernetes！毕竟... 相比于 GitHub Pages 灵活性更好可控性更高，emmmm... 好了我编不下去了，总之，生命在于折腾😂，我们开始吧。

<!--more-->

> 本文涉及的代码（也就是我的博客）完全开源：<https://github.com/wi1dcard/blog>。

## 构建 Docker 镜像

要上 Kubernetes，首先要做的就是给项目打包镜像。Dockerfile 非常简单：

```dockerfile
# 采用 nginx:stable-alpine 作为基础镜像
FROM nginx:stable-alpine
# 复制 ./public 到镜像内 /usr/share/nginx/html
COPY ./public /usr/share/nginx/html
# 提示暴露 TCP 协议 80 端口
EXPOSE 80/tcp
```

我选用 Docker Hub 作为 Docker Registry，如果你有私有项目、权限控制等相关需求，[Quay.io](https://quay.io/) 或许是更好的选择。

## CI 构建

当然啦，构建这种事情肯定是交给 CI。不推荐每次变更手动 Build，费时费力易出错。

目前我给博客用的是 Travis CI。我也考虑过：

- Circle CI，试用后感觉配置文件（以我个人的风格来看）有点反直觉，放弃。
- GitLab CI，目前我认为最好的 CI/CD，我具备 CI/CD 需求的私人项目都在 GitLab。但是考虑到 (1) 要将博客代码开源，(2) GitLab CI for GitHub repos 需要付费，(3) 两套 VCS 感觉怪怪的，因此放弃。
- GitHub Actions，正在 Beta 中，打败各路 CI/CD 的种子选手之一。只可惜文档还不够齐全，稳定欠佳，只好暂时放弃。
- Docker Hub，若是只用来构建公开镜像感觉还不错，但 (1) CI 和 Docker Registry 强绑定，想要换 Registry（比如上文中提到的 Quay.io）会很繁琐，(2) 构建速度巨慢... 慢... 慢... 大概是用户太多吧，情有可原，(3) 镜像打包完成后需要使用 Helm 部署（即 CD）到集群，明显不适合该场景。

你可以在 [这里](https://github.com/wi1dcard/blog/blob/master/.travis.yml) 找到我的 Travis 配置。其中定义了三个环境变量：

```yaml
env:
  global:
    - DOCKER_USERNAME=wi1dcard # 我的 Docker Hub 用户名
    - DOCKER_IMAGE=$DOCKER_USERNAME/blog # Docker 镜像名
    - DOCKER_TAG=build-$TRAVIS_BUILD_NUMBER # Docker 镜像 Tag
```

这些变量会在之后用到。

> 注意 `$DOCKER_TAG`，它的值是动态的，即每次构建都会变化，由 Travis CI 的 [预定义环境变量](https://docs.travis-ci.com/user/environment-variables/#default-environment-variables) 拼接而成。

在 `before_script` 内，定义了构建过程的脚本：

```yaml
before_script:
  - build/build.sh
```

由于构建、发布过程比较复杂，同时为了未来（可能）迁移到 GitLab CI，我没有将所有脚本罗列在 `.travis.yml` 里，像 [alipay-sdk-php](https://github.com/wi1dcard/alipay-sdk-php) 等开源项目那样。

所有与 CI 相关的内容我都放在了 `build/` 目录。

[build/build.sh](https://github.com/wi1dcard/blog/blob/master/build/build.sh) 的主要任务是：

- 安装依赖，例如 Hexo。
- 执行 [lint](https://en.wikipedia.org/wiki/Lint_(software)) 过程，检查 Markdown 语法等。
- 渲染静态站点，生成 PDF 格式简历。
- 构建 Docker 镜像。

## 发布 Docker 镜像

与 CD 相关的内容我放在了 `deploy/` 目录。正如 `.travis.yml` 定义的那样，部署脚本位于 [deploy/deploy.sh](https://github.com/wi1dcard/blog/blob/master/deploy/deploy.sh)：

```yaml
script:
  - deploy/deploy.sh
```

首先，登录 Docker Hub，接着推送镜像：

```bash
echo "Logging in Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

echo "Pushing images to Docker Hub..."
docker push "$DOCKER_IMAGE"
```

注意，这里用到了之前定义的环境变量。其中，`$DOCKER_PASSWORD` 我定义在 Travis CI 的私有环境变量内：

![](/resources/26b151e436bfc29717c1d9919eefbcc0.png)

还有两个环境变量 `INGRESS_HOST` 和 `KUBECONFIG_BASE64` 稍后会用到。

## 关于 Immutable

你可以在 [这里](https://hub.docker.com/r/wi1dcard/blog/tags) 查看推送的镜像和 Tags。

还记得 `$DOCKER_TAG` 的值是动态的吗，所以每次 CI 构建产生的镜像都会有唯一的 Tag 与它的 Build ID 对应。

这对我来说好处显而易见：

1. Immutable。每次构建的镜像就像 Git Commit 一样留下不可变更的印记。
2. 清晰明了，不易混淆。你无法快速得知当前 `lastet` 具体是哪一次构建的产物。
3. 便于回滚。虽然你可以重新构建镜像，但如果你将每次构建的镜像保留，那么就可以快速地、完美地回滚到任意版本（尤其能够防止同一 Git Commit 多次 Build 产生不同的 Image）。
4. ...

> 其实，做了一年运维之后我发现，有时候混淆比「我不知道」更可怕。一些隐性的声明可能会导致你在某个极小的问题上，毫无意义地浪费一整天时间。因此如果某些时候「简洁优雅」和「清晰明了」产生冲突的时候，我会毫不犹豫选择 **清晰明了** 地显式声明，尽管现在看起来可能有点丑，但未来调试的时候可能会帮上大忙。

（未完待续）
