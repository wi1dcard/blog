---
id: upgrade-mysql-5.7-to-8.0
date: 2018-06-16 00:30:13
title: 升级 MySQL 5.7 到 8.0 遇到的坑
categories: WTF
tags: [MySQL]
---

前几天手贱啥也没看执行 `brew upgrade`，随后就后悔了... 凡事没有一帆风顺，在此总结升级经验，以供后人参考。

## 0x00

场景：执行 `mysql.server start` 提示 `The server quit without updating PID file mysql.server start`。

解决：

1. `cd /usr/local/var/mysql/`，切换到 MySQL 数据目录（macOS 使用 brew 安装的 MySQL 默认数据存储路径如上）。
2. `rm *.err *.pid`，删除原 PID 和 ERR 文件。
3. `rm ib_logfile*`，删除原 logfile。

再次尝试，如仍旧报错，可尝试：

1. `cd /usr/local/Cellar/mysql/{5.*}/bin`，切换到旧版本 MySQL 目录（macOS 使用 brew 安装的 MySQL 默认路径如上）。
2. `./mysql.server start && ./mysql.server stop`，尝试启动并正常结束。

再次启动新版本服务器，即正常。

## 0x01

场景：`mysql -uroot` 进入数据库后，`show databases;` 提示 `ERROR 1449 (HY000): The user specified as a definer ('mysql.infoschema'@'localhost') does not exist`。

解决：执行 `mysql_upgrade -u root -p` 即可。

## 0x02

场景：设置 `sql_mode` 提示 `SQLSTATE[42000]: Syntax error or access violation: 1231 Variable 'sql_mode' can't be set to the value of 'NO_AUTO_CREATE_USER'`。

解决：MySQL 8.0 已废除模式，移除 `NO_AUTO_CREATE_USER` 即可。

## 0xFF 更多...

- <https://www.shiqidu.com/d/358>
- <https://laravel-china.org/articles/10736/some-craters-in-mysql-8011>
- <https://kn007.net/topics/the-road-to-mysql-8-0-11-update/>
