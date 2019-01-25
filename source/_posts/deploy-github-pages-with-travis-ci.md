---
id: deploy-github-pages-with-travis-ci
date: 2019-01-17 17:27:22
title: 使用 Travis 部署 GitHub Pages
categories: Documents
---

原来 Travis CI 官方一直提供着部署到 GitHub Pages 的方式...

那么那些扯蛋的教程可以一边玩去了。

<!--more-->

今天萌生一个想法，使用 `Travis CI` + `Qshell`（七牛云官方 CLI 客户端）实现每次部署博客，自动将简历 HTML 页面渲染成 PDF 并上传至七牛以供下载的功能。

在阅读 Travis 官方文档的时候偶然看到：

> More than running tests:
>
> deploy to [GitHub pages](https://docs.travis-ci.com/user/deployment/pages/)

进去发现 Travis 一直以来就提供了简易的 Deploy 集成，除了 Pages 还有 S3 等服务可以开箱即用。

然后又瞄了一眼 Travis 文档仓库的 [File History](https://github.com/travis-ci/docs-travis-ci-com/commits/master/user/deployment/pages.md)，发现... Emmmm。

原来这个功能一直都在，最早能追溯到 2016 年了。

阔怕阔怕。然鹅即使这样，网络上还流传着一大批乱七八糟「设置 SSH 密钥」、「手动进行 Commit 和 Push」 的中文教程（尤其百度）。简直害人不浅。

由此可见，不要相信野路子的奇葩教程，有能力还是阅读官方文档比较好。

越来越觉得日常科学上网是程序员的必备技能之一，尤其是在如今的大环境下。

另，今天看到一图，有点感想，记录一下：

![IMG_0737.PNG](/resources/legacy/5c404d85b2156.png)
![IMG_0738.PNG](/resources/legacy/5c404d85c24c3.png)
