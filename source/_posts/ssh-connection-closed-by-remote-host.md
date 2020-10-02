---
id: ssh-connection-closed-by-remote-host
date: 2018-06-22 10:54:00
title: "SSH 非活动连接被关闭"
tags: [Linux, macOS, RaspberryPi]
---

在使用 macOS 通过 SSH 连接到树莓派时，遇到 `Connection to *** closed by remote host.` 的问题，下面介绍两种解决方案。

## 指定 KeepAlive 参数

```
ssh -o TCPKeepAlive=yes {HOST}
```

## 修改 SSH 客户端配置

修改或创建 `~/.ssh/config` 文件：

```
KeepAlive yes
ServerAliveInterval 30
```
