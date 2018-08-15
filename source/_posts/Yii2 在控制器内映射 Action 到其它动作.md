---
id: yii2-redirect-action-in-controller
date: 2018-07-13 12:02:50
title: Yii2 在控制器内映射 Action 到其它动作
categories: tutorials
---

本文讲解：如何把控制器内的任意一个 Action 映射到另一个 Action。

## 0x00 准备

- `Yii ^ 2.0.7`

## 0x01 代码

首先定义一个 `RedirectAction` 类。

```php
class RedirectAction
{
    protected $actionId;

    public function __construct($actionId)
    {
        $this->actionId = $actionId;
    }

    public function __invoke($id, \yii\base\Controller $controller)
    {
        return $controller->createAction($this->actionId);
    }
}
```

接着在控制器内重写实现 `actions()` 方法，用于映射 `Action ID => 实际的动作`。

```php
class Controller
{
    public function actions()
    {
        return [
            'foo' => new RedirectAction('bar'), // 访问 `module/controller/foo` 将会被重定向至 `actionBar` 方法
            // ...
        ];
    }

    public function actionBar()
    {
        return 'bar';
    }
}
```

完成。

## 0xFF 感想

回头再看 Laravel，真心感激 Laravel 的自定义路由...