---
title: "phpize 简易入门"
date: 2018-04-30 22:31:53
id: phpize-get-started
categories: tutorials
---

> 本文以安装 mongodb 扩展为例，简单讲解使用 phpize 给多版本 php 编译安装扩展。

## 0x00 准备

假设你的服务器有多个版本 php，你首先要找到对应版本 php 的 `phpize`、`php-config` 程序。通常它们与 php 所处目录相同。

![](https://jootu.org/zb_users/upload/2018/04/f21153df9b568c2c64d8c6029fe33b17.png)

接下来下载你的扩展源码包，多数扩展源码都能在 [github](https://github.com/) 或 [pecl](http://pecl.php.net/package/) 下载到。

这里我们下载 mongodb 扩展并解压：

```
wget http://pecl.php.net/get/mongodb-1.4.3.tgz
tar xvzf mongodb-1.4.3.tgz
```

国内主机可能会很慢，简易科学上网下载后 scp 传上去。

## 0x01 phpize

根据前面得到的 phpize 路径，在扩展的源码目录执行 phpize 命令即可：

```
cd mongodb-1.4.3
../../../bin/phpize
```

![](https://jootu.org/zb_users/upload/2018/04/364ffa5f3f04fa7176ab70f8886c2df4.png)

## 0x02 正常编译

执行如下命令即可。注意，`--with-php-config`参数需要正确填入 php-config 的路径。

```
./configure --with-php-config=/usr/local/php-7.2/bin/php-config
make
make install
```

正常输出：

![](https://jootu.org/zb_users/upload/2018/04/efbddca02108a2507a36a4116e269165.png)

记下这个目录，一会儿还要用到。

## 0x03 php.ini

修改对应的 php.ini 文件，加入此行：

```
extension=/usr/local/php-7.2/lib/php/extensions/no-debug-non-zts-20170718/mongodb.so
```

如果扩展比较多，建议整理一个比较容易找的目录（例如：`/usr/local/php/ext`等）专门存放。

最后，重启 php-fpm，写个 phpinfo 测试吧。

## 0x04 感言

尽量还是用 pecl 吧，优点：方便升级，也可以避免路径混乱，而且还省事。