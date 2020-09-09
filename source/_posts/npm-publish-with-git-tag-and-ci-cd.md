---
id: npm-publish-with-git-tag-and-ci-cd
tags: [CI/CD, Git]
date: 2020-09-09 10:04:25
title: 使用 Git Tag 和 CI 干净地发布 NPM 包
categories: Snippets
---

最近在探索「如何发布 NPM 包」的过程中，发现多数人的思路要么完全不用 CI，修改 `package.json` 内版本号之后手动发布；要么结合 CI，但需要 CI 生成新版本号之后修改 `package.json`，最后机器人执行 Git Commit + Git Tag 并推送到仓库内。这两种做法我都不是很喜欢，前者没有 CI 不能忍，后者不仅要求 CI 有写权限，而且会仓库内增加许多形如 `Release v...` 之类的提交，强迫症表示接受不了。

不过经过一番研究，我还是找到了两种比较「干净」的思路，来看看吧。

<!--more-->

## 方法 1

这种方法与上文中提到的思路类似，只是原先的 4 个步骤：

1. 根据 Changelog 生成新版本号。
2. 修改 `package.json` 的 `versison` 字段。
3. 执行 `npm publish`。
4. 执行 `git commit`、`git tag`、`git push`。

被缩减到了 2 步：

1. 根据 CI 提供的环境变量，拿到触发当前 CI Job 的 Tag 名称，据此修改 `package.json` 的 `versison` 字段。
2. 执行 `npm publish`。

另外触发的条件从 On Push 换成了 On Push Tags。

对于 GitHub Actions，可以使用 Shell parameter expansion 拿到 Tag 名称：

```bash
export GIT_TAG_NAME=${GITHUB_REF/refs\/tags\//}
npm version --allow-same-version=true --git-tag-version=false "$GIT_TAG_NAME"
```

## 方法 2

这种方法仍然是 CI 创建 Tag，只省掉了 Commit：

1. 开发者修改 `package.json` 内的版本号并提交。
2. CI 检查是否有必要发布新版本，例如可以：
   1. 检查当前版本是否不存在，例如执行 `test -z "$(npm view .@<VERSION>)"`。
   2. 检查 Commit Message 是否包含关键词，例如 `Release *`。
3. 执行 `npm publish`。
4. 执行 `git tag`、`git push --tags`。

## 参考

- 方法 1：<https://github.com/mikeal/merge-release>
- 方法 2：<https://github.com/marketplace/actions/publish-to-npm>
- <https://github.community/t/how-to-get-just-the-tag-name/16241>

## 碎碎念

不太理解 NPM 为什么要这样做，加个 `npm publish --version=...` 似乎完美解决问题。我猜大概是历史原因，可能那个年代还没什么人用 CI 和 Git Tag，更流行用文件来管理版本吧。
