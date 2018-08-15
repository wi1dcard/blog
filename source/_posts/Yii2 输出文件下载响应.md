---
id: yii2-response-send-file
date: 2018-07-14 13:52:46
title: Yii2 输出文件下载响应
categories: snippets
---

最近为了尽可能优雅地实现产品需求，天天看 Yii 源码，感觉还是非常爽的。本文将要介绍如何使用 Yii 内置的方法，输出文件、流、字符串为下载响应。

通过查看 `yii\web\Response` 源码可知，其提供如下方法：

```php

public function sendFile($filePath, $attachmentName = null, $options = []);

public function sendContentAsFile($content, $attachmentName, $options = []);

public function sendStreamAsFile($handle, $attachmentName, $options = []);

```

那么如何在控制器内调用此方法输出呢？

两种方案：

```php
public function actionIndex()
{
    return \Yii::$app->getResponse()->sendFile(...); // `sendFile` 返回 self
}
```

或

```php
public function actionIndex()
{
    \Yii::$app->getResponse()->sendFile(...);
    return null; // or `return;` or do nothing.
}
```

> 根据 `yii\web\Application::handleRequest` 可知：Yii 会判断 action 返回值。
> 
> 若是 `yii\web\Response` 实例则直接返回给 `\yii\base\Application::run` 函数进行输出。
> 
> 否则判断其是否为 `null`，若是，则什么都不做；则我们设置的 `sendFile` 就会有效。