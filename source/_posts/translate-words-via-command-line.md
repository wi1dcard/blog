---
id: translate-words-via-command-line
date: 2019-01-24 01:12:31
title: 程序员命令行查词好帮手
categories: Recommendations
tags: [Node.js]
---

[afc163/fanyi](https://github.com/afc163/fanyi) 是一款命令行查词工具。实用、美观，是我对它的第一印象。

<!--more-->

该工具实用 Node.js 编写，因此需要使用 `npm` 安装。

```bash
npm install fanyi -g
```

使用方法简单到不能再简单。

```bash
fanyi spark
# 或
fy spark
```

示例输出如下。

![](/resources/fc3d26b3906e203bacb492e537f86576.png)

在我的 macOS 上，查词的同时会将该词发音「读」出来，是的，通过声卡播放。

据项目文档描述，查词的数据来源是 <iciba.com>、<fanyi.youdao.com> 以及 <dictionaryapi.com>，且暂时只支持中英互译。

```bash
$ fanyi "for your information"
$ fanyi 和谐
$ fanyi 子非鱼焉知鱼之乐
```

最后，经过尝试，还是建议只用于 **英译中**，并且尽可能只查 **单词** 或 **常见搭配词组**，长句子是无法像 Google Translate 那样查出结果的。毕竟数据来源是「词典」，而非「翻译」。另外，读音的准确性、地域性也有待考量，有能力阅读音标的话，还是建议使用 <https://dictionary.cambridge.org/> 等专业词典比较合适。
