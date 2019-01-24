---
id: amh-loaded-mysql-module-twice
date: 2018-06-14 14:38:42
title: AMH 面板重复加载 MySQL 扩展
categories: WTF
---

真是天下没有不坑的面板... 相继宝塔和 WDCP 之后，AMH 也出了问题。

## 0x00 表象

报错如下：

`PHP Warning:  Module 'mysql' already loaded in Unknown on line 0`

`logs/amh-php-errors.log` 文件内也有偶尔出现的记录。

## 0x01 问题

经过 StackOverflow 一番查找，定位问题原因在于重复加载 MySQL 扩展，故查找环境配置文件进行删除。

打开对应环境的 `php.ini` 配置文件（通常位于 `/home/wwwroot/{env}/etc/amh-php.ini`），使用 `#` 或 `;` 注释 `extension=mysql.so` 此行即可。

## 0x02 后记

天下没有不坑的面板...

也没有不坑的云服务...

最近处理各种客户的各种云服务的各种系统各种面板真是踩一大堆坑，算是积累了宝贵的横向对比、问题处理经验。

各家存在着不同的优劣势，阿里工单回复慢、腾讯对象存储/CDN 烂、华为 IO 性能差……

回头自己尝试转微软吧，脱坑 Windows 再次入坑 Azure。

参考：<https://stackoverflow.com/questions/32764981/php-warning-module-already-loaded-in-unknown-on-line-0>