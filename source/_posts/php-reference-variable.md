---
id: php-reference-variable
date: 2018-08-06 10:33:41
title: PHP 引用详解 - 踩坑与妙用
categories: Tutorials
---

最近在关注「PHP 引用」这一话题，看过不少深度文章，对 PHP 里的「引用」有了更深的理解。

## 0x00

首先看如下代码：

```php
$foo['hello'] = '0';
$bar = &$foo['hello']; // 引用！
$tipi = $foo;
$tipi['hello'] = '1';

print_r($foo);
```

问：输出 0 还是输出 1？答案是 1。

原理何在？

PHP 内核使用 `zval` 结构存储变量，在 PHP 代码里，我们利用 `xdebug_debug_zval` 函数一探究竟。

修改如上代码：

```php
$foo['hello'] = '0';

xdebug_debug_zval('foo');
$bar = &$foo['hello']; // 引用！
xdebug_debug_zval('foo');

$tipi = $foo;
$tipi['hello'] = '1';

print_r($foo);
```

输出如下：

```
foo: (refcount=1, is_ref=0)=array ('hello' => (refcount=0, is_ref=0)='0')
foo: (refcount=1, is_ref=0)=array ('hello' => (refcount=2, is_ref=1)='0')
```

`$foo['hello']` 从非引用变量（`is_ref=0`）变为引用变量（`is_ref=1`），而引用计数则为 `refcount=2`。

为什么会这样？

根据 [PHP: 引用做什么 - Manual](http://php.net/manual/zh/language.references.whatdo.php) 的解释：

> `$a =& $b;` 这意味着 $a 和 $b 指向了同一个变量。
> 
> $a 和 $b 在这里是完全相同的，这并不是 $a 指向了 $b 或者相反，而是 $a 和 $b 指向了同一个地方。

结合我们的例子，也就是说，当 `$bar = &$foo['hello'];` 执行时，`$bar` 和 `$foo['hello']` 都成为了「引用变量」，且它们「指向了同一个地方」。

那么当我们复制此数组时，也复制了它 `hello` 元素的引用；当 `$tipi['hello'] = '1';` 执行时，就修改了 `tipi['hello']` 、`$foo['hello']` 以及 `$bar` 所指向的「同一个地方」。

于是，`$foo['hello']` 的值理所当然地成为了 `1`。

## 0x01

略有深入引用的 PHPer 应该都试过这种语法：

```php
for ($list as &$value) {
    $value = 'foo';
}
```

PHP 在控制结构后不会回收变量，此处不多讲解；于是刚刚的坑，其实可以延伸一下。

```php
$foo['hello'] = '0';
$foo['world'] = 'A';
foreach($foo as &$value) { // 引用！
    // Do nothing.
}
$tipi = $foo;
$tipi['hello'] = '1';
$tipi['world'] = 'B';
print_r($foo);
```

此处输出如下：

```
Array
(
    [hello] => 0
    [world] => B
)
```

`hello` 正常，而 `world` 被修改为 `B`！原因可以结合 `xdebug_debug_zval` 函数自行探究。

所以，随手 `unset($value);` 是个好习惯。

## 0x02

其实引用也不全是坑。好处还是大大地有。

举例：

```php
$catList = [
    '1' => ['id' => 1, 'name' => '颜色', 'parent_id' => 0],
    '2' => ['id' => 2, 'name' => '规格', 'parent_id' => 0],
    '3' => ['id' => 3, 'name' => '白色', 'parent_id' => 1],
    '4' => ['id' => 4, 'name' => '黑色', 'parent_id' => 1],
    '5' => ['id' => 5, 'name' => '大', 'parent_id' => 2],
    '6' => ['id' => 6, 'name' => '小', 'parent_id' => 2],
    '7' => ['id' => 7, 'name' => '黄色', 'parent_id' => 1],
];
```

如何实现将如上顺序表转换为层级树？

过去，或者说通常情况下我们首先想到的是递归回溯。

不过，利用 PHP 的引用特性，可以将时间复杂度降低到 `O(n)`。

```php
$treeData = [];
foreach ($catList as $item) {
    if (isset($catList[$item['parent_id']]) && !empty($catList[$item['parent_id']])) {
        // 子分类
        $catList[$item['parent_id']]['children'][] = &$catList[$item['id']];
    } else {
        // 一级分类
        $treeData[] = &$catList[$item['id']];
    }
}

var_export($treeData);
```

具体优化效果，请参考下一篇博文。

## 0xFF 参考

- [PHP: 引用的解释 - Manual](http://php.net/manual/zh/language.references.php)
- [PHP: 引用计数基本知识 - Manual](http://php.net/manual/zh/features.gc.refcounting-basics.php)
- [第六章 » 第六节 写时复制（Copy On Write） | TIPI: 深入理解 PHP 内核](http://www.php-internals.com/book/?p=chapt06/06-06-copy-on-write)
- [PHP 的引用，你知道多少 - 掘金](https://juejin.im/post/5a33320a5188252970793494)
- [深入理解 PHP 原理之变量分离/引用(Variables Separation) | 风雪之隅](http://www.laruence.com/2008/09/19/520.html)
