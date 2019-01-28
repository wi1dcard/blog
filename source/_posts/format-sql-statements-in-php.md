---
id: format-sql-statements-in-php
date: 2019-01-10 21:27:06
title: 在 PHP 中格式化并高亮 SQL 语句
categories: Recommendations
tags: [PHP, Package, MySQL]
---

[jdorn/sql-formatter](https://github.com/jdorn/sql-formatter) 是一个轻量级的 PHP 类用于格式化 SQL 语句。

它支持自动进行缩进、添加换行，甚至还支持语法高亮。

<!--more-->

## 在命令行内使用

该扩展包包含一个 [bin/sql-formatter](https://github.com/jdorn/sql-formatter/blob/master/bin/sql-formatter) 可执行文件，可直接用于命令行格式化 SQL。

使用 Composer 全局安装后便可使用该命令了：

```bash
composer global require jdorn/sql-formatter

sql-formatter "SELECT SOME QUERY;" // 直接格式化

// 或

echo "SELECT SOME QUERY;" | sql-formatter // 使用管道，更适合较大量的 SQL 语句
```

## 作为扩展包使用

`SqlFormatter` 类包含一个名为 `format` 的静态方法，它可以接收一个 SQL 语句字符串作为参数，并返回格式化后使用 `pre` 标签包裹的 HTML 代码。

例如：

```php
<?php
require_once('SqlFormatter.php');

$query = "SELECT count(*),`Column1`,`Testing`, `Testing Three` FROM `Table1`
    WHERE Column1 = 'testing' AND ( (`Column2` = `Column3` OR Column4 >= NOW()) )
    GROUP BY Column1 ORDER BY Column3 DESC LIMIT 5,10";

echo SqlFormatter::format($query);
```

输出：

![](https://camo.githubusercontent.com/2038780833a43fc38dcfaccd556b01dd966fc890/687474703a2f2f6a646f726e2e6769746875622e636f6d2f73716c2d666f726d61747465722f666f726d61742d686967686c696768742e706e67)

## 只格式化不高亮

若是不需要高亮，只需要添加缩进和换行，请将第二个参数设置为 `false` 即可。

适用于输出错误日志或者其它非 HTML 数据时。

```php
<?php
echo SqlFormatter::format($query, false);
```

输出：

![](https://camo.githubusercontent.com/5bccd99143c464b2445336e787e328a5d247424d/687474703a2f2f6a646f726e2e6769746875622e636f6d2f73716c2d666f726d61747465722f666f726d61742e706e67)

## 只高亮不格式化

有个单独的方法名为 `highlight` 能够保证原有的格式不被改动，只添加语法高亮。

适用于 SQL 已经被良好格式化，需让它更加易读时。

![](https://camo.githubusercontent.com/4e7ecfac11c422abbbda79d8217404e1dd608699/687474703a2f2f6a646f726e2e6769746875622e636f6d2f73716c2d666f726d61747465722f686967686c696768742e706e67)

## 压缩查询语句

`compress` 方法可删除所有的 SQL 注释，并压缩不必要的空格。

适用于输出多条查询语句，并使其易于复制粘贴到命令行时。

```
-- This is a comment
    SELECT
    /* This is another comment
    On more than one line */
    Id #This is one final comment
    as temp, DateCreated as Created FROM MyTable;
```

```php
echo SqlFormatter::compress($query);
```

输出：

```
SELECT Id as temp, DateCreated as Created FROM MyTable;
```

## 删除注释

如果你需要保留原有格式，但仍需删除 SQL 注释，你可以使用 `removeComments` 方法来代替 `compress`。

```
-- This is a comment
    SELECT
    /* This is another comment
    On more than one line */
    Id #This is one final comment
    as temp, DateCreated as Created FROM MyTable;
```

```php
echo SqlFormatter::removeComments($query);
```

输出：

```

    SELECT

    Id
    as temp, DateCreated as Created FROM MyTable;
```

## 将多条 SQL 语句分割为数组

还有一个与格式化无关的特性，能够将多条 SQL 语句分离为数组。

例如：

```
DROP TABLE IF EXISTS MyTable;
CREATE TABLE MyTable ( id int );
INSERT INTO MyTable	(id)
	VALUES
	(1),(2),(3),(4);
SELECT * FROM MyTable;
```

```php
$queries = SqlFormatter::splitQuery($sql);
```

结果：

1. `DROP TABLE IF EXISTS MyTable;`
2. `CREATE TABLE MyTable ( id int );`
3. `INSERT INTO MyTable (id) VALUES (1),(2),(3),(4);`
4. `SELECT * FROM MyTable;`

## 为何不使用正则表达式？

去看看 README 吧～<https://github.com/jdorn/sql-formatter#why-not-regular-expressions>。
