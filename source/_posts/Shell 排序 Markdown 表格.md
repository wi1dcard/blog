---
id: sort-markdown-tables-shell
date: 2018-08-26 10:51:16
title: Shell 排序 Markdown 表格（译）
categories:
---

## 序

最近新项目写 README，在编排实体命名协定中英对照的时候，有使用到 Markdown 的表格。那么如何根据某列的字母顺序排序 Markdown 表格呢？实际上，一条 Shell 命令就足以解决。请看大佬的实现。

## 正文

TableFlip doesn't sort tables by column as of yet. So we all have to resort to other solutions – like shell or Terminal commands.

Let's say your (Multi)Markdown table starts with a header (=2 rows) and has leading pipes like this:

```
| a | b | c | d |
| - | - | - | - |
| 1 | 2 | 3 | 4 |
| 9 | 1 | 2 | 3 |
| 3 | 4 | 5 | 6 |
```

You can sort the table by the 3rd column (column "c") like so:

```bash
tail -n +3 table.md | sort --field-separator=\| --key=4
```

Explanation:

- `tail` reads a file from the end; `tail -n +3` reads a file from the end until the 3rd row, leaving out the first 2 rows, aka the header.
- `sort` sorts the textual input; `--field-separator=\|` configures the sort command to not use tab stops but pipes as column separators; and `--key=4` sets the 4th field (3rd column if your table starts with a pipe, which is counted by sort, too) as the input.

The output will be:

```
| 9 | 1 | 2 | 3 |
| 1 | 2 | 3 | 4 |
| 3 | 4 | 5 | 6 |
```

You can add the header back by combining tail with head, where head outputs the topmost 2 lines:

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

Ready to be saved as a new file by routing the output to a new file name with `> sorted_file.md`:

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