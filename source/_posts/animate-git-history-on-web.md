---
id: animate-git-history-on-web
tags: [Git]
date: 2019-02-11 14:17:27
title: 快速直观地查看 Git 文件历史
categories: Recommendations
---

查看 Git 提交历史的工具千千万，无论是 CLI 还是 GUI。而 [pomber/git-history](https://github.com/pomber/git-history) 则是一款能够以动画形式快速、直观地展现 Git 仓库内文件变动历史的 Web 工具。

<!--more-->

惯例，先来看看效果吧：

![](https://user-images.githubusercontent.com/1911623/52460615-f3899d80-2b49-11e9-8c21-06af4097a527.gif)

你也可以 [亲自试试看](https://github.githistory.xyz/babel/babel/blob/master/packages/babel-core/test/browserify.js)。

相比于主流的 Blame / Annotation，这种方式可以更加 **迅速直观** 地查看历史提交对于文件的变动影响。

该作者除了将仓库开源外，还将项目托管在了 <https://githistory.xyz/>。我们可以打开 GitHub 上的任意文件，然后将域名 `github.com` 替换为 `github.githistory.xyz` 即可使用。

似乎还是有些麻烦，域名比较长，若是短一些就更棒了；而且直接在地址栏修改域名通常没有补全，比较痛苦。

该项目给出另一个方案：[Chrome Extension](https://chrome.google.com/webstore/detail/git-history-browser-exten/laghnmifffncfonaoffcndocllegejnf) 在此，效果如下：

![](https://lh3.googleusercontent.com/HAj-a2L8H7N2Iv37SkALd40VxBl44xWhasE6XtdZW5ZgK8Sx4neBEotqGbRtnE7BYpa3cZxwoO0)

以上。
