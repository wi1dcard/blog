---
id: macos-tree-command
date: 2018-09-05 15:19:28
title: macOS 利用 tree 命令展示目录结构
tags: [macOS, CLI]
---

废话不多说，展示效果。

```
wechatapp-rebuild
├── components/
├── core/
├── images/
├── pages/
├── utils/
├── README.md
├── app.js
├── app.json
├── app.wxss
└── project.config.json
```

## 0x00 安装

macOS 使用 tree 命令需要先进行安装。

```bash
brew install tree
```

## 0x01 使用

一如其它命令，使用 `tree --help` 可以查看帮助。

实现如上效果，只需要这样：

```bash
tree . -L 1 -F --dirsfirst
```

## 0x02 分解

- `.` 可替换为任意目录，包括当前目录下的子目录，也可以省略。
- `-L *` 表示层级，通常只展示项目目录结构第一层便可。
- `-F` 表示在文件夹后跟随 `/` 斜线。
- `--dirsfirst` 表示排序时将文件夹始终排在文件前面。

## 0x03 结语

利用 `awk` 还可实现自动补全每行结尾的空格，并追加 `//` 以方便编写注释。有兴趣可自行探索。
