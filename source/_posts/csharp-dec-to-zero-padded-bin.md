---
id: csharp-dec-to-zero-padded-bin
date: 2018-06-16 21:29:17
title: C# 二进制转换 缺位补零
categories: Snippets
tags: [.NET]
---

进制转换：

```csharp
bin = Convert.ToString(dec, 2);
```

缺位补零：

```csharp
bin = bin.PadLeft(8, '0');
```
