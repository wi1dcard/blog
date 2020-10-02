---
id: laravel-custom-migration-stub
date: 2018-08-28 13:33:16
title: Laravel 5.6 自定义迁移桩代码
tags: [PHP, Laravel]
---

书接上回，前面说到在迁移内给 `Blueprint` 增加自定义的 `Macro`。那么，当我们每次使用 `php artisan make:migration` 都需要手动修改一次模板吗？这不清真 = =。

## 0x00 思路

自定义 `make:migration` 所使用的 `stub`（「桩」，可以理解为模板）文件即可。

在开始之前，你首先需要创建属于你的 `stubs` 文件，我建议直接从 [Laravel 5.6 源码](https://github.com/laravel/framework/tree/5.6/src/Illuminate/Database/Migrations/stubs) 里拷贝一份进行修改即可。

## 0x01 实现

1. 创建一个 `MigrationCreator` 类，继承 `Illuminate\Database\Migrations\MigrationCreator`；并重写 `stubPath` 方法。

    ```php
    public function stubPath()
    {
        // 替换为你的 stubs 路径
        return app_path('stubs');
    }
    ```

2. 老样子，创建一个服务提供者并在 `config/app.php` 中注册，详细过程参见前一篇博文。

3. 你需要手动修改此服务提供者，继承 `Illuminate\Database\MigrationServiceProvider`。

4. 重写 `registerCreator` 方法。

    ```php
    protected function registerCreator()
    {
        $this->app->singleton('migration.creator', function ($app) {
            // 注意此处用到的 MigrationCreator 是最初自定义的
            return new MigrationCreator($app['files']);
        });
    }
    ```

5. 完成。

## 0x02 感想

从 Laravel 到 Yii 再回到 Laravel，感觉就像吃到了北方家里的饺子，真香警告（逃）。

不过其实两方是各有优势的。

个人感觉 Yii 来的更加简约直接，就像它的 [官方文档](https://www.yiiframework.com/doc/guide/2.0/zh-cn/intro-yii) 所说的：

> Yii 的代码简洁优雅，这是它的编程哲学。 它永远不会为了刻板地遵照某种设计模式而对代码进行过度的设计。

不过相比之下，我更喜欢 Laravel 繁复精致的优雅，正如 [Laravel 官网](https://laravel.com/) 的 Slogan：

> The PHP Framework For Web Artisans

😂努力做个艺术家吧。
