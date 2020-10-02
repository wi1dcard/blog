---
title: "Laravel 二级域名绑定子目录 Nginx 配置"
date: 2018-10-15 16:55:07
id: laravel-nginx-subdomains
tags: [PHP, Laravel, Nginx]
---

二级域名绑定子目录 Nginx + PHP-FPM 配置，内置 Laravel 重写规则，可用于本地多项目开发。

在 Nginx 的站点配置目录新增站点后，增加以下代码块即可。

```
server_name ~^(.*)\.laravel\.test$; # 正则二级域名
root /Users/jootu/web/$1/public;

index index.html index.htm index.php;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```
