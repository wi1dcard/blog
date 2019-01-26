---
id: php-class-name-without-namespace
date: 2018-07-24 00:24:40
title: PHP 获取不带命名空间的类名
categories: Snippets
tags: [PHP]
---

方法很多，列出几个，以供参考。

- Laravel 源码里扒出来的 `class_basename` 辅助函数

    ```php
    basename(str_replace('\\', '/', $class));
    ```

- `substr` 实现

    ```php
    substr(strrchr($class, "\\"), 1);
    // or
    substr($class, strrpos($class, '\\') + 1);
    ```

- `explode` 实现

    ```php
    array_pop(explode('\\', $class));
    ```

- `ReflectionClass` 实现

    ```php
    (new \ReflectionClass($class))->getShortName();
    ```

其中，`ReflectionClass` 是最快最保险的方案，但此类必须实际存在，不存在则会抛出 `ReflectionException`: `Class \Foo\Bar does not exist`。
