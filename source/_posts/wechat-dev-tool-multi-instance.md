---
id: wechat-dev-tool-multi-instance
date: 2018-07-06 09:32:42
title: 微信开发者工具 - 多用户多开实践
tags: [Node.js]
---

此方法截至本文发布时最新版本（1.02.1806120）有效。

### Step 1

复制一份微信开发者工具安装目录全部文件。

### Step 2

打开新目录，找到 `package.nw/package.json` 文件。

### Step 3

编辑此文件，新增一项 `"single-instance": false`，并修改 `name` 随便换个名字即可。

例如：

```json
{
    "single-instance": false,
    ...
    "name": "坑爹web开发者工具",
    ...
}
```

### Step 4

启动新目录下的微信开发者工具。

### 参考

<https://github.com/nwjs/nw.js/wiki/Manifest-format#single-instance>
