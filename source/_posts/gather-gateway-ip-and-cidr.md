---
id: gather-gateway-ip-and-cidr
tags: [Linux, CLI]
date: 2019-05-14 21:14:11
title: 在 Linux 中获取默认网关和 CIDR
---

最近折腾科学上网网关，博客停更一段时间；随手记录一段小脚本，以备日后查用。这是目前我找到的最简、最通用方案，只需 `ip` 和 `grep` 命令即可。

<!--more-->

```bash
CIDR=$(ip -f inet addr show dev eth0 | grep -Pom1 'inet \K[\d./]+')
GATEWAY=$(ip -f inet route show default dev eth0 | grep -Pom1 'via \K[\d.]+')
```

其中，`eth0` 请替换为指定接口名称。
