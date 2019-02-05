---
id: self-hosted-snippet-service
tags: []
date: 2019-02-05 19:14:33
title: 动手搭建代码片段托管服务
categories: Recommendations
---

[snibox/snibox](https://github.com/snibox/snibox) 是一款使用 Ruby on Rails + Vuex 编写的代码片段托管服务。对于一线程序员来说，经常会接触到大量的代码片段（Snippet），上传到 Gist 无法完全 Private，而 Snibox 则是个不错的选择。

<!--more-->

## 效果

![](https://user-images.githubusercontent.com/312873/51252703-8e5ce500-19ad-11e9-88d4-89f4831aa9da.png)

另外，该项目还有个 [在线 Demo](https://snibox-demo.herokuapp.com/)，由于托管于免费的 Heroku 服务，所以首次访问可能需要大概 30 秒时间启动。

## 部署

Snibox 官方提供了一套 Docker 部署方案，包括 `dockerfile`、编排各项服务依赖的 `docker-compose.yml` 以及简易的 Setup 脚本；你可以在 [snibox/snibox-docker](https://github.com/snibox/snibox-docker) 下载到：

```bash
git clone
```

这里我使用 Git 将该仓库直接克隆，方便与远端同步。

在 README.md 文件内，它提供的启动命令是这样的：

```bash
./bin/setup
./bin/start
```

对于不明不白的脚本，我在执行之前都有先看代码的习惯，以免造成一些未知的影响（例如安装系统全局依赖、修改外部文件等）。

> 自从使用 Docker 之后，对所有的一键脚本都产生了莫名的恐惧和排斥😂。

于是经过观察发现，`bin/start` 内的脚本只有一行：

```bash
docker-compose up
```

没什么猫腻 —— 依照 `docker-compose.yml` 的配置启动容器。再来看 `bin/setup`：

```bash
# ...
echo "Copy .env.sample to .env:"
# ...
echo -e "\nInject secret key:"
# ...
echo -e "\nPull images:"
# ...
echo -e "\nCreate database:"
# ...
echo -e "\nRun migrations:"
# ...
echo -e "\n${GREEN}Setup completed!${NC}"
```

我摘选了一部分展示，从以上代码中大概可得知：该脚本主要帮我们执行了以下任务：

- 复制 `.env.sample`（类似 Laravel 的 `.env.example` 文件）到 `.env`。
- 写入 Secret Key（类似 Laravel 的 `php artisan key:generate` 命令）。
- 拉取 Docker 镜像。
- 创建数据库并执行迁移（类似 Laravel 的 `php artisan migrate`）。

看起来还是十分有帮助的，虽然我觉得写成辅助脚本不合适，而应该打包在 Docker 镜像内。

最后，再来看看 `docker-compose.yml`，最需要注意的是：

```yml
services:
  frontend:
    image: snibox/nginx-puma:1.13.8
    ports:
      - "8000:80" # 将镜像内 80 端口映射到宿主机 8000 端口
# ...
```

可通过修改 `8000` 为其它值来改变 Snibox 的访问端口，注意避免冲突。

最后，我们需要做的就是执行配置脚本并启动即可。

```bash
bin/setup
docker-compose up
```

个人更加倾向于使用原生的 `docker-compose up`，如需后台运行，则携带 `-d` 选项即可。

## 结语

该仓库暂时还存在一些小问题，目前我已经提交 PR：

- [Move "docker-compose pull" up.](https://github.com/snibox/snibox-docker/pull/4)
- [Fix wrong commands, support pass through arguments.](https://github.com/snibox/snibox-docker/pull/5)
