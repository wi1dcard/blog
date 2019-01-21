---
id: convert-html-to-pdf-with-ci
date: 2019-01-21 09:20:23
title: 持续生成简历 PDF 并部署至七牛云
categories: Tutorials
---

大概想法：`转换我的简历 HTML 到 PDF` -> `将 PDF 部署到七牛云` -> `访客可直接下载最新版本 PDF 且与在线简历同步`。

以上过程均基于 Travis CI 实现，替换成其它亦可。平时我们提到的 CI/CD，而本例即为简易的 CD（`Continuous Delivery`）实例。

<!--more-->

## 编写 Travis 配置文件

```yml
services:
  - docker

before_script:
  - docker pull arachnysdocker/athenapdf
  - curl -v -o qshell.zip http://devtools.qiniu.com/qshell-v2.3.5.zip
  - ls -l qshell.zip
  - unzip qshell.zip
  - mv qshell_linux_x64 qshell

script:
  - docker run --rm -v $(pwd):/converted/ arachnysdocker/athenapdf athenapdf --margins=none https://wi1dcard.github.io/resume/ resume.pdf
  - ./qshell account $QINIU_AK $QINIU_SK [任选名称]
  - ./qshell fput [七牛 Bucket 名称] get-resume resume.pdf -w
```

以上，我使用了两个关键的工具。

- [athenapdf](https://github.com/arachnys/athenapdf)：一款官方提供 Docker 镜像、简单易用的 PDF 转换解决方案，可用于替代 `wkhtmltopdf`。
- [qshell](https://github.com/qiniu/qshell)：利用七牛文档上公开的 API 实现的一个方便开发者测试和使用七牛 API 服务的命令行工具。

在 `before_script` 中我拉取了 `athenapdf` 的官方 Docker 镜像，接着下载了 `qshell` 的发行包、解压并重命名。

在 `script` 中，我首先执行 `athenapdf` 转换我的在线简历 `https://wi1dcard.github.io/resume/` 为 `resume.pdf`。随后配置 `qshell` 所需的七牛云 AK、SK，该密钥对你可以在七牛云的管理页面生成。

注意这里我使用了 `$QINIU_AK` 和 `$QINIU_SK` 环境变量，这两个环境变量是在 Travis 的项目设置内配置好的，它们不会被显示在 CI 日志中，因此可以达到一定的保密效果。[点击这里](https://docs.travis-ci.com/user/environment-variables/#defining-variables-in-repository-settings) 可查看官方文档。

最后，使用 `qshell fput` 将文件上传至对象存储。其中，`get-resume` 是该文件（或者说，Object）的 Key，可以理解为 URI。而 `resume.pdf` 则是本地生成的简历 PDF 文件路径。

另外，`athenapdf` 的功能远不止简易的 CLI 工具，实际上它还提供了基于 Go 的微服务，也就是说可以独立运行为一台「PDF 转换」服务。有兴趣可查看项目页面的介绍。

## 改造 Hexo

默认情况下，Hexo 在生成站点时，会拷贝 source 目录下的普通文件到 public，但似乎 `.travis.yml` 不知为何（可能是 `Yaml` 也会被渲染吧），执行 `hexo generate` 不会复制该文件。

因为对 Hexo 的好感度本来也不高，前段时间还差点换掉它（然而其它静态博客没什么看着顺眼的主题），所以我没有对 Hexo 的运行过程进行深究，用了一个比较糙的解决方案。

根据 [Hexo 文档](https://hexo.io/docs/plugins.html#Script)，其会执行 `scripts` 目录内的所有脚本，可用于挂载事件来实现一些自定义功能。

> If your plugin is relatively simple, it’s recommended to use a script. All you need to do is put your JavaScript files in the scripts folder and Hexo will load them during initialization.

于是，创建 `scripts/cp-travis-configuration.js`：

```js
const fs = require('hexo-fs');

const log = require('hexo-log')({
    debug: false,
    silent: false
});

hexo.on('generateAfter', function () {
    fs.copyFile('source/.travis.yml', 'public/.travis.yml', function (err) {
        if (err) {
            throw err;
        } else {
            log.info('Travis CI configuration copied.');
        }
    });
});
```

非常简单粗暴地将文件拷贝过去。

## 结果

关于 Travis CI 的基础使用不再赘述。

以上，Git 提交后触发 CI 执行，即可通过七牛云融合 CDN 内配置的域名 + `get-resume` 来访问到我的简历啦。

例如：`http://your-domain/get-resume`。

## 弃坑

原因有二：

1. 垃圾七牛貌似没有对国外访问做良好的优化支持，以至于 CI 机器使用 CURL 下载时极其不稳定，动不动就无法拿到 `qshell`，而在 GitHub Releases 内又没有编译好的可执行文件。我已经提交 [Issue](https://github.com/qiniu/qshell/issues/224) 但不确定何时才会得到答复。唉，国内企业的通病。
2. 使用国内 CDN 域名要备案。还好我有一个多年前通过个人备案的域名，暂时能够撑一下，但不是长久之计。

目前，我已经重新配置 CI，回头再另写博文吧。
