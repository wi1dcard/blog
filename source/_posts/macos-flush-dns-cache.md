---
title: "macOS 清除 DNS 缓存命令"
date: 2017-10-10 15:45:43
id: macos-flush-dns-cache
categories: Snippets
tags: [macOS]
---

```bash
sudo killall -HUP mDNSResponder;sudo killall mDNSResponderHelper;sudo dscacheutil -flushcache
```
