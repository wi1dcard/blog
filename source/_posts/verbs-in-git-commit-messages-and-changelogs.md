---
id: verbs-in-git-commit-messages-and-changelogs
tags: [Git, Blogging]
date: 2021-09-17 00:46:38
title: Git Commit Messages 和 Changelog 中的常用动词参考
---

优质的 Git commit message 和 Changelog 不仅可以让协作者们一目了然地了解版本变更，更能帮助你快速回忆曾经的修改。因此，合理地使用英语动词、通过「一句话」精准地概括做了什么事、编写易读易懂的描述就显得尤为重要。本文目的是索引和总结常用的动词列表，内容仅凭我个人经验以及有限的查阅资料，请结合实际情况使用。

### Upgrade：升级（版本、等级等）

例如：

- Upgrade Kubernetes to v1.20.0.
- Upgrade Subscan API user example@gmail.com to the professional plan.

反义词：Downgrade，例如：

- Downgrade Kubernetes to v1.19.0.
- Downgrade Subscan API user example@gmail.com to the free plan.

对于「升级（版本）」一义，根据实际场景，也可使用 Rollback、Revert 等作为反义词。

### Rollback：回滚

往往用于升级版本后，需要撤回到原版本的情况；例如：

- Rollback Kubernetes to v1.19.0.

### Revert：撤回，恢复（到先前状态）

例如：

- Revert upgrading Kubernetes.
- Revert commit "abcd123".

### Bump：更迭、上调版本号为全新的值

例如：

- Bump Kubernetes v1.20.0.
- Bump Kubernetes version to v1.20.0.

### Update：更新

此处所指「更新」并非「升级」，往往只有「更新“原始或陈旧信息”为“新信息”」的含义；错误例子：

- ❌ Update Kubernetes to v1.20.0.

正确例子：

- Update cert-manager's CRDs.
- Update the Grafana dashboards to follow the upstream changes.

### Change：更改

与 Update 类似，都有「更改信息」的含义，但 Change 并未隐含「陈旧信息 → 新信息」，因此它的用途更加广泛；Change 也可用于「新信息 → 老信息」或仅仅是「更改」（更改前后并无新旧之分），例如：

- Change the Subscan API plan back to free for the user example@gmail.com.
- Change the PVC size of the Darwinia node to 100 GiB.（本例也可使用 Update）

### Fix：修复

例如：

- Fix minor issues.
- Fix the incorrect MySQL password.
- Fix Subscan not reading environment variables.

    本例中文是「修复 Subscan 不读环境变量的问题」。英文原文省略了「的问题」，在使用 Fix 时，经常可以省略中文「的问题」后缀，例如：

    - 🤨 Fix Subscan's problem which is not reading environment variables. → 😀 本例原文
    - 🤨 Fix the issue of missing the API key. → 😀 Fix missing the API key.

### Install：安装

例如：

- Install Nginx Ingress Controller in the cluster.

    "Nginx Ingress Controller" 为专有名词，其前无需带 the；而 cluster 为非专有名词，其前通常带 the（但也有非专有名词不需要带 the 的情况）。

- Install the requirements of Nginx Ingress Controller.

    "requirements" 为非专有名词，其前通常带 the。

### Deploy：部署

在 DevOps 场景中与 Install 类似，某些情况可以互换，例如：

- Deploy Nginx Ingress Controller in the cluster.

但部署不一定「安装」，同样，「安装」不一定需要「部署」，因此以下例子不能互换：

- Deploy the API key authentication for Subscan.

### Set up：布置、配置

与 Deploy 类似，某些情况可以互换，例如：

- Set up the API key authentication for Subscan.

但 Set up 往往未隐含「安装」之义，例如：

1. Commit 1: Install Nginx Ingress Controller in the cluster.（先安装）
2. Commit 2: Set up Nginx Ingress Controller. （再配置）

### Configure：配置

与 Set up 类似，但绝无「安装」之义；例如：

- Configure Nginx Ingress Controller.
- Configure the firewall rules to mitigate DDoS attacks.

    "DDoS attacks" 为非专有名词，但本例中无需带 the；因为该上下文内，"DDoS attacks" 是多次的、泛指的、不明确的、非特定某次或某几次的。

### Set：设置

与 Set up 含义不同，Set 类似于 Change；例如：

- Set the Subscan API plan back to free for the user example@gmail.com.
- Set the PVC size of the Darwinia node to 100 GiB.

### Improve：改善

例如：

- Improve the CI configuration to speed up.
- Improve scheduling the cron jobs.

### Enhance：增强

相比于 Improve，通常指（较小的）改进；例如：

- Enhance the CI scripts.
- Enhance the detecting algorithm.

### Refactor：重构

相比于 Improve，通常指较大范围的重构；例如：

- Refactor the CI/CD system.
- Refactor watching Darwinia chain events.（非专有名词不带 the 的另一例子）

### Optimize：优化（性能）

与 Improve 类似，但往往特指性能、成本优化，使某物能被更加充分地利用；例如 Improve 的例子：

- Improve the CI configuration to speed up.
- 可等效替换为：Optimize the CI configuration.

### Tune：调整、调节

与 Improve 类似，但往往不直接表示「改善」之义，而是为了达成某个效果（有可能是改善），调整、调节参数；例如：

- Tune the Nginx parameters to allow more connections.
- Tune MySQL's configuration for long queries.

### Organize：整理

与 Improve 类似，但往往特指组织、安排、整理；例如：

- Organize the list of Subscan API keys.
- Organize the YAML files into separated directories.

### Remove：移除、卸载

例如：

- Remove Nginx Ingress Controller from the cluster.
- Remove the labels in deployment.yaml.

### Deprecate：废弃

往往用于废弃、注释某物，但暂不移除时；例如：

- Deprecate the Ingress API version v1beta1.
- Deprecate the Helm-flavor deployments.
