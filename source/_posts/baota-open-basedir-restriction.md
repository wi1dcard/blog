---
id: baota-open-basedir-restriction
date: 2018-06-13 10:18:52
title: 宝塔面板 PHP 打开文件失败原因排查
categories: WTF
---

近期在使用宝塔面板部署 PHP 项目时，上传文件的场景，PHP 无法对临时文件进行打开操作，无法计算`sha1`、`md5`，遂进行排查。

## 0x00 报错

`sha1_file(): open_basedir restriction in effect. File(/www/wwwroot/tmp/***) is not within the allowed path(s): (***)`

## 0x01 原因

新版宝塔面板创建站点时默认添加 `.user.ini`，文件内容如下：

```
open_basedir=/www/wwwroot/test.test/:/tmp/:/proc/
```

关于 `open_basedir` 环境变量，参见：<https://blog.csdn.net/fdipzone/article/details/54562656>。

## 0x02 解决

方案有二：

1. 删除 `.user.ini` 文件。
2. 在 `open_basedir=***` 后追加 `:` + 报错信息内文件所在目录，例如 `/www/wwwroot/tmp/***`。