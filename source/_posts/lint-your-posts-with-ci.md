---
id: lint-your-posts-with-ci
date: 2019-01-26 08:54:58
title: 自动化 Markdown 博文写作规范检查
tags: [Blogging, CI/CD]
---

[hustcc/lint-md](https://github.com/hustcc/lint-md) 是一款中文 Markdown 写作规范检查工具，检查规则来源于 [ruanyf/document-style-guide](https://github.com/ruanyf/document-style-guide)。

配合 CI/CD 使用，即能够以完全自动化的方式，确保优秀的博文质量，长期使用还可培养良好的写作习惯。

<!--more-->

## 准备

首先，我们需要熟悉该工具。

```bash
# 全局安装
npm install -g lint-md
# 使用方法如下
lint-md <files> [--config <config_file>]
```

- `files` 为一个或多个需检查的文件路径。
- `config_file` 为 JSON 格式的配置文件路径。

其配置文件格式如下。

```js
{
  "excludeFiles": [], // 忽略的文件或目录列表
  "rules": {
    "no-empty-code": 1 // 定义规则告警级别
    // ...
  }
}
```

`no-empty-code` 为规则名称，其值与告警级别的对应关系如下：

- 0: Ignore 忽略，不检查该规则
- 1: Warning 警告，但进程退出码不受影响，依旧为零
- 2: Error 错误，退出码非零，「通常」会中断 CI 流程，为何「通常」详见下文

## 过程

官方文档提供了一套 Travis 的配置。

```yaml
language: node_js
node_js:
  - "10"
before_install:
  - npm i -g lint-md
script: lint-md README.md
```

对于我的博客已经大量使用 Node.js，且包含 `package.json`，我更倾向于使用以下的配置，而不是全局安装：

```yaml
language: node_js
node_js:
  - "10"
install:
  - npm install
  - export PATH=$PATH:$(pwd)/node_modules/.bin
script: lint-md source/_posts/* --config lint-md.json # 适用于 Hexo 博客
```

可以看到，我使用 `npm install` 命令安装所有 `package.json` 中声明的依赖，随后将 `node_modules/.bin` 目录追加至 PATH 环境变量。

这样，只需执行一次 `npm install`，在添加后续依赖时统一声明在 `package.json` 即可，保持配置文件简略易读。

另外，修改 $PATH 是为了达到与全局安装统一的效果。即在使用依赖的可执行文件时，无需 `./node_modules/.bin/foo-bar` 而只要 `foo-bar`。

`source/_posts/*` 是 Hexo 博客默认的 Markdown 文章源码目录，`lint-md.json` 是我自己创建的配置文件，内容如下：

```json
{
    "excludeFiles": [],
    "rules": {
      "no-empty-code-lang": 0,
      "no-trailing-punctuation": 0
    }
}
```

该配置文件可根据你的需要自定义，以上忽略的两个规则是我认为没什么必要的，仅供参考。

另外需要注意的一点是，根据 Travis-CI 中对于 [Job Lifecycle](https://docs.travis-ci.com/user/job-lifecycle/#breaking-the-build) 的文档描述：

> If any of the commands in the first four phases of the job lifecycle return a non-zero exit code, the build is broken:
> If before_install, install or before_script returns a non-zero exit code, the build is errored and stops immediately.
> If script returns a non-zero exit code, the build is failed, but continues to run before being marked as failed.

也就是说，如果你的 Travis 配置文件像这样，在 `script` 内有多条命令：

```yaml
language: node_js
node_js:
  - "10"
install:
  # ...
script:
  - lint-md
  - hexo generate
  - hexo deploy
  # ...
```

那么如果 `lint-md` 失败后，虽然返回了非零的退出码，但 `hexo generate` 以及 `hexo deploy` 等后续命令依旧会执行！只不过流程结束后会标记该 Job 为失败（`Failed`）状态。

也就是说，如果你的 Markdown 中存在不规范的文本，被 `lint-md` 检出错误后，后续的生成和部署流程依旧会照常执行！这就达不到「存在问题则不发布」的效果了。针对这个问题，解决方案有二：

- 在 `script` 内的所有命令前，执行 `set -e`，详见 <https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/>。
- 根据上文引用的文档说明，将 `lint-md` 命令移动到 `before_script` 内。

其中，移动到 `before_script` 会造成一个微小的影响 —— 若命令执行返回非零退出码，那么该 Job 会被立即标记为错误（`Error`）状态并停止执行，而非失败（`Failed`）状态。请注意 Travis-CI 中这点小区别。

## 问题

目前该项目还不够完善，参见：

Issue [#33](https://github.com/hustcc/lint-md/issues/33), [#34](https://github.com/hustcc/lint-md/issues/34)。

## 拓展

当然，该工具也可以本地使用，还具备 `--fix` 选项，能够自动修复不符合规范的文本。

另外，[dkhamsing/awesome_bot](https://github.com/dkhamsing/awesome_bot) 是一款验证文件内 URL 是否有效的工具。原本用于各类 `awesome` 项目检查其链接、以及收到 PR 时，自动检查包含的 URLs 是否可访问。同样，也可以给 Markdown 博客使用，能够确保博文内的链接可用。

虽然，我在本地使用该工具对所有文章的链接可用性进行了一遍「普查」，但我决定不在 CI 流程内加入该工具。主要由于配置项不够丰富，部分链接我「确实」希望它失效，但无法忽略某文件中某一特定链接。
