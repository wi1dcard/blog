---
id: pack-incremental-updates-using-git
date: 2018-07-08 15:06:09
title: Git 仓库打包增量更新包
categories: tutorials
---

目前任职公司，每周一日常更新需要打包「上个版本」到「最新代码」的压缩包，图方便写成命令，以便后续使用。

## 0x00 思路

1. `git diff` 查找「上个版本的提交」->「最新提交」的文件区别。
2. 利用各类压缩工具打包压缩文件。

## 0x01 代码

```bash
git diff --diff-filter=d --name-only <COMMIT_ID> HEAD | xargs tar cvf <FILE_NAME> --exclude=<EXCLUDE>
```

- `--diff-filter=d`：忽略删除的文件
- `--name-only`：只导出文件名
- `<COMMIT_ID>`：从哪次提交开始导出
- `HEAD`：到最新的提交
- `<FILE_NAME>`：打包的文件路径
- `<EXCLUDE>`：排除文件或目录

另外，如不需要打包，只需拷贝，可将 `tar` 替换为 `cp` 命令：

```bash
xargs -I{} cp --parents {} <DIR_NAME>
```

- `<DIR_NAME>`：复制到的目录名

可选使用7z打包（Windows下需要先配置7z的环境变量）

```bash
git diff --diff-filter=d --name-only <COMMIT_ID> HEAD | xargs 7z a <FILE_NAME>
```

## 0x02 改进

若每次版本都按规定打 Tag 的话，可以使用如下命令自动获取最近的 Tag 信息，用于确认最新版本。

```bash
git describe --tags `git rev-list --tags --max-count=1`
```