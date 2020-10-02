---
title: "Laravel 5.5 连接 MS SQL（SQL Server）数据库"
date: 2017-11-02 10:49:20
id: laravel-work-with-sql-server
tags: [PHP, Laravel]
---

因项目需要，要使用 Laravel 连接微软的 SQL Server，虽然这种组合显得非常奇葩，但经过测试还是可以成功实现的。

## 准备

首先，因为 Laravel 连接数据库默认是使用 PDO 扩展，而 PDO 连接 SQL Server 需要使用 pdo_dblib 扩展，所以首先第一步就是安装此扩展。

#### MAC 系统

直接使用 brew 命令安装即可。

![背后的Hardwell／2333](/resources/legacy/5b73a5a523533.png)

安装完成不要忘记`valet restart`。

#### 群晖 NAS

打开 WebStation，切换到 PHP 设置页面，选中 pdo_dblib 扩展，应用即可。

![](/resources/legacy/5b73a5a723b8e.png)

个人感觉，群晖 WebStation 做得还是蛮方便的。

## 开始

`laravel new`创建项目，laravel 5.5 在`config/database.php`自带 sqlsrv 的配置模板，因此判定应该能够直接支持，不需要第三方扩展包。

修改`.env`配置如下：

    DB_CONNECTION=sqlsrv
    DB_HOST=服务器地址
    DB_PORT=服务器端口
    DB_DATABASE=数据库名
    DB_USERNAME=用户名
    DB_PASSWORD=密码

## 见效

修改`routes/web.php`文件，使用 DB Facade 直接运行查询并打印：

    Route::get('/', function () {
        dd(DB::select('select * from he_Building'));
    });

运行：

![](/resources/legacy/5b73a5a7caf4c.png)

DONE！

## 后续问题

关于中文乱码问题，两篇较有价值参考文章：

[PHP 在类 Unix 环境下使用 PDO 连接 SQL Server 的问题](https://branchzero.com/tech/php-pdo-sql-server-problem.html)

[php 使用 dblib 扩展,连接 sqlserver 中文乱码问题](http://www.shuchengxian.com/article/643.html)
