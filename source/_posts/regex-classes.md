---
title: "正则表达式课程大纲"
date: 2017-11-14 09:51:09
id: regex-classes
categories: Documents
---

> 正则表达式(regular expression)描述了一种字符串匹配的模式（pattern），可以用来检查一个串是否含有某种子串、将匹配的子串替换或者从某个串中取出符合某个条件的子串等。—— [菜鸟教程](http://www.runoob.com/regexp/regexp-syntax.html)

### [*] Part 1

1.  是什么？
2.  用途？（搜索、替换、提取、验证、格式化、Rewrite等）
3.  怎么用？
4.  常见正则引擎（PCRE / DEELX ...）。
5.  常见正则测试工具（[Deelx Regex Match Tracer](http://www.regexlab.com/zh/mtracer/) / [Regex 101](https://regex101.com/) / [RegExr](https://regexr.com/) / For PHPer: [PHP Live Regex](http://www.phpliveregex.com/)）
6.  一个简单的例子（`.*`）。
7.  优缺点。

### [*] Part 2

1.  常见元字符：`.`, `\d`, `\w`, `\b`, `\s`
2.  常见限定符：`*`, `?`, `+`, `{min,max}`

### [ ] Part 3

1.  元字符：`[]`, `[^]`, `^`, `$`, `\u`
2.  分割符：`|`
3.  子表达式：`()`

### [ ] Part 4

1.  贪婪匹配
2.  懒惰匹配

### [ ] Part 5

1.  非捕获元字符
2.  反向引用