---
id: macos-convert-svg-to-png
date: 2018-09-06 20:44:12
title: macOS 转换 SVG 到 PNG
tags: [macOS, CLI]
---

论如何以程序员的方式，轻量、快速、优雅地转换 SVG 到 PNG。

## 0x00 问题描述

近期公司项目过程中，使用 Navicat 制作 E-R 图，为了快速进行头脑风暴，需要把关系图打印出来。

由于业务逻辑比较复杂，图片也越来越庞大。

最早尝试使用 `File` -> `Print as...` -> `PNG` 导出，但是后来发现其 DPI 比较低，而且在模型关系比较大的时候，导出的 PNG 会比较模糊。

后尝试导出至 `PDF`，但是 `Page setup` 最多只能设置 A0 大小，这样导出的 PDF 就会被分割为两页，还需要麻烦 UI 小姐姐合并。

最后还剩终极方案，就是 `SVG`，很不幸的是打印店的电脑没有 macOS 的字体，而且很卡很卡。

由此，问题被转化为：`SVG => PNG`。

方案其实有很多，谷歌一大把。简单列举几个。

- 在线转换。
- `AI`
- `Command` + `Shift` + `3` 截图。
- `Safari` / `Chrome` 打开再导出为图片。
- `qlmanage`
- `inkscape`
- `ImageMagick`
- ...

但都不太符合我的需求。

- 所谓轻量，AI 就算了，我可不是 UI 大佬。
- 所谓快速，装一大堆 Casks 也算了吧。
- 所谓优雅，透明、DPI 选项也不能缺。

考虑到公司项目保密性，在线转换也被 Pass。

## 0x01 Coder's Way

既然作为程序员同时又是个懒蛋，那就要用懒人 + 程序员的方式来解决这个问题。

经过一番尝试，最合适的方案是 `librsvg`。一行命令搞定。

`ImageMagick` 也是个不错的选择，但其内部的 SVG Render 引擎似乎支持不完全，转换时出现报错，[GitHub Issue](https://github.com/ImageMagick/ImageMagick/issues/974)；我的版本是 `7.0.8-11`，若有哪位大佬了解情况欢迎留言讨论，谢谢。

## 0x02 安装

```bash
brew install librsvg
```

## 0x03 使用

```bash
rsvg-convert --help
```

使用方法非常简单，参数看起来也不怎么高深，似乎很适合不熟悉图像处理领域的程序员们。

```bash
rsvg-convert -d 180 -p 180 test.svg > test.png
```

这里我增大一倍 DPI，让图片看起来很清晰。转换速度很快，实测 `11800 × 12698` 的图片在我的菜鸡 MacBook 上只需要三秒左右。

## 0xFF 结语

真实打印出来的 E-R 图足足有一面墙那么大... 可怕。
