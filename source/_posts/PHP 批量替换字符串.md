---
id: php-str-replace-in-associative-array
date: 2018-07-11 15:14:36
title: PHP 批量替换字符串
categories: Snippets
---

PHPer 们应该都知道 `str_replace` 函数，而如何使用数组批量替换某字符串内的子串，这里有个骚操作。

话不多说，直接上代码：

```php
$map = [
    'foo' => 'bar',
    // ...
];
$str = str_replace(array_keys($map), array_values($map), $str);
```