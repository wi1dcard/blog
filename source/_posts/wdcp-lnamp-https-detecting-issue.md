---
title: "修复 WDCP 面板无法判断 HTTPS 的问题"
date: 2018-05-29 14:27:08
id: wdcp-lnamp-https-detecting-issue
categories: WTF
---

> WDCP 面板默认采用 LNAMP 的结构，即 Nginx 处理静态页面，并转发动态脚本请求（如 PHP）到 Apache 处理。这在没有 PHP-FPM 的时代是个不错的选择，但若是配置不当，存在的问题也很明显，这就是一例。

## 0x00 背景

最近使用 Yii2 框架开发的过程中，发现在 WDCP 面板的环境下，Yii  自带的 `yii\web\Request::getIsSecureConnection` 并不能有效判断其是否是 HTTPS 请求。

## 0x01 猜测

凭直觉判断，是由于请求处理的过程中，HTTPS 证书解析在 Nginx 层面已经处理掉，没有转发给 Apache，并且可能由于 WDCP 面板配置不当导致转发时未携带 `HTTP_X_FORWARDED_PROTO` 协议头。

## 0x02 尝试

故查找 WDCP 配置，经过一番搜索，此 Nginx 配置文件位于：`/www/wdlinux/nginx/conf/naproxy.conf`。

在此文件内追加一行：

```
proxy_set_header X-Forwarded-Proto $scheme;
```

问题解决。

## 0x03 感慨

如今这时代，能用 PHP-FPM，还是别 N+A 了吧。出力不讨好。

N+A？！？为什么莫名想到……N卡A卡……