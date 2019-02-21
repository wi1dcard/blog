---
id: change-terminal-title-in-zsh
tags: [Shell]
date: 2019-02-21 12:59:12
title: 在 Oh-My-Zsh 内设置命令行标题
categories: WTF
---

前些天给命令行设置标题遇到一奇葩问题，最终调试发现是 Oh-My-Zsh 的锅。

<!--more-->

在启用 Oh-My-Zsh 后，使用命令：

```bash
echo -e "\033];this is the title\007"
```

居然无法修改终端窗口标题？不过，仔细观察还是会注意到标题「闪」了一下，说明还是存在效果，只不过被某种「神秘力量」重设了回来，

最开始怀疑是不是 iTerm2 之类的锅，换成 Terminal 问题依旧。

随后开始尝试使用 `bash` 执行上文的命令，正常工作。因此问题应该出在 Zsh 周边。

于是使用 `zsh -d -f`（即不加载任何 RC 文件，最原始的 zsh）再次调试，可以正常工作。所以罪魁祸首应当就隐藏在 `~/.zshrc` 之中。

最终经过排查，发现是由于 Oh-My-Zsh 的一个名为 `Auto title` 的功能造成的，参考：<https://github.com/robbyrussell/oh-my-zsh/issues/5700>。

大致解决方案有两种：

1. 在 .zshrc 内写入环境变量 `DISABLE_AUTO_TITLE="true"`。
2. 因为我的最终目的是修改而非禁用，故亦可直接修改 `ZSH_THEME_TERM_TITLE_IDLE` 环境变量作为空闲时的标题，参考 [这段源码](https://github.com/robbyrussell/oh-my-zsh/blob/19b925e741fa46d2222210469a4dffc34a634ebd/lib/termsupport.zsh#L59)。

最终，我在 `~/.zshrc` 末尾加入一行：

```bash
ZSH_THEME_TERM_TITLE_IDLE="%~" # 将当前工作目录短路径设为终端标题
```

注意，以上语句应在 Oh-My-Zsh 载入之后，否则将会被 [这段源码](https://github.com/robbyrussell/oh-my-zsh/blob/19b925e741fa46d2222210469a4dffc34a634ebd/lib/termsupport.zsh#L45) 覆盖。

问题解决。
