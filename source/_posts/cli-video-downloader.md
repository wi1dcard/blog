---
id: cli-video-downloader
tags: [CLI]
date: 2019-02-04 07:38:44
title: 在命令行下载第三方网站的视频
categories: Recommendations
---

[soimort/you-get](https://github.com/soimort/you-get) 和 [iawia002/annie](https://github.com/iawia002/annie) 是两款十分不错的命令行视频下载工具，支持大量第三方视频站。

<!--more-->

还记得多年前使用 Windows 的时候，维棠、硕鼠等等视频下载器享誉盛名，在圈子内无人不知无人不晓。

后来随着国内一大批类似 56 等视频网站的倒闭，以及版权政策原因，很多下载软件彻底停止更新。原本那些用电脑看视频的用户，也慢慢流向了手机、智能电视。

刚刚去官网查看这两款软件的更新状态，维棠停留在 `版本：2.1.4.1 （2017年11月01日）`，硕鼠停留在 `版本号: 0.4.8.1   [2017-07-30]`，真可谓时代的印记啊。

后来迁移到 macOS，虽说图方便经常直接手机看视频，有时还是有「下载」的需求的（比如某些看起来就会被查水表的视频🤔）。在摸爬滚打中找到了 `you-get` 和 `annie` 这两款开源的视频下载工具，分别使用 Python 和 Go 语言编写。

两款工具均可通过 Homebrew 进行安装：

```
brew install you-get
brew install annie
```

后者基于 Go，安装二进制包时零依赖，非常快。你可以通过 `brew info <formula>` 来查看详细信息。

这两款工具最「无障碍」的设计是：无需思考任何参数，直接丢一个链接就能下载。

```
you-get <url>
annie <url>
```

对于临时使用的工具性项目来说，我觉得这是个很伟大的设计；能够让用户不看文档、「无脑地」顺着自己日常的思维即可直接使用。

至于支持的网站，项目主页可供参考：

- [youget - supported-sites](https://github.com/soimort/you-get#supported-sites)
- [annie - supported-sites](https://github.com/iawia002/annie#supported-sites)

最后，两工具均提供强大的可选项，甚至支持自动转换格式，感兴趣的话去看看文档吧。
