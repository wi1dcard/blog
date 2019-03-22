---
id: automatic-learnku-deploy-bot
tags: [Blogging, Shell, CLI, PHP]
date: 2019-03-22 19:09:26
title: 我如何实现 Laravel-China 全自动系列文章发布
categories: Tutorials
---

在早期 [轻松部署 Laravel 应用](https://github.com/wi1dcard/laravel-deployment) 课程开始编写之前，就考虑到一个非常重要的问题：**如何保证 Laravel-China 上发布的文章与 GitHub 仓库内的 Markdown 源文件保持同步**？

<!--more-->

## 问题

最原始的办法是每次更新后 -> 找到对应文章的 URL -> 在网站上作出同样的修改。

但这个想法很快就被打消了。原因很多：

- 纯手工，容易产生操作失误。
- 费时费力的重复性无意义工作，耽搁主要生产力（编写内容）的输出。
- <del>懒</del>。

咳咳。

## 效果一览

最终决定完全自动化，力争一劳永逸。经过一段时间折腾，目前效果如下：

![](/resources/733fe61db97618c13971b44d5e5e5ed6.gif)

## 思路

结合自己多年前的抓包分析技能以及如今的 CI 技能，基本思路为：

1. 作出变更，`git commit` + `git push`
2. GitHub 通知 Travis CI
3. Travis CI 执行持续交付流程
   - **风格检查**
   - **发布文章**

通过以上的发布流程，不仅可以达到趋近实时的文章更新，还能够解决以下问题：

- 发布前确保行文规范，包括标点使用无误、中英文之间空格等；接到 PR 时也能自动检查，方便社区贡献。
- 发布前对内容预处理，例如去掉内容中的一级标题，插入固定简介、目录等。

前 2 步中 GitHub + Travis 的相关文章有很多，比如 [这篇博客](https://wi1dcard.cn/posts/convert-html-to-pdf-with-ci/)，在此暂不详述；接下来我将重点分析第 3 步的流程。

## 风格检查

我使用 [这篇博文](https://wi1dcard.cn/posts/lint-your-posts-with-ci/) 中介绍的 Lint-md 项目实现。为了方便 CI 使用，我还特意提交了一个 [Pull Request](https://github.com/hustcc/lint-md/pull/38)，用于支持 Docker 镜像。

具体代码非常简单，只有一行。你可以在 [这里](https://github.com/wi1dcard/laravel-deployment/blob/03c6ce2bd30a53c9c4f5ca3c5cb27e06c5630274/helpers/lint#L5) 找到：

```bash
docker run --rm -v $dir:/data yuque/lint-md lint-md -c /data/lint-md.json /data/src
```

熟悉 Docker 的话很容易读懂；若是不熟悉，你可以阅读 [这篇文章](https://learnku.com/articles/22822)。

其中，`$dir` 是项目根目录，`lint-md -c /data/lint-md.json /data/src` 便是普通的 Lint-md 使用方法。

## 发布文章

整套发布的流程比较复杂，可拆分为以下小步骤：

1. **使用长期 Cookies 换取临时 Cookies**
2. **获得 CSRF Token**
3. **拉取已发布的文章列表**
4. 遍历本地 Markdown 源文件列表
5. 根据本地文件名解析文章标题
6. 检索是否已发布，并取得文章 ID
7. 预处理文章内容（插入简介、拼接完整标题）
8. **将最终内容发布（创建或更新）**
9. 循环执行 5 - 8 直到遍历完成

其中，使用粗体标注的 1、2、3、8，需要与服务器进行通讯；不过我没有 Laravel-China 的接口，也不好意思麻烦 @Summer。所以干脆自己动手，丰衣足食 —— 利用 Chrome Developer Tool 的 Network 功能快速抓包，分析整理后使用 PHP 实现一款小工具，名为 [learnku-deploy-bot](https://github.com/wi1dcard/learnku-deploy-bot)，我暂时称它为「部署机器人」。

这个机器人可拆分为三大部分，你可以 Git Clone 源码后查看 `src` 目录：

- `Requests`：包含所有的 HTTP 请求定义，基于 [Buzz](https://github.com/kriswallsmith/Buzz)（一个兼容 PSR-7、PSR-17、PSR-18 的 HTTP 客户端）实现，你可以理解为 MVC 中的 Models。
- `Extractors`：包含所有的请求解析器，利用正则表达式等字符串处理方式提取文本；你可以理解为 MVC 中的 Views。
- `Commands`：包含所有的 CLI 命令都在这里，基于 Symfony 的 Console 扩展包实现；在这里实例化并发送 Requests，再交给 Extractors 提取需要的数据。你可以理解为 MVC 中的 Controllers。

对于用户（我自己😂）来说，只需关心公开的 Commands 即可，例如验证 Session 的 `session`，更新文章的 `article:update`；数据源 Requests 和 Extractors 由 Commands 进行统一调配。

> 由于是个人使用的小工具，所以设计比较简陋，许多地方并不完善，建议仅作学习使用。

为了提高可复用性，`learnku-deploy-bot` 并没有与课程有任何直接的关系；你可以把它理解为一个通用的 Laravel-China CLI 客户端。

至于剩下的 4、5、6、7、9，也就是和课程直接相关的发布流程，是使用 Bash 脚本实现，[源码](https://github.com/wi1dcard/laravel-deployment/blob/master/helpers/deploy) 与课程文件位于同一仓库；通过该脚本遍历文章，并调用部署机器人提供的 Commands，完成统一的课程发布工作。
