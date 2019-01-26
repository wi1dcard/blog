---
title: "Laravel5 和 Vue.js 优雅的 Nginx 重写规则"
date: 2017-09-26 14:42:31
id: laravel-vue-rewrite-rules
categories: Collections
tags: [Laravel, Nginx]
---

> 本文总结常用重写规则。

## Laravel 5

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

## Vue.js

<https://router.vuejs.org/zh-cn/essentials/history-mode.html>

```
location / {
  try_files $uri $uri/ /index.html;
}
```

## Yii 2

```
location / {
    try_files $uri $uri/ /index.php?$args;
}
```

apache .htaccess

```
Options +FollowSymLinks
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```
