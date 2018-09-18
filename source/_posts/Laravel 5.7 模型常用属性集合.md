---
id: laravel-eloquent-model-properties
date: 2018-09-18 09:15:25
title: Laravel 5.7 模型常用属性集合
categories: collections
---

Laravel 5.7 于前几天发布，迫不及待给正在开发的新项目做了升级。

在此整理一下模型常用属性，以备日后查询。

```php
$fillable = [
    '可批量填充的字段'
];

$guarded = [
    '与上相反'
];

$hidden = [
    '模型转换为数组时应当隐藏的字段'
];

$visable = [
    '与上相反'
];

$append = [
    '模型转换为数组时应当追加的虚拟字段' // 例如模型关系、访问器等
];

$attributes = [
    '字段名' => '字段默认值'
];

// 以下为扩展包使用的属性

// https://github.com/dwightwatson/validating
$rules = [
    '字段' => '模型自身验证规则'
];

// https://github.com/Askedio/laravel-soft-cascade
$softCascade = [
    '软删除时一并删除的关联'
];

// https://github.com/spatie/eloquent-sortable
$sortable = [
    'order_column_name' => 'order_column',
    'sort_when_creating' => true,
];

// https://github.com/nicolaslopezj/searchable
$searchable = [
    'columns' => [],
    'joins' => [],
];
```

