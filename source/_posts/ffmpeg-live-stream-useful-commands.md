---
title: "FFmpeg 直播推流常用命令总结"
date: 2018-03-06 22:03:47
id: ffmpeg-live-stream-useful-commands
categories: Collections
tags: []
---

> 总结部分 FFmpeg 常用命令行以备查询之用。

### 直推（H.264 + AAC）

`ffmpeg -re -i INPUT_FILE_NAME -c copy -f flv rtmp://localhost/live/STREAM_NAME`

### 转码推

`ffmpeg -re -i INPUT_FILE_NAME -c:v libx264 -preset superfast -tune zerolatency -c:a aac -f flv rtmp://localhost/live/STREAM_NAME`

### 转码推（改变音频采样率）

`-ar 44100`

### 转码推（改变视频宽高）

`-s 1280*720`

### 转码推（截取指定时间段）

`-ss 1:00:00 -t 00:00:10 -accurate_seek`（从 ss 开始截取 t）

### More...

[FFmpeg 常用推流命令](https://www.jianshu.com/p/d541b317f71c)
[使用 FFmpeg 将字幕文件集成到视频文件](http://www.yaosansi.com/post/ffmpeg-burn-subtitles-into-video/)
[potplayer 录制+ffmpeg 推流到直播间的方法！](https://www.bilibili.com/video/av9266440/)
[推流新技能，potplayer+ffmpeg](http://blog.sina.com.cn/s/blog_4618a6280102xf68.html)
