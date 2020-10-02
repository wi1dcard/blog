---
id: php-array-map-instead-of-foreach
date: 2018-07-11 14:44:18
title: PHP 使用 array_map 替代 foreach
tags: [PHP]
---

讲个 PHP 的骚操作。论如何实现：把二维数组内某二维元素的值，单独提出来组成一维数组。

## 0x00 传统操作

```php
$pieces = [];
foreach($whole as $item)
{
    $pieces[] = $item['foo'];
}
return $pieces;
```

## 0x01 骚操作

```php
return array_map(
    function ($item) { return $item['foo']; },
    $whole
);
```

省掉两个变量（`$pieces`、`$item`），对于业务逻辑比较复杂的位置，省一个变量说不定就少死十个脑细胞...

> PHP 内，函数内部变量没有作用域之分，只有出函数后才会销毁。所以 `$item` 在匿名函数内是外部无法访问的。

## 0x02 拓展

`array_map` 其实还有不少用途，需要遍历数组每个元素的「值」的时候，都可以派上用场。

但需要遍历 Key => Value 形式的关联数组，该怎么操作呢？

```php
return array_map(
    function callback($k, $v) { ... },
    array_keys($array),
    $array
);
```

搞定。

## 0x03 参考

[PHP 文档 - array_map](http://php.net/manual/zh/function.array-map.php)

## 0xFF 感言

事实上，array_map 有点像 JavaScript 里的 `array.forEach`，.NET 里的 `List.Select`。

不过遗憾的是，没有 JS 那么骚的闭包、也没有 C# 那么吊的 lambda / linq，真是蓝瘦。
