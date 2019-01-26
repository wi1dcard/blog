---
id: yii2-get-current-request-route
date: 2018-08-29 13:48:19
title: Yii2 获取当前请求的路由信息
categories: Collections
tags: [PHP, Yii]
---

如题，有两种方案实现。

方案一：

```php
Yii::$app->controller->route;
```

方案二：

```php
Yii::$app->requestedRoute
```

看过源码后才知道这俩的区别。

方案一是根据当前请求已创建的 module / controller / action，也就是实际处理当前请求的模块、控制器、方法所组合而成的路由，绝对规范。

方案二是根据 UrlManager::routeParam 等配置，解析请求 URL 取得的访问路由，不一定规范，但对用户可见。

通常情况下两种方法应该是等效的；某些特殊场景，例如修改过根据路由解析创建控制器的过程、内部反代重写过 URL 等，则有可能导致两方得到的值不一致。

根据不同业务场景使用不同的方法，对症下药。
