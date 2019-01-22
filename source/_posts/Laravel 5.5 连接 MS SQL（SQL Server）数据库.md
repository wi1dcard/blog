---
title: "Laravel 5.5 连接 MS SQL（SQL Server）数据库"
date: 2017-11-02 10:49:20
id: laravel-work-with-sql-server
categories: Tutorials
---

因项目需要，要使用Laravel连接微软的SQL Server，虽然这种组合显得非常奇葩，但经过测试还是可以成功实现的。

## 准备

首先，因为Laravel连接数据库默认是使用PDO扩展，而PDO连接SQL Server需要使用pdo_dblib扩展，所以首先第一步就是安装此扩展。

#### MAC系统

直接使用brew命令安装即可。

![背后的Hardwell／2333](https://i.loli.net/2018/08/15/5b73a5a523533.png)

安装完成不要忘记`valet restart`。

#### 群晖NAS

打开WebStation，切换到PHP设置页面，选中pdo_dblib扩展，应用即可。

![](https://i.loli.net/2018/08/15/5b73a5a723b8e.png)

个人感觉，群晖WebStation做得还是蛮方便的。

## 开始

`laravel new`创建项目，laravel 5.5在`config/database.php`自带sqlsrv的配置模板，因此判定应该能够直接支持，不需要第三方扩展包。

修改`.env`配置如下：

    DB_CONNECTION=sqlsrv
    DB_HOST=服务器地址
    DB_PORT=服务器端口
    DB_DATABASE=数据库名
    DB_USERNAME=用户名
    DB_PASSWORD=密码

## 见效

修改`routes/web.php`文件，使用DB Facade直接运行查询并打印：

    Route::get('/', function () {
        dd(DB::select('select * from he_Building'));
    });

运行：

![](https://i.loli.net/2018/08/15/5b73a5a7caf4c.png)

DONE！

## 后续问题

关于中文乱码问题，两篇较有价值参考文章：

[PHP 在类 Unix 环境下使用 PDO 连接 SQL Server 的问题](https://branchzero.com/tech/php-pdo-sql-server-problem.html)

[php使用dblib扩展,连接sqlserver中文乱码问题](http://www.shuchengxian.com/article/643.html)