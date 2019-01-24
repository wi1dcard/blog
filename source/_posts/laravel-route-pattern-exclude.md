---
id: laravel-route-pattern-exclude
date: 2018-08-18 01:52:37
title: Laravel 5.6 路由参数排除匹配
categories: Snippets
---

Laravel 提供 `where` 方法和 `Route::pattern` 方法，用于设置某个路由参数必须匹配指定表达式，则此路由才会被匹配。

那么，如何设置排除某个「关键词」（或者我们称它为「特殊参数值」），只有这个关键词不匹配，其它都匹配呢？

### 举个例子

```php
Route::domain('{user}.example.com');

Route::pattern('user', '???');
```

`???` 处代表二级域，通常不可以设置为一些敏感保留词，比如 `www` / `admin` 等。

### 解决方案

实际上，Laravel 的路由参数匹配，使用的正是正则表达式。所以，这就好办了。

根据业务逻辑，这里分两种情况。

- 全字匹配。
    
    例如，刚刚那种情况。`www` 肯定不可以，但包含 `www` 的字符串是可以的。

    正则：`.*(?<!^www)`

    如果需要匹配多个，可以：`.*(?<!^www|admin)`。

- 模糊匹配。

    例如，不能包含 `fuck` / `porn` 等，字符串何处都不允许包含此类关键词。

    正则：`((?!fuck).)*`

    同理，匹配多个：`((?!fuck|porn).)*`。

### 感言

近期又开始摸 Laravel，还是一如既往的性感。