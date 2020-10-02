---
id: find-your-public-ip-via-dns-protocol
tags: [Networking, CLI]
date: 2019-11-07 17:11:27
title: Find Your Public IP Address via DNS Protocol
---

OpenDNS has a "un-official" (I didn't find any docs at least) API for returning your public IP, by a normal DNS query.

<!--more-->

```bash
dig @resolver1.opendns.com -t A -4 myip.opendns.com +short
```
