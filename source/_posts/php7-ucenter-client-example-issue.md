---
title: "UCenter 1.6 Client Example 对 PHP7 兼容不良的排查与修复"
date: 2017-10-27 00:24:36
id: php7-ucenter-client-example-issue
categories: WTF
---

> 没错又踩坑了。
> 
> 因项目需要与 DZ 论坛实现 SSO 登录、账号同步等功能，经老司机波波推荐，直接使用 DZ 官方产品 UCenter 集成即可；于是陈晟&潘昭宇折腾了一天 UCenter，可还是遇到了过不去的“拦路虎”，于是接近下班之际，决定接手这个问题，不知不觉踏上了过节依旧加班的不归路。

## UCenter

UCenter 是原 DZ 团队（现已被腾讯收购）开发的一套统一认证系统（顾名思义：`User Center`），具体介绍参见：[百度百科](https://baike.baidu.com/item/UCenter/10757118)。这套产品已经非常有年头，以现在的眼光再来审视当时的架构确实存在不少问题，当然，这并不影响它具有历史价值。

先来说下 UCenter（下称`UC`）的大致架构吧，这是坑踩完之后总结出来的，为了不影响后续理解所以提前介绍。

> UC 有两端：server / client；
> 
> 其中，server 端维护一套自有的表结构，并提供 http api；
> 
> 而多个由用户（这里指基于 uc 的二次开发人员）实现的 client 端，通过调用 client sdk，可实现直接操作 server 端数据库或调用 http api 来写入、读取 user 数据，从而实现多 client 端维护同一份 user 数据副本。

那么，对于现有的应用（client），如何集成到 UC 而不需要修改表结构呢？

> UC 提供了一套 Server-->Client 类似“回调”的机制，我们只要参照其 client 端例子编写好符合其规范的 client，那么 server 端即可在收到其他 client 写库请求时，通知本 client；我们只要响应来自 server 端的请求，将用户写入原有逻辑数据库即可。
> 
> 这样即可实现不修改原有应用数据库，两套库“同步”的状态。

## 踩坑

作为一款相当有历史，且其团队近乎放弃维护的产品，避免不了有问题。

经过测试，client-->server 是没有问题的，按照文档（advanced/document）将 uc_client 目录（此目录即为 client 端 sdk）复制到 examples 文件夹下，并配置好 server 和 client 后，client 端 demo 可以正常查 user、写 user。

另外，这里要注意以下两个常量的设置，尤其是后者：

    define('UC_CONNECT', 'NULL');               // 连接 UCenter 的方式: mysql/NULL, 默认为空时为 fscoketopen()
    define('UC_API', 'http://111.*.*.107/uc_server');   // UCenter 的 URL 地址, 在调用头像时依赖此常量

在 UC_CONNECT 为 NULL 时，client-sdk 会通过 http post 方式与 server 端通讯，此时 http 请求的地址依赖于 UC_API 常量。

## 填坑

但，问题就出在 client 端接收 server 端回调的例子上。

根据文档，此例子位于：advanced/examples/api/uc.php，遂打开此文件，乍一看 300+行代码有点头大，不过耐心观察还是能摸到门道的。

此文件大概分为 4 部分：

1.  常量定义
2.  主程序
3.  uc_note 类定义（回调 API 的功能实现就在这里）
4.  一些辅助函数

打开 UC 服务端，配置好参数后提示通讯失败，后提示“正在连接...”就没有后续反应；根据网上的教程找到调用 uc.php 的具体参数值，带参数运行此文件，报错 500。

由此可以基本确定是代码存在问题，于是打开 php 的报错显示，并将 error_reporting 设置为 E_ALL，查看具体错误出现在什么位置。

首先，提示`set_magic_quotes_runtime`函数不存在，故查询 php 文档，发现一条明显的警告：

> Warning: This function was DEPRECATED in PHP 5.3.0, and REMOVED as of PHP 7.0.0.

问题找到，随即删除此行代码。在 PHP 5.3 就已经被弃用的函数，居然还写在例子中，可见此产品还真是有年头。

继续运行，依旧报错，这次的错误非常常见：`mysql_connect`函数不存在，也就是说代码里有某个地方采用了同样被弃用的 mysql 扩展……

经过搜索，发现是`advanced/examples/include/db_mysql.class.php`内采用了 mysql 系列函数；看了下代码量不多，当然也不算少，于是脑海中冒出一个“偷懒”的想法——去 dz 或者 uc 的目录看有没有使用 mysqli（PDO 就甭想了...）实现的 db_mysql 类文件，于是全局搜索，果然找到，二话不说直接替换，此报错消失。

> 注：由于只是测试所用，不需要操作数据库，故下方修改版 sdk 内的 uc.php 注释掉了数据库连接代码。

但问题依旧存在，又一个新的错误发生。说到这里我不禁想起一个段子：

![](/resources/legacy/5b73a5aaaf10e.jpg)

胜利在望，接着修 bug。

这次的报错是这一句：

    exit($uc_note->$get['action']($get, $post));

这就有点奇怪了，提示方法名（也就是$get['action']的值）必须是字符串，经过 var_dump 验证的确为字符串，隐约记得貌似 php7 对于动态调用函数的特性好像进行了修改，于是继续 google，发现此函数：`call_user_func`，随即修改代码为如下形态：

    echo call_user_func([$uc_note, $get['action']], $get, $post);
    exit;

与修改前代码预期同理，动态调用类实例的成员函数，具体用法请参见：[call_user_func](http://php.net/manual/zh/function.call-user-func.php)。

修改后再次运行，终于成功返回“1”，UC 服务端提示通信成功。

至此，client 端例子成功运行。

## 后记

除了本身的 bug，uc 提供的例子比较复杂，感觉有点绕，还需要较强的 php 功底才能理清思路，这就导致了一整天的还是没有搞定的坑...

对于第三方的组件、SDK，不要畏惧于看源码，刚开始阅读可能比较困难，但万万不能浮躁，静下心来一行一行理清思路，没见过的多谷歌，大部分问题都是可以靠自己解决的；而解决问题的过程给自己带来的学习和提升，比解决问题本身重要的多。