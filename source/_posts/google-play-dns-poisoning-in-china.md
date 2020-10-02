---
id: google-play-dns-poisoning-in-china
date: 2018-09-19 10:46:13
title: 解决 Google Play 科学上网依旧无法访问
tags: [Networking]
---

最近发现个问题，路由器挂了 SS 但是手机访问 Google Play 依旧报错：

> 从服务器检索信息时出错。[DF-DFERH-01]。

遂排查，发现是由于国内版本的 Google Play 商店是使用 `services.googleapis.cn` 域名，而 `.cn` 域默认直连国内 DNS 进行解析，而 GFW 又给这个域名下毒导致 DNS 污染，无法访问。

于是三种方案。

- 使用干净的 DNS 解析出真实的 IP 写入设备 Hosts 或者 Dnsmasq 的配置。
- 清除 DNS 缓存后，强制走代理转发 DNS 请求，然后打开 Google Play。
- 直接使用 SS 转发所有 DNS 请求，不直连 DNS。

最终我采用第一种方案解决，目前我解析出来此域名 IP 为 `216.58.197.195`，修改 `dnsmasq.conf` 追加如下行即可。

```
address=/services.googleapis.cn/216.58.197.195
```
