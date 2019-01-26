---
title: "树莓派折腾随手记 - 使用 apt-get 升级内置 Node.js"
date: 2018-02-28 18:41:17
id: raspberry-pi-upgrade-nodejs-via-apt
categories: Tutorials
tags: [RaspberryPi, Node.js]
---

> 网络上有不少安装 Node.js 和编译源码升级的教程，但在我手上的树莓派（系统版本：November 2017）已经内置 Node.js 4.x 版本。为了保持系统干净整洁，不想使用源码编译来更新，本文将讲解如何操作。

## 0x00 卸载

卸载原有 node.js 以及 npm。

```
sudo apt-get remove nodejs npm
sudo apt autoremove
```

## 0x01 安装

安装前，我们需要更新 apt 源为包含指定 node.js 版本的源；node 官网有最新的命令行，参见：
[Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

截止本文编写，node.js 稳定版本为 8.x，所以我们执行：

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

完成！
