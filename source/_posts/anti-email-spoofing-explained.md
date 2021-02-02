---
id: anti-email-spoofing-explained
tags: [IT]
date: 2021-02-02 12:37:02
title: 通俗解释反伪造邮件机制 SPF、DKIM 和 DMARC
---

这篇博客一改我之前文风的常态，因为网上的相关专业资料已经很多，我尽可能以通俗易懂的语言来介绍，因此放弃了部分专业性，望读者见谅。

我们先来谈谈「防止攻击者伪造我们向其他人发送邮件」。要理解为什么会存在伪造邮件以及如何防止伪造邮件，首先需要明白邮件机制是怎样工作的。

<!--more-->

## 发送邮件时发生了什么？

为了方便理解，你可以把「发送邮件」看作是类似提交 HTTP 请求的过程。

举个例子，假设我们是 `user@foo.com`，给 `remote@bar.com` 发邮件，在点击「发送」的那一刻，我们的邮件服务器查询 `bar.com` 的 MX 记录，DNS 服务器返回 `1.1.1.1`，接着我们的邮件服务器与对方 `1.1.1.1` 建立 TCP 链接，发送以下内容（仅供理解概念，与真实情况不同）：

```
你好，我是 <user@foo.com>
我有邮件给 <remote@bar.com>
标题是 xxxx
内容是 yyyy
```

于是我们的邮件就到达了 `remote@bar.com` 的邮件服务器，服务器记录并存储到收件箱供对方查看。

这整个过程中不存在任何对「我方」的身份验证，也就是说，任何人可以链接到 `remote@bar.com` 的邮件服务器，说：`我是 <user@foo.com>，我有邮件给 xxxx`。这就给了攻击者伪装成「我方」的可能性。

## SPF

怎么办呢？于是 SPF 被发明了。SPF 机制要求我们，在需要发送邮件的域名下（`foo.com`），新增一条 SPF 记录，内容大概是（仅供理解概念，与真实情况不同）：

```
我方邮件服务器 IP 地址是 = 2.2.2.2, 3.3.3.3
```

再次重复上文邮件发送过程，对方邮件服务器收到我方邮件（来自 `foo.com`）时，就可以查询 `foo.com` 的 DNS 记录，找到我们提前设置好的 SPF 记录。同时，因为「发送」的过程实际上就是 TCP 建立链接，因此对方服务器也能够得到发送者的服务器 IP。把 **发送邮件的服务器 IP** 与 **SPF 记录内的 IP 地址** 进行对比，如果不匹配，则认为是伪造邮件。

可以看出，通过 SPF 机制，我们能达到「**不是从我们服务器 IP 地址发出的邮件，被视为垃圾邮件**」的效果。但是，SPF 存在一些局限性，例如：

> 假设你有两个邮箱 `jane@company.com` 和 `jane@personal.com`，你特别热爱工作，设置了所有发到 `jane@company.com` 的邮件全部转到 `jane@personal.com`。
>
> 此时一封来自 `user@foo.com`（配置了 SPF）的邮件发送到了 `jane@company.com`，邮件服务器根据你的设置、**原封不动地** 转发该邮件到 `jane@personal.com`。
>
> `jane@personal.com` 的邮件服务器收到邮件后，开始核对 SPF 记录。这时 **邮件的发件人依然是 `user@foo.com`**，根据查询 `foo.com` 的 SPF 配置内并不包含 `company.com` 邮件服务器的 IP 地址。因此该邮件将被误判为伪造邮件。

## DKIM

尽管如今许多邮件服务商在自动转发邮件时，会修改邮件的发件人来规避 SPF 规则限制。但这在理论上并不「优雅」，于是又诞生了 DKIM。

DKIM 要求我们在我方邮件服务器内生成一组密钥对，私钥保存在服务器内，公钥通过 DNS 记录公开。一样，新增一条 DNS 记录，内容大概是（仅供理解概念，与真实情况不同）：

```
我方邮件签名公钥是 = 0xnoirh22h381uj2eoqdsjlaisud
```

再次重复上文邮件发送过程，与 SPF 不同，我方服务器在发送邮件时，需要对邮件内容使用私钥签名，并将签名与邮件内容一起携带着发送给对方服务器。对方收到我方邮件时（来自 `foo.com`），同样查询 `foo.com` 的 DNS 记录，拿到公钥。使用公钥和签名验证邮件内容，如果验签不通过，则将邮件判定为伪造。

结合以上例子（`user@foo.com` -> `jane@company.com` -> `jane@personal.com`），当 `jane@company.com` 自动转发邮件时，无需修改任何字段（也不能修改，不然验签就会失败），`jane@personal.com` 收到邮件后查询 `foo.com` 的 DKIM 公钥，验证邮件签名通过，即可认为是正常邮件。

如此一来，结合 DKIM 和 SPF，看起来万事大吉了？并没有。让我们更加深入一点，看个稍微真实一点的邮件。

```
Return-Path: user@fake.com
DKIM-Signature: d=fake.com, b=aldjiopurn1o23u108923jiuq123jdal
From: <user@foo.com>
To: <remote@bar.com>
```

刚刚提到，基于 SPF，收件方能够对比「发件服务器 IP 地址」与「发件人域名的 SPF 记录内的 IP 地址」。然而，因为邮件系统发展历史久远，SPF 定义的「发件人」是 `RFC5321.MailFrom` 规定的 `Return-Path`。DKIM 则更是在邮件头里直接携带了域名（`DKIM-Signature: d=`），只要使用该域名的公钥验证通过即可。

然而，如今邮件服务给最终用户展示的「发件人」几乎都是 `From` 字段，并非 SPF 的 `Return-Path`，也不是 DKIM 的 `DKIM-Signature: d=`。也就是说，攻击者（`fake.com`）可以发送以上这封邮件，可以完美通过 SPF 和 DKIM 检查（因为 SPF 验证的 `Return-Path` 是 `fake.com`，而 DKIM 验证的 `d=` 也是 `fake.com`），而最终用户看到的发件人却是 `From` 内的 `user@foo.com`。这显然是不可接受的。

## DMARC

又于是，DMARC 诞生了。

DMARC 并没有规定具体的「验证措施」，而是基于 SPF 和 DKIM（或二者之一）。它规定，SPF 的 `Return-Path` 或者 DKIM 的 `DKIM-Signature: d=` 二者至少需有其一与 `From` 头对应，否则被判定为 `fail`。这个过程叫做 `Identifier Alignment`。同时，DMARC 还提供了大量的增强功能，比如指定那些 `fail` 的邮件是进入 Spam 还是直接拒收。配置 DMARC 的方式与 SPF 和 DKIM 类似，在我方域名 DNS 内添加 TXT 记录，内容类似这样（仅供理解概念，与真实情况不同）：

```
70% 的 fail 邮件进入 Spam；
邮件服务商应当将每天 fail 的邮件汇总后发送到 xxx@foo.com 以供分析；
严格匹配，不允许 Return-Path 是 From 的自域名；
```

当对方邮件服务器收到邮件时，即可先验证 DKIM、SPF，再根据 DMARC 的配置，检查 Identifier Alignment、决定具体措施等。

如此一来，能够确保最终收件人用户看到的 `From` 与 SPF、DKIM 认证的发件人一致，且经过了 SPF 或 DKIM 认证。这样，攻击者也就无法伪造我们发出的邮件了。

## 结语

总结以上过程，可以看出：如果想要彻底避免伪造邮件，是需要收发双方协作的过程。除了发件方要配置好 SPF 和 DKIM 供收件方验证外，收件方的服务器也必须支持 **对收到的邮件进行 SPF 和 DKIM 认证**。

当我们作为收件方时，能做的就是尽可能使用支持 SPF 和 DKIM 的邮件服务商，例如 Gmail；避免使用不支持这些机制的服务商，比如（垃圾）阿里云 / 钉钉邮箱。
