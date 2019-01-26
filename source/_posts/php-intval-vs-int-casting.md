---
id: php-intval-vs-int-casting
date: 2018-06-18 20:43:46
title: PHP intval() 与 (int) 转换的区别
categories: Tutorials
tags: [PHP]
---

说到字符串转整型，PHP 里常用的两个方法相信各位都有了解，但其中微小的区别缺鲜为人知。本文简单梳理，以备日后查阅。

## 功能

对于十进制的转换，两种方式的功能是完全一致的：

```php
$int = intval($str);
// 等价于
$int = (int) $str;
```

而 `intval()` 具备一个可选参数 `$base` 默认值为 `10`，用于转换不同来自进制的数据：

```php
$int = intval('0123', 8); // == 83
```

由这个参数，又引起另一条需要注意的点，先看例子：

```php
$test_int    = 12;
$test_float  = 12.8;
$test_string = "12";

echo (int) $test_int;         // == 12
echo (int) $test_float;       // == 12
echo (int) $test_string;      // == 12

echo intval($test_int, 8);    // == 12
echo intval($test_float, 8)   // == 12
echo intval($test_string, 8); // == 10
```

`intval()` 会将类型已经是 `int` 或 `float` 的数据当作「无需转换」而直接返回！

所以如上，`$test_int` 和 `$test_float` 并没有按照八进制转换，使用时一定需要注意避免踩坑。

## 性能

`(int)` 因为不走函数调用，所以性能上无论是理论还是实测，都略高于 `intval()`。

## 参考

PHP 官方手册：

- [PHP: 类型转换的判别 - Manual](http://php.net/manual/zh/language.types.type-juggling.php)
- [PHP: intval - Manual](http://php.net/manual/zh/function.intval.php)

其它：

- <https://stackoverflow.com/questions/1912599/is-there-any-particular-difference-between-intval-and-casting-to-int-int-x>
- <https://hakre.wordpress.com/2010/05/13/php-casting-vs-intval/>
