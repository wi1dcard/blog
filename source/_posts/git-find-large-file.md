---
id: git-find-large-file
date: 2018-08-10 15:33:16
title: Git 仓库查找已追踪的大文件
categories: Snippets
---

当我们的 Git 仓库越来越大，或者不小心提交了二进制大文件，如何快速找出仓库内的「罪魁祸首」？

### 实践

实际上非常简单，一条命令就能搞定。

```bash
git rev-list --objects --all \ # 
| git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
| sed -n 's/^blob //p' \
| sort -r -n -k 2 \
| head -10 \
| cut -c 1-12,41- \
| numfmt --field=2 --to=iec-i --suffix=B --padding=7 --round=nearest
```

> 注意，在 macOS 使用此命令需要安装 `brew install coreutils --with-default-names`。
> 
> 若你已经安装但并没有使用 `--with-default-names` 选项，则需要替换 `numfmt` 为 `gnumfmt`。

或许有人说，使用 `du` 命令也可以实现。但这样会缺少 gitignore 的支持，并且无法查找到已删除但存在于提交历史的文件。

### 备选

另外，在码云还看到一种方法；但相比前面的方法略逊，不能显示文件大小，也没有完全采用管道处理，是否足够严谨有待考证。作为备选命令吧。

```bash
git rev-list --objects --all | grep -E "`git verify-pack -v .git/objects/pack/*.idx | sort -r -n -k 3 | head -10 | awk '{print$1}' | sed ':a;N;$!ba;s/\n/|/g'`"
```

### 参考

- <https://stackoverflow.com/questions/10622179/how-to-find-identify-large-commits-in-git-history>
- <http://git.mydoc.io/?t=83153>