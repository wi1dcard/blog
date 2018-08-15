---
id: yii2-redirect-controller-in-module
date: 2018-07-13 15:56:08
title: Yii2 在模块内映射 Controller 到其它控制器
categories: tutorials
---

上文讲解关于如何映射 Action，本文讲解如何映射 Controller。

## 0x00 实现

首先，在你的 Module 里，定义一个 `$controllerRedirectMap` 变量。

```php
public $controllerRedirectMap = [];
```

重写 `createControllerByID` 方法。

```php
public function createControllerByID($id)
{
    if(isset($this->controllerRedirectMap[$id])) {
        $id = $this->controllerRedirectMap[$id];
    }
    return parent::createControllerByID($id);
}
```

## 0x01 用法

```php
public $controllerRedirectMap = [
    'foo' => 'bar' // 访问 `module/foo/index` 将会被重定向至 `module/bar/index`
    'foo/bar' => 'bar/foo' // 访问 `module/foo/bar/index` 将会被重定向至 `module/bar/foo/index`
];
```

## 0x02 感想

一口气写三篇关于 `Yii2` 的博文，算是对自己近期项目中用到 Yii 以来的技巧小结吧。