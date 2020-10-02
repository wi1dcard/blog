---
id: taobao-tmall-crawller
date: 2018-10-15 15:44:34
title: 淘宝天猫商品信息简易爬虫
tags: [Node.js]
---

依赖 Node.js 解析 JSON 信息，几条 Bash 命令就能拿到商品信息了。

淘宝。

```bash
# 测试 URL
URL="https://item.taobao.com/item.htm?id=560121532731"

CODE=`curl -sS $URL | awk '/var g_config = {/,/};/' | iconv -f gbk -t utf-8`
echo "var location = {}; $CODE console.log (g_config)" | node
```

天猫。

```bash
# 测试 URL
URL="https://detail.tmall.com/item.htm?id=37769192030"

CODE=`curl -sS $URL | iconv -f gbk -t utf-8 | grep dsc.taobaocdn.com`
echo "var code= $CODE ; console.log (code)" | node
```
