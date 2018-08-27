---
id: laravel-blueprint-macro
date: 2018-08-28 02:41:00
title: Laravel 5.6 给 Blueprint 增加自定义方法
categories: snippets
---

PHP 基本功足够扎实的情况下，强烈建议学习 Laravel 的过程除了阅读官方文档外，仔细阅读框架源码；或许会有小惊喜哟。

## 0x00 准备

- Laravel 5.6
- `php artisan make:migration ...`

近期在项目过程中，遇到这么个需求：在所有模型表内都需要支持自增主键 `id`、创建时间、更新时间以及软删除，以备不时之需。

于是乎。传统的做法是，在每个迁移 `Schema::create` 回调内，都写一遍 `$table->increments` + `softDeletes` + `timestamps`，就像这样：

```php
Schema::create('foo', function (Blueprint $table) {
    $table->increments('id');
    $table->timestamps();
    $table->softDeletes();
});
```

随着表越来越多，重复代码也越来越多，对于我这个强迫症来说简直看着相当不爽😂；而且一旦需要修改就很坑，Git 提交记录也会很杂乱又低价值。

## 0x01 思路

最开始想到的方案是，继承 Schema Facade，重写 `create` 调用统一的回调函数加入这三个字段；但是这种方法具有侵入性，也就是说所有的表都必须带这三个字段，后期个别表如果有特殊需求就比较麻烦了。

于是乎去看了下 `Blueprint` 的源码，发现一个神器 `Macroable` trait，2333。

## 0x02 解决

首先定义一个服务提供者。

```bash
php artisan make:provider BlueprintMacroProvider
```

在此提供者的 `register` 方法内，创建 `Macro` 即可。

```php
// ...
public function register()
{
    Blueprint::macro('myColumns', function() {
        $table->increments('id');
        $table->timestamps();
        $table->softDeletes();
    });
}
```

在所有创建表的回调函数内，调用此 `Macro` 即可。于是上面的三行代码就变成了一行：

```php
Schema::create('foo', function (Blueprint $table) {
    $table->myColumns(); // 方法名就是我们定义 macro 时使用的第一个参数。
});
```

搞定，统一到 `myColumns` 里处理。

## 0x03 拓展

有兴趣可以看下 <https://laravel.com/docs/5.6/responses#response-macros>，这里有 Laravel HTTP Response 对于其 Macro 的介绍。实际上，Laravel 的响应也是同样使用 `Macroable` trait 实现的此功能。