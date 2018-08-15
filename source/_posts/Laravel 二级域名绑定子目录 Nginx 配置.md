---
title: "Laravel 二级域名绑定子目录 Nginx 配置"
date: 2018-04-30 21:33:45
id: laravel-nginx-subdomains
categories: projects
---

二级域名绑定子目录 Nginx + PHP-FPM 配置，内置 Laravel 重写规则，可用于本地多项目开发。

本代码已托管至：<https://github.com/wi1dcard/laravel-nginx-subdomains>

## 使用说明

安装 `Nginx` + `PHP 7.1` + `PHP-FPM` 后覆盖本配置，并修改 `sites-available/default` 内 `server_name ~^(.*)\.jootu\.tech$;`。

例：将域名更换为：`demo.com`，则修改为 `server_name ~^(.*)\.demo\.com$;` 即可。
