---
title: "Laravel + Swoole 实现 TCP-UDP Socket 服务端"
date: 2018-03-06 10:32:22
id: swoole-in-laravel
categories: Tutorials
---

> Laravel + Swoole 实现更快的请求处理速度、更高并发有扩展包可供选择，那么如何在 Laravel 框架内优雅地嵌入 Swoole 实现 TCP/UDP Socket 服务端呢？

本文源代码已托管至GitHub：[wi1dcard/swoole-in-laravel](https://github.com/wi1dcard/swoole-in-laravel)

## 0x00 Why

先说说为什么要嵌入 Laravel 吧。

就一个原因：

`Eloquent ORM`

物联网场景下，Swoole 作为与硬件对接的后端服务，接收到硬件发来的数据包后，多数情况需要直接入库，所以有一个方便易用的 ORM 就显得尤为重要重要。

而目前公司的情况，我们与Web端对接的后端框架是 Laravel；若是能结合一下，又能利用现成的数据模型，不需要再重复定义，岂不是美滋滋～

## 0x01 How

首先创建项目：`laravel new`

根据 [Server - Swoole文档](https://wiki.swoole.com/wiki/page/p-server.html)，「swoole_server只能用于php-cli环境」，而 Laravel 提供的 [Artisan 命令行](https://laravel-china.org/docs/laravel/5.5/artisan) 功能就是基于 PHP-CLI 的；

按照这个思路，我们可以创建一条名为`swoole:start`的 Artisan Command，不需要破坏框架原有结构，部署时只需要执行此命令启动 Swoole 服务端监听硬件通信端口即可。

## 0x01 Just do it！

### 创建命令类

```
php artisan make:command Swoole
```

其中，Swoole是类名。

### 修改必要参数

执行后会在`app/Console/Commands/`文件夹内创建一个与类名相同的 php 文件，这就是你的命令类。

```
    /**
     * 执行此命令时所需的命令名。
     *
     * @var string
     */
    protected $signature = 'swoole:start';

    /**
     * 此命令的描述。
     *
     * @var string
     */
    protected $description = 'Command description';
```

如上，你可以修改成员变量定义命令的名称和描述。

### 引用数据库门面或模型

使用 Artisan 创建的命令类默认是不引用数据库门面的，所以我们需要在文件头部加入：

```
use Illuminate\Support\Facades\DB;
//或者你可以 use 所需的 Model：
use App\User;
```

### 处理此命令

修改`handle`成员函数，此方法会在此命令被执行的时候调用，加入启动 Swoole 的代码即可。

```
    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $server = new \swoole_server("127.0.0.1", 9503);
        // 收到连接请求
        $server->on('connect', function ($server, $fd) {
            echo "connection open: {$fd}\n";
            //数据入库
            DB::table('users')->insert(
                ['username' => 'testu', 'password' => 'testp']
            );
        });
        // 收到数据包
        $server->on('receive', function ($server, $fd, $reactor_id, $data) {
            $server->send($fd, "Swoole: {$data}");
            $server->close($fd);
        });
        // 断开连接
        $server->on('close', function ($server, $fd) {
            echo "connection close: {$fd}\n";
        });
        // 启动服务
        $server->start();
    }
```

注意：`new \swoole_server(...);`不要忘记反斜线（\），这是表示在全局命名空间下的类，具体可查看 PHP 文档：[全局空间](http://php.net/manual/zh/language.namespaces.global.php)。

以上代码即可实现，客户端连接时立即向数据库加入一条记录。

### 启动

现在，命令行执行`php artisan swoole:start`，不会有任何输出，别担心，这是正常的，Swoole 已经启动了。

接着新打开一个命令行窗口，执行`telnet 127.0.0.1 9503`。

> Telnet 是一个类似 SSH 的东西，现在基本已经被淘汰，但 Telnet 客户端仍常用来测试 TCP 连接。更多关于 Telnet 的知识，可参考：[telnet命令](http://www.cnblogs.com/peida/archive/2013/03/13/2956992.html)

这时，可以看到执行 Artisan 命令的窗口会输出：

```
connection open: 1
```

检查数据库，数据成功插入。

完成！

## 0x02 More

### MacOS 安装 Telnet

`brew install telnet`

### MacOS 安装 Swoole

首先使用 `brew list | grep php` 查看你电脑上的 PHP 版本。

检索所有的 Swoole：

`brew search swoole`

根据不同 PHP 版本安装对应 Swoole 即可，我的电脑是`php71`，所以执行：

`brew install php71-swoole`

## 0x03 The End

有空会考虑封装个扩展包。

另外，贴几个开头提到的「利用 Swoole 处理 PHP 请求提升 Laravel 速度」的现成扩展包：

- [garveen/laravoole](https://github.com/garveen/laravoole)

- [scil/LaravelFly](https://github.com/scil/LaravelFly)

- [hhxsv5/laravel-s](https://github.com/hhxsv5/laravel-s)
