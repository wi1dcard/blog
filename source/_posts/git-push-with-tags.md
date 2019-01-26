---
id: git-push-with-tags
date: 2018-09-07 09:18:53
title: Git 一次性推送提交和标签
categories: Snippets
tags: [Git]
---

> How to push commits and tags in git using the same command...

近期维护项目，有两个远程仓库，每次发布版本需要执行四条命令。

```
git push first
git push first --tags
git push second
git push second --tags
```

真要命。

经查询发现 Git 似乎暂时没有命令解决此场景，或许是怕引起歧义和混淆吧。

不过有个旁门左道，利用 Git 命令别名实现。

```bash
git config --global alias.p '!git push && git push --tags'
# or #
git config --global alias.pa '!git push --all && git push --tags'
```

然后就可以用：

```bash
git p
# or #
git pa
```

一条命令搞定啦。

参考：<https://stackoverflow.com/questions/19404436/git-push-and-git-push-tags-in-the-same-command>
