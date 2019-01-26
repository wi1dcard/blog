---
id: vscode-clear-workspace-storage
date: 2018-08-03 10:18:08
title: VS Code 清理工作区文件
categories: WTF
tags: []
---

前些天扫描大文件的时候，发现一个目录 `~/Library/Application Support/Code/User/workspaceStorage` 占用非常大，看起来罪魁祸首像是 VSCode；

于是谷歌一番，发现 GitHub 上有一条 Issue 讨论这事。

传送门：<https://github.com/Microsoft/vscode/issues/39692>

其中有一条 Comment 是这样的：

> All extension should be able to recreate their storage although they might answer some questions. @llv22 is there a folder that is especially big? Would be good to know if there is an extension leaving garbage behind.

大致意思是，所有的扩展都应该能重建这个文件夹，可能是某个扩展留了一堆垃圾文件在里面。

并且这个文件夹存储的逻辑是按照路径区分的...

所以这就导致：如果你有个很大的项目，VSCode 开了一堆扩展，写了一段时间然后把项目文件夹移动到其它路径，就有可能导致原来的垃圾留在那，现有的又继续开始堆。

看了下我自己的情况，是由于 PHP Intelephense 建立大量索引，并且动过项目文件夹导致的。

既然知道可以删，那就好办了。打开此文件夹，看一下修改时间，太老的直接删掉，完事儿。

另外顺手加到 Time Machine 排除列表，加快备份速度。
