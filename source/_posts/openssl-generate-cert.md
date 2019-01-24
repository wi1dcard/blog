---
title: "OpenSSL 随手记 - 生成自签证书"
date: 2018-03-04 20:56:49
id: openssl-generate-cert
categories: Snippets
---

> 使用 OpenSSL 命令行生成 HTTPS 自签证书。

```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout cert.key -out cert.pem
```

生成过程中，请注意`Common Name`需要正确填入需要上 HTTPS 的域名，有二级域名也要带上。其它信息随意即可。

Tips：生产环境请勿使用！