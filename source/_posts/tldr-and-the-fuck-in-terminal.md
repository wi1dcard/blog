---
id: tldr-and-the-fuck-in-terminal
tags: [CLI]
date: 2019-01-31 16:59:25
title: 命令行神器 - tldr 和 fuck
---

[tldr-pages/tldr-cpp-client](https://github.com/tldr-pages/tldr-cpp-client) 是 [tldr-pages/tldr](https://github.com/tldr-pages/tldr) 的 C++ 客户端实现。后者收集了一系列简化版本的命令说明手册，用于替代 `man` 命令；且项目由社区驱动，也就是说任何人都可以提交 PR 来完善它。

[nvbn/thefuck](https://github.com/nvbn/thefuck) 是一款基于 Python 编写的命令行工具，可快速修正（注意不是修复）前一条命令的用法错误，使报错的命令能够正常运行。

<!--more-->

这两款工具分别提供了 `tldr` 和 `fuck` 命令。

## tldr

> 关于 TL;DR 的含义参见 [本文](https://wi1dcard.dev/posts/github-abbrs-collection/)。

用过 `man` 命令的人，应该还记得被满屏选项以及零高亮支配的恐惧吧...

例如 `man tar`，你不得不读完几乎所有参数才知道「如何解压一个压缩包」，或是选择打开 Google 搜索。

对于需要精确调参的场景，`man` 提供的详细说明确实是实用的参考，但多数情况我们只是想要简单地完成某个常见任务，再去 Google 实在是太浪费时间，有没有什么办法能够在终端「一站式」搞定呢？来试试 `tldr` 吧：

![](https://github.com/tldr-pages/tldr/raw/master/screenshot.png)

简单明了的实践例子！即便再去看 `man tar` 也能够有针对性地阅读一些常用的选项。

该手册在 GitHub 有众多语言的客户端实现。我选择的是 C++ 版本，原因有二：官方维护，且几乎能够在任何机器上编译使用。在 macOS 中，使用 Brew 安装即可：

```bash
brew install tldr
```

你也可以参考项目主页选择适合你的版本。

## fuck

先看图：

![](https://raw.githubusercontent.com/nvbn/thefuck/master/example.gif)

居然还有这种东西的存在？！在我听说该项目的时候真的惊呆了😂。

该工具支持的命令非常多，在项目主页展示了很长的例子和列表；同时，你还可以创建自己的修正规则，只需几行 Python 代码即可。

需要注意的一点是，macOS 中使用 Brew 安装后需设置别名：

```bash
brew install thefuck
echo 'eval $(thefuck --alias)' >> .bash_profile # 或 .bashrc / .zshrc 等
```

或使用其它别名代替 `fuck`：

```bash
echo 'eval $(thefuck --alias f)' >> .bash_profile
```

随后再碰到报错，尝试下 `fuck` 带来的「心理」和「身体」上的双重爽快吧：

```bash
$ Error ...

WTF???

fuck!

$ ... Finished!
```

2333。
