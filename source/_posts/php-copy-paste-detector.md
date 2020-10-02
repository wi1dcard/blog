---
id: php-copy-paste-detector
date: 2018-07-04 11:12:14
title: "PHPCPD - 检查复制粘贴的 PHP 代码"
tags: [PHP]
---

最近突然对代码质量检查感兴趣，决定对公司项目的代码冗余进行彻查。经过搜索发现一款不错的工具，针对复制粘贴的代码有不错的识别率，在此推荐。

## 0x00 准备

项目地址：<https://github.com/sebastianbergmann/phpcpd>

## 0x01 安装

1. 直接下载代码包

```bash
wget https://phar.phpunit.de/phpcpd.phar
chmod +x phpcpd.phar
```

2. 或使用 Composer 全局安装

```bash
composer global require sebastian/phpcpd
```

## 0x02 使用

使用方法非常简单，只要带上代码文件夹路径即可。

```bash
php phpcpd.phar <PATH_TO_YOUR_SRC>
```

实际使用时遇到一个小问题，在分析大概 20w 行代码时，报错提示内存占用超出限制，解决方案：

```bash
php -d memory_limit=1024M phpcpd.phar <PATH_TO_YOUR_SRC>
```

如上。
