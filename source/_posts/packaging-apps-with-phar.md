---
id: packaging-apps-with-phar
date: 2019-01-15 00:03:57
title: 将 PHP 应用快速打包为 PHAR
categories: Recommendations
tags: [PHP]
---

[humbug/box](https://github.com/humbug/box) 是一款快速的、零配置的 PHAR 打包工具。

还记得前些天的《[SMProxy,让你的数据库操作快三倍！](https://laravel-china.org/articles/19742)》吗，该项目的 PHAR 便是使用 Box 打包完成的。

<!--more-->

该项目是 [box-project/box2](https://github.com/box-project/box2) 的 Fork 分支，原项目已经不再维护。新项目的作者呼吁我们支持该 Fork。

Box 的可配置项有很多，为了能够快速帮助大家了解用法，接下来我将使用 [SMProxy](https://github.com/louislivi/SMProxy) 的 [box.json](https://github.com/louislivi/SMProxy/blob/master/box.json) 作为例子给大家做一个简单的介绍。

> 推荐一篇预备知识，可以帮你简单了解 PHAR 的部分用途：[使用 phar 上线你的代码包](https://segmentfault.com/a/1190000002166235)。

首先，正如 Box 作者的描述：

> Fast, zero config application bundler with PHARs.

我们默认无需任何配置，在你的 PHP 应用的根目录执行：

```bash
composer require humbug/box
vendor/bin/box compile
```

即可生成一个基本的 PHAR 包文件。

Box 的配置文件为应用根目录的 `box.json`，例如 SMProxy 项目的该文件内容为：

```json
{
    "main": "bin/SMProxy",
    "output": "SMProxy.phar",
    "directories": [
        "bin",
        "src"
    ],
    "finder": [
        {
            "notName": "/LICENSE|.*\\.md|.*\\.dist|composer\\.json|composer\\.lock/",
            "exclude": [
                "doc",
                "docs",
                "test",
                "test_old",
                "tests",
                "Tests",
                "vendor-bin"
            ],
            "in": "vendor"
        },
        {
            "name": "composer.json",
            "in": "."
        }
    ],
    "compression": "NONE",
    "compactors": [
        "KevinGH\\Box\\Compactor\\Json",
        "KevinGH\\Box\\Compactor\\Php"
    ],
    "git": "phar-version"
}
```

- `main` 用于设定应用的入口文件，也就是打包 PHAR 后，直接运行该 PHAR 包所执行的代码，你可以在某种意义上理解为 `index.php`。
- `output` 用于设定 PHAR 的输出文件，可以包含目录，相对路径或绝对路径。
- `directories` 用于指定打包的 PHP 源码目录。
- `finder` 配置相对比较复杂，底层是使用 `Symfony/Finder` 实现，与 PHP-CS-Fixer 的 Finder 规则类似。在以上例子中，包含两个 Finder；第一个定义在 `vendor` 文件夹内，排除指定名称的文件和目录；第二个表示包含应用根目录的 `composer.json`。
- `compression` 用于设定 PHAR 文件打包时使用的压缩算法。可选值有：`GZ`（最常用） / `BZ2` / `NONE`（默认）。但有一点需要注意：使用 `GZ` 要求运行 PHAR 的 PHP 环境已启用 Gzip 扩展，否则会造成报错。
- `compactors` 用于设定压缩器，但此处的压缩器不同于上文所介绍的 `compression`；一个压缩器类实例可压缩特定文件类型，降低文件大小，例如以下 Box 自带的压缩器：
  - `KevinGH\Box\Compactor\Json`：压缩 JSON 文件，去除空格和缩进等。
  - `KevinGH\Box\Compactor\Php`：压缩 PHP 文件，去除注释和 PHPDoc 等。
  - `KevinGH\Box\Compactor\PhpScoper`：使用 [humbug/php-scoper](https://github.com/humbug/php-scoper) 隔离代码。
- `git` 用于设定一个「占位符」，打包时将会扫描文件内是否含有此处定义的占位符，若存在将会替换为使用 Git 最新 Tag 和 Commit 生成的版本号（例如 `2.0.0` 或 `2.0.0@e558e33`）。你可以参考 [这里](https://github.com/louislivi/SMProxy/blob/246b8b04f0a32336a254442ce4a5b4cd8355d349/bin/bootstrap.php#L17) 的代码来更加深入地理解该用法。

我目前常用的配置大概就是这些，强力推荐看看官方的 [配置文档](https://github.com/humbug/box/blob/master/doc/configuration.md) 来了解更多的配置项、示例和默认值，以及它们的用法；思路清晰、简明扼要。

最后，推荐关注 SMProxy，英文文档和上文介绍的 PHAR 打包部分，基本都是由我完成，有任何疑问欢迎通过 Issue 联系。
