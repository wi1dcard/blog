---
id: cli-weather-client
date: 2019-01-13 18:13:25
title: 命令行查询天气的正确方式
categories: Stared Repos
---

[chubin/wttr.in](https://github.com/chubin/wttr.in) 是一款面向命令行的天气预报服务，支持多种 HTTP 客户端进行请求，例如：`curl` / `httpie` / `wget` 等。该项目的官方描述便是：

> The right way to check the weather.

<!--more-->

使用方法非常简单，不需要安装额外的客户端；在任何具备 `curl` 的电脑上执行 `curl wttr.in` 即可。

例如：

![](/resources/legacy/5c3b136260d6a.png)

该项目将会通过 IP 判断你的物理地址，并展示实时以及未来的天气。其中 `?lang=zh` 用于设定语言参数为中文，默认语言为英文。

另外，官方在 README 内还给出了一个实实在在的「实时」图片例子：

![Weather Report](http://wttr.in/MyLocation.png)

你也可以通过指定参数来获取特定地点的天气，例如：

```bash
$ curl wttr.in/Beijing
$ curl wttr.in/北京
```

甚至可以通过 IATA 机场代码（由三位字母组成）来查询机场天气：

```bash
$ curl wttr.in/pek # 北京首都国际机场
$ curl wttr.in/sha # 上海虹桥国际机场
```

另外，如果你的 IP 来自美国（就像我最上面的截图那样），默认将会使用美国制的温度单位。你可以通过在结尾添加 `m` 或 `u` 参数来设定使用公制单位或美国单位，例如：

```
$ curl "wttr.in/Beijing?u"
$ curl "wttr.in/Beijing?m"
```

大概就是这样啦，感兴趣的话去官方页面看看吧。