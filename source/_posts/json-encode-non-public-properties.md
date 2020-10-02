---
title: "json_encode() 序列化非公开属性"
date: 2018-06-08 10:56:00
id: json-encode-non-public-properties
tags: [PHP]
---

近期项目过程中，有一处场景需要使用 `json_encode` 方法序列化某对象内的 `protected` 属性。

## 0x00 实现

谈到 `json_encode` 自然想到 [`JsonSerializable` 接口](http://php.net/manual/en/jsonserializable.jsonserialize.php)，此接口提供一个抽象方法：

```php
abstract public mixed JsonSerializable::jsonSerialize ( void )
```

于是我们可以这样实现：

```php
class Foo implements \JsonSerializable
{
    public $fooProperty;

    protected $barProperty;

    public function jsonSerialize()
    {
        return [
            'fooProperty' => $this->fooProperty,
            'barProperty' => $this->barProperty,
        ];
    }
}
```

## 0x01 优雅

然而我并不满足如上的实现，感觉太不优雅——修改、增加属性都需要改两处，代码强迫症表示非常受不了。

后来经过 Google，发现 PHP 有个「神奇」的函数：`get_object_vars`，如上代码稍加修改即可：

```php
class Foo implements \JsonSerializable
{
    public $fooProperty;

    protected $barProperty;

    public function jsonSerialize()
    {
        return get_object_vars($this);
    }
}
```

完美！

## 0x02 小结

喜欢 PHP 的其中一个原因：由于原生的弱类型、Associate 数组等特性，支撑起不少这种看起来很「神奇」的函数的存在，对于本身比较喜欢遵循规范开发的 Coders 来说，相比 .NET 的「繁复优雅」，在业务层面有这些 Helpers 的加持，简直可以说如鱼得水，能够缩短不少开发周期。
