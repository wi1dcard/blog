---
id: manage-hexo-themes-with-git-subtree
date: 2019-01-04 23:24:40
title: 使用 Git Subtree 管理 Hexo 主题
categories: WTF
tags: [Blogging, Git]
---

## 0x00 废话

🎉 Tada～ 博客焕新主题。

实在受不了原来那个主题了，尤其是在被我们公司 CTO 都嫌弃丑的情况下。再加上以下几个原因：

- 该主题 GitHub Repo 几乎停止维护，几周才鲜有几次 Commit。
- 从我开始使用该主题以来，开发中的 [Nexus](https://neko-dev.github.io/material-theme-docs/#/config_style?id=nexus%EF%BC%88%E5%BC%80%E5%8F%91%E4%B8%AD%EF%BC%89) 主题样式依旧在开发中，[2.0 版本](https://github.com/viosey/hexo-theme-material/tree/2.x-develop)也是一样。
- 配置项实在是太太太多了，多到经常改动一个地方就引起奇怪的问题，且对于配置文件的格式检查基本为零。
- 文档不明确，十分隐晦，内置功能众多但鱼龙混杂。
- 最近 [文档域名证书过期](https://github.com/viosey/hexo-theme-material/issues/698) 无法访问。
- ...

不能忍不能忍。一气之下开始了疯狂的迁移，经过几个小时的折腾基本完成，简历的排版也更加明朗了。

## 0x01 引子

当然这不是这篇文章的目的（<del>这么水的文我自己都不好意思发出来</del>），在切换主题的过程中发现一个问题。

原本我使用的是 [Material](https://github.com/viosey/hexo-theme-material)，该主题将配置文件 `_config.yml` 在仓库内命名为 `_config.template.yml`，且在 `.gitignore` 文件中忽略了 `_config.yml`。正如其官方文档所说：

> 为防止造成冲突，主题以 _config.template.yml 文件取代 _config.yml 文件，用以参考配置。 需要手动将 material 文件夹中的 _config.template.yml 复制一份并重命名为 _config.yml。

这给主题的使用者带来了极大的便利。我们 Git Clone 下来后，复制一份 `_config.template.yml` 到 `_config.yml`，随后便能够任意修改主题配置；同时也可以随意地切换主题仓库的分支、Pull 代码，不会影响到 `_config.yml` 文件。

这个设计让我想起 Laravel 的 `.env.example`，两者神似。

但是这次更换主题，切换为 [Indigo](https://github.com/yscoder/hexo-theme-indigo) 就没有这么幸运了。该主题并没有使用 `_config.template.yml` 的方式管理配置文件，而是直接在仓库内提交了一个固定的 `_config.yml`。

这就造成：

- 要么我 Clone 后永远不 Pull，这意味着无法自由地更新版本。
- 要么我就需要在每次更新时，先 Stash 再 Pull 再 Pop Stash。
- 或者干脆删除 `.git` 目录，采用传统下载、解压的方式更新（坑）。

另外，我使用 Git 来管理我的 Hexo 博客源码，由于该主题的仓库已经管理了 `_config.yml`，因此我在该配置文件所做的修改无法提交到我自己的博客仓库内，这让我内心十分没底。万一哪天电脑丢失，该配置文件就无法通过远端 Git 仓库找回了。

## 0x02 解决

目前我能想到的比较合适的解决方案，就是使用 `Git Subtree`。

与 Git Submodule 不同，在通过 Subtree 功能引入子仓库后，子仓库内的文件，依旧会原封不动地出现在本仓库内，就像 `cp` 过来的一样。或者你可以干脆就把它理解为复制，因为在文件系统而非 Git 的层面上来看，它的确就是 `cp` 了一份。

但是，Subtree 远远没有那么简单，Git 会在本仓库的提交记录内添加一条特殊的 Merge Commit；在以后更新 Subtree 的过程中，Git 便会去查找那次 Merge Commit，从而确定 Diff 的内容并应用。

由此，我可以先使用 Subtree 引入该主题到 `themes` 目录下，修改 `_config.yml` 文件后照样能够提交到我的博客仓库，且不影响我的下次 Pull，有冲突时手动 Merge 即可。

OK，说了这么多，来看看实际操作命令。

```bash
git subtree add \
    --prefix themes/indigo \
    git@github.com:yscoder/hexo-theme-indigo.git card \
    --squash
```

在以上例子中：

- `themes/indigo` 可以理解为引入的 Subtree 的存放路径；
- <code>git@github.com:yscoder/hexo-theme-indigo.git</code> 是该主题的 GitHub 仓库链接，
- `card` 是该主题仓库的特定分支名（例如通常为 `master`）
- `--squash` 表示压缩此 Subtree 此前的提交记录为单条，概念类似于 Git Rebase 时的 Squash。

以上，成功引入了该仓库 `card` 分支的代码到 `themes/indigo` 目录。

实际上，以上的 `card` 可以替换为任意 Git Ref，这个概念在使用 Git 时经常出现，可以是分支名、一次特定的提交哈希或是某个 Tag 的名字。

在后续更新代码时，使用 `git subtree pull` 命令即可。此处不再赘述。

## 0x03 后续...

更多关于 Subtree 的详细原理和操作，可以查看[这篇文章](https://www.atlassian.com/blog/git/alternatives-to-git-submodule-git-subtree)。

如果你有更好的解决方案，欢迎通过邮件或评论联系我。
