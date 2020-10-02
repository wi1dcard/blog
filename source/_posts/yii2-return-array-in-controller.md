---
id: yii2-return-array-in-controller
date: 2018-07-13 12:01:36
title: Yii2 允许控制器内直接返回数组
tags: [PHP, Yii]
---

类似 Laravel 的效果：直接 `return` 数组输出 JSON 响应。办法有很多，目前我找到的最优解决方案如下。

```php
/**
* Enable JSON response if app returns Array or Object
*
* @return void
*/
protected function enableJsonResponse()
{
    $this->response->on(\yii\web\Response::EVENT_BEFORE_SEND,
        function ($event) {
            /** @var \yii\web\Response $response */
            $response = $event->sender;
            if (is_array($response->data) || is_object($response->data)) {
                $response->format = \yii\web\Response::FORMAT_JSON;
            }
        }
    );
}
```

或者在配置内定义也可以：

```php
'response' => [
    'on beforeSend' => function ($event) {
        // 回调函数代码如上，同理
    }
    // ...
]
```
