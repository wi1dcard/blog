---
title: "Chrome 占用.dev 域名后缀导致 Valet 失效的解决方案"
date: 2018-02-04 19:53:26
id: chrome-to-force-https-valet-domain
categories: WTF
---

前段时间谷歌把 .dev 买了，我有所耳闻，但这段时间一直没有做 Web 开发，今天忽然发现 ***.dev 打不开了，故排查原因。

### 0x01

最开始意味是 dnsmasq 挂了，经过一番谷歌和 ping 检查，发现能够正常解析到 127.0.0.1。

[Valet (Laravel): DNS address can not be found](https://stackoverflow.com/questions/37172691/valet-laravel-dns-address-can-not-be-found/37174256)

### 0x02

搞到这突然想起来前些日子的事情，原来是谷歌“惹的祸”。随即继续“谷歌”一番来解决它自己惹的祸。

[Chrome to force https on .dev](https://github.com/laravel/valet/issues/434#issuecomment-331304899)

找到官方解决方案，使用命令：`valet domain ***`，即可替换原有域名后缀。

![](/resources/legacy/5b73a616c2e43.png)

如图，我将域名后缀修改为`.localhost`，随即 valet 自动重启，问题解决。

后记：输错两次密码有点尬。
