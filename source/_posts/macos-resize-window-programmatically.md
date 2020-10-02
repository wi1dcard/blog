---
id: macos-resize-window-programmatically
tags: [macOS, Shell, Reprinted]
date: 2019-03-08 20:30:23
title: 使用 AppleScript 精确地设置 macOS 窗口大小
---

博客又跳票一阵子，不过最近并没有闲着，而是把业余时间全部投入到了 [Laravel 部署课程](https://github.com/wi1dcard/laravel-deployment)。在写作时经常需要对窗口截图，为了提高阅读体验，需确保截图大小统一；因此如何让窗口 **快速** 地缩放为指定像素的 **精确** 大小，成了一个不可或缺的需求。

<!--more-->

经过一番谷歌，发现以下解决方案：

```
(*

This Apple script will resize any program window to an exact size and the window is then moved to the center of your screen.
Specify the program name, height and width below and run the script.

Written by Amit Agarwal on December 10, 2013

*)

set theApp to "Google Chrome"
set appHeight to 600
set appWidth to 1000

tell application "Finder"
	set screenResolution to bounds of window of desktop
end tell

set screenWidth to item 3 of screenResolution
set screenHeight to item 4 of screenResolution

tell application theApp
	activate
	reopen
	set yAxis to (screenHeight - appHeight) / 2 as integer
	set xAxis to (screenWidth - appWidth) / 2 as integer
	set the bounds of the first window to {xAxis, yAxis, appWidth + xAxis, appHeight + yAxis}
end tell
```

源代码修改自：<https://www.labnol.org/software/resize-mac-windows-to-specific-size/28345/>。

其中：

- `"Google Chrome"` 请替换为实际的应用名。
- `600` 与 `1000` 分别代表高度和宽度。

将以上内容保存为 `.scpt` 文件后，在终端内使用 `osascript` 命令即可运行：

```bash
osascript resize.scpt
```
