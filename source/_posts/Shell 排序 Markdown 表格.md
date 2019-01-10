---
id: sort-markdown-tables-shell
date: 2018-08-26 10:51:16
title: Shell 排序 Markdown 表格（译）
categories: Tutorials
---

## 序

最近新项目写 README，在编排实体命名协定中英对照的时候，有使用到 Markdown 的表格。那么如何按照某列的字母顺序排序 Markdown 表格呢？实际上，一条 Shell 命令就足以解决。请看大佬的实现。

## 正文

TableFlip 目前还无法根据列排序表格. 所以我们不得不使用其他方法，比如 Shell 或者 Terminal 命令.

首先，我们假设你的 Markdown 表格由一个两行的表头开始，并且每行开头都有管道操作符（`|`），就像这样：

```
| a | b | c | d |
| - | - | - | - |
| 1 | 2 | 3 | 4 |
| 9 | 1 | 2 | 3 |
| 3 | 4 | 5 | 6 |
```

接下来，你便可以使用如下命令，按照第三列（`c` 列）对表格进行排序：

```bash
tail -n +3 table.md | sort --field-separator=\| --key=4
```

解释:

- `tail` 命令读取文件的尾部；`tail -n +3` 从尾部开始读取一个文件，直到第三行结束；排除了前两行，也就是表头。
- `sort` 命令排序文本输入；`--field-separator=\|` 指定排序命令使用管道分隔符（`|`）而非 tab 作为列分隔符；`--key=4` 设置根据第 4 列进行排序（注意，此处实际上是第 3 列；因为如果表格行由列分隔符也就是管道操作符开头，那它也会被算进排序列里）。

输出为:

```
| 9 | 1 | 2 | 3 |
| 1 | 2 | 3 | 4 |
| 3 | 4 | 5 | 6 |
```

你可以通过使用 `head` 合并 `tail` 把表头重新添加回去，`head` 命令将会输出文件的开头两行。

```bash
head -n 2 table.md && tail -n +3 table.md | sort --field-separator=\| --key=4
```

就是这样：

```
| a | b | c | d |
| - | - | - | - |
| 9 | 1 | 2 | 3 |
| 1 | 2 | 3 | 4 |
| 3 | 4 | 5 | 6 |
```

最后，只需要使用 `> sorted_file.md` 把输出重定向到一个新文件即可保存：

```bash
(head -n 2 table.md && tail -n +3 table.md | sort --field-separator=\| --key=4) > sorted_table.md
```

原文链接：<https://christiantietze.de/posts/2017/05/sort-markdown-tables-shell/>

## 碎碎念

印象中，七月结束也有过[感叹](https://wi1dcard.cn/snippets/git-randomize-commit-message/)。时间飞快，马上到了八月底，一转眼就到了九月开学（<del>和女朋友见面</del>）的日子。

emmmm，这个月做个简单总结。

上半个月在忙着使用七月底封装的 [支付宝 SDK](https://github.com/wi1dcard/alipay-sdk-php) 把公司项目集成到支付宝。

下半个月为即将开始的新项目做准备工作，所以才有了近期一些关于 Laravel 的博文；新项目既然老板信任地丢给我做后端架构，那就毫不犹豫地采用社区活跃、代码优雅、轮子多的当红炸子鸡 Laravel 啦。

另外考虑到 Laravel 在优雅路上越走越远，由于并发性能也不容忽视，所以最近可能要开关于 Swoole 的坑了。

之前一直自己玩 Swoole ，写一些长链接的小项目和小玩具，这是第一次尝试把 Swoole 大规模用在商业项目里，想想还是有点小激动 /斜眼笑。

2333，期待接下来的挑战，给自己加油！

九月，你好。