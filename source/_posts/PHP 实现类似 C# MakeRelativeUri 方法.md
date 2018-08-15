---
title: 'PHP 实现类似 C# MakeRelativeUri 方法'
date: 2018-06-04 10:32:08
id: php-getting-releative-path
categories: snippets
---

在使用 C# 的过程中，几乎可以全程只靠 MSDN，很多方法微软在 .NET 内封装了很规范的实现；而近期在使用 PHP 开发项目时遇到个小问题：获取文件或目录 A 相对与 B 的路径，翻了下 PHP Manual 发现 PHP 内核并没有提供官方实现，于是谷歌之，找到一份比较规范的实现，在此记录，以备查询。

## 0x00 原文
<https://stackoverflow.com/questions/2637945/getting-relative-path-from-absolute-path-in-php>

## 0x01 代码

```php
function getRelativePath($from, $to)
{
    // some compatibility fixes for Windows paths
    $from = is_dir($from) ? rtrim($from, '\/') . '/' : $from;
    $to   = is_dir($to)   ? rtrim($to, '\/') . '/'   : $to;
    $from = str_replace('\\', '/', $from);
    $to   = str_replace('\\', '/', $to);

    $from     = explode('/', $from);
    $to       = explode('/', $to);
    $relPath  = $to;

    foreach($from as $depth => $dir) {
        // find first non-matching dir
        if($dir === $to[$depth]) {
            // ignore this directory
            array_shift($relPath);
        } else {
            // get number of remaining dirs to $from
            $remaining = count($from) - $depth;
            if($remaining > 1) {
                // add traversals up to first matching dir
                $padLength = (count($relPath) + $remaining - 1) * -1;
                $relPath = array_pad($relPath, $padLength, '..');
                break;
            } else {
                $relPath[0] = './' . $relPath[0];
            }
        }
    }
    return implode('/', $relPath);
}
```

## 0x02 用例

```php
$a="/home/a.php";
$b="/home/root/b/b.php";
echo getRelativePath($a,$b), PHP_EOL;  // ./root/b/b.php

$a="/home/apache/a/a.php";
$b="/home/root/b/b.php";
echo getRelativePath($a,$b), PHP_EOL; // ../../root/b/b.php

$a="/home/root/a/a.php";
$b="/home/apache/htdocs/b/en/b.php";
echo getRelativePath($a,$b), PHP_EOL; // ../../apache/htdocs/b/en/b.php

$a="/home/apache/htdocs/b/en/b.php";
$b="/home/root/a/a.php";
echo getRelativePath($a,$b), PHP_EOL; // ../../../../root/a/a.php
```

## 0x03 小结

居然还有人对几个回答做了总结对比和时间复杂度评测😂，真是666。