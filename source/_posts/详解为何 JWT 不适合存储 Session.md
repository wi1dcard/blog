---
id: stop-using-jwt-for-sessions
date: 2019-01-15 18:37:03
title: 详解为何 JWT 不适合存储 Session
categories: Translations
---

不要再使用 JWT 作为 Session 系统了！本文作者将详解：为何 JWT 不适合存储 Session，以及 JWT 引发的安全隐患。望各位使用前三思。

<!--more-->

> 原文地址：<http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/>

十分不幸，我发现越来越多的人开始推荐使用 JWT 管理 Web 应用的用户会话（`Session`）在本文中，我将解释为何这是个非常非常差劲的想法。

为了避免疑惑和歧义，首先定义一些术语：

- 无状态 JWT（`Stateless JWT`）：包含 Session 数据的 JWT Token。Session 数据将被直接编码进 Token 内。
- 有状态 JWT（`Stateful JWT`）：包含 Session 引用或其 ID 的 JWT Token。Session 数据存储在服务端。
- `Session token`（又称 `Session cookie`）：标准的、可被签名的 Session ID，例如各类 Web 框架（译者注：包括 Laravel）内已经使用了很久的 Session 机制。Session 数据同样存储在服务端。

需要澄清的是：本文并非挑起「永远不要使用 JWT」的争论 —— 只是想说明 JWT 并不适合作为 Session 机制，且十分危险。JWT 合理的使用场景在其他方面确实存在。本文结尾，我将简短地说明一些其它的合理用途。

## 首先的提示

很多人错误地尝试比较 `Cookies` 和 `JWT`。这种对比毫无意义，就像对比苹果和橘子一样。Cookies 是一种存储机制，然而 JWT Tokens 是被加密并签名后的令牌。

它们并不对立 —— 相反，他们可以独立或结合使用。正确的对比应当是：`Session` 对比 `JWT`，以及 `Cookies` 对比 `Local Storage`。

在本文中，我将把 JWT Tokens 同 Session 展开对比，并偶尔对比 `Cookie` 和 `Local Storage`。这样的比较才有意义。

## 