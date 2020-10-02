---
id: alertmanager-smtp-setup-for-alibaba-mail-service
tags: [Prometheus, Alertmanager]
date: 2020-09-24 14:27:06
title: Alertmanager 通过阿里云企业邮件 SMTP 服务发信
---

阿里云收购万网之后，几乎不赚钱的邮件服务还真是不维护不迭代了 — 不支持 DKIM，没法配 DMARC，就连 SMTP 也不支持 STARTTLS 587 端口。

<!--more-->

```yaml
# ...
receivers:
  - name: email
    email_configs:
      - send_resolved: true
        to: name@yourcompany.com
        from: name@yourcompany.com

        # ⬇ REQUIRED
        smarthost: smtp.qiye.aliyun.com:465
        require_tls: false
        hello: yourcompany.com
        # ⬆ REQUIRED

        auth_username: name@yourcompany.com
        auth_identity: name@yourcompany.com
        auth_password: ...
```

### Reference

- <https://github.com/prometheus/alertmanager/issues/980>（难以入目的英文）
- <http://mailhelp.mxhichina.com/smartmail/detail.vm?knoId=5871700>
