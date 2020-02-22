---
title: DevOps 自动化实践 - 定时任务监控的进化之路
---

## 背景

自从我司采用 Cronitor 监控定时任务，并使用 Terraform 将监控「代码化」已经有一段时间了。相比于常驻的服务，监控定时任务需要关注的往往并不是进程是否持续运行、是否正常接收请求，而是：

- 是否在既定时间启动？
- 在什么时间结束？
- 运行过程中是否有异常抛出？正常处理了该错误，还是造成了 Crash？
- 执行时长是否有激增或是骤减？

## 上古时代

几年前，我们在定时任务 **开始前** 和 **结束后** 各插入一个钩子，该钩子会将定时任务的名称以及当前的状态发送到准备好的 Slack Channel。

因此团队内需要安排一名工程师，每天查看一下 Slack 消息通知，并判断 Cron Jobs 的结果是否正常。最初这种方法是奏效的，因为定时任务的数量非常少。随着任务越来越多（如今多达几十条的时候），依赖肉眼查看的成本和人为失误的概率就很高了。

![](/resources/15bcc2ccb18ae36da981830b18901158.png)

并且，这套工作流程与 DevOps 思想是相悖的。

## 引入 Cronitor

于是我们引入了 [Cronitor](https://cronitor.io/)。类似的产品还有 [healthchecks.io](https://healthchecks.io/) 等。它们的核心业务逻辑大概是这样：

1. 通过 UI 或 API 创建定时任务监控项；包括 Cron Jobs 应当开始的时间、可容忍的阈值等。
2. 在任务开始前和结束后，通过 HTTP API 或其它方式向监控产品（Cronitor）上报。
3. 如果任务未在预期的时间启动，则认为任务出错；其它情况类似。
4. 根据特定规则，将失败或错误的任务通知到 Slack 或 Webhook 等。

如此一来，**盯大量消息** 就变成了 **盯报错消息**，显著降低了人力负担。

Cronitor 支持的 Integrations 有 Slack、Pagerduty、Opsgenie、VictorOps 等，我们配置了 Slack。

![](/resources/911181c403a4af680c346a919ed122a1.png)

另外，在 Cronitor 的 Web UI 上也能一目了然地看到各个 Cron Jobs 的状态。

![](/resources/6600da225b1a69f142d384a330cef08e.png)

此后我们又对 Cronitor 的消息通知进行了一番改进。

从上图顶部的一排 Tags 中可以发现有一些名为 `owner:*` 的标签，我们为定时任务附上这样的标签。同时，把原先的 Slack Integration 改为使用 Webhook，将失败的任务信息统一发送至内部开发的一款名为 `Cronitor Failure Dispatcher` 的小工具，由它将失败通知发送到 Slack Channel。该工具在发送通知前会读取任务的 Tags，并在通知信息中 Mention 指定的人员，例如 `@annie.wang`。

这样我们便达到了 **责任到人**，并废除「首席盯 Cronitor 消息兼消息分发工程师」这一职能的目的。

![](/resources/6bb504008dd8032c784840570d0d4cb6.png)

## 新的问题

**关注定时任务执行结果** 的工作流程完全自动化了，**创建定时任务监控项** 仍需人工在 Web UI 上操作。这在少量 Cron Jobs 时似乎简单易行；但由于我司的发布流程比较严谨，存在 Development、Staging、UAT、Production 四套运行环境，相当于本就数量庞大的定时任务需要通过 UI 对应地、各创建四个监控项。这意味着：

1. 麻烦，并且存在人为失误的可能性（例如同一监控项的各个环境的配置不统一）；尤其是随着时间推移，后续创建的监控项配置很有可能与先前创建的存在细微的差异，这一点让我们非常头疼，因为几乎无法核对。
2. 不可追溯。无论是由于权限系统不满足需求，抑或无法提供足够的操作日志，当发现配置变更时，不易找出变更的发起者和原因。
3. 难以实施全局改动（例如增加一套环境、修改所有监控项的配置等）。

## 引入 Terraform

受到 Infrastructure as Code 思想的启发，我们在想：可否实现 **Monitors as Code** 呢？答案是肯定的。

在我们长期将基础设施代码化的过程中，已经学习和了解了 Terraform。它的设计思想允许通过代码声明几乎任何类型的「资源」，只需要编写相应的 Providers，Terraform 便能够帮助你检查 Diff、根据 Diff 执行必要的增删改查，最终达到或接近配置所描述的状态。

![](/resources/b178137d6b5a66bf17ff8484f84ed72a.png)

其中，Providers 的工作就是与具体的资源提供者交互，例如调用 HTTP API、修改数据库记录，甚至是编辑文件（虽然我没见有人这么干过）。

鉴于 Cronitor 官方没有提供 Terraform Provider，GitHub 也没有类似项目，因此我们自己写了一个并开源了：<https://github.com/nauxliu/terraform-provider-cronitor>。

以下是一个简单的例子：

```terraform
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

variable "cronitor_api_key" {
  description = "The API key of Cronitor."
}

provider "cronitor" {
  api_key = var.cronitor_api_key
}

resource "cronitor_heartbeat_monitor" "monitor" {
  name = "Test Monitor"

  notifications {
    webhooks = ["https://example.com/"]
  }

  tags = [
    "foo",
    "bar",
  ]

  rule {
    # Every day in 8:00 AM
    value         = "0 8 * * *"
    grace_seconds = 60
  }
}
```

> 小提示：推荐 [crontab.guru](https://crontab.guru/)，是一款可以将 Cron Expression 解析为人类可读语言的小工具。

为了能够安全地将以上内容提交到代码管理系统，我们还将 Cronitor 的 API Key 解藕，使用 Terraform 的 Variables 赋值；这样既可以将它存储到 `terraform.tfvars` 文件中，又能够通过环境变量设置，方便 CI/CD。

实际的代码当然没有这么简单，我们将多个项目所需要的监控项编写成 Terraform Modules 以便于复用，再将各个环境抽象为 Terraform Workspaces，在 Workspaces 内使用 `modules` 指令，根据需要引用模块即可；即使部分项目不存在某些环境也能够灵活编排。

最后，我们将所有的代码存放在一个 Git 仓库中，并结合 GitLab CI 实现了完整的 **从提交代码到实际变更的自动化**。

![](/resources/6e7b3978886440d062046a5c055e3cab.png)

## 最终的工作流

```
                   +--------------+
                   | Users commit |
                   +------+-------+
                          |
                          v
                     +----+-----+
                     | Git repo |
                     +----+-----+
                          |
                          | CI/CD <---> Terraform
                          v
+-----------+     +-------+-----------+
| Cron Jobs +-----> Cronitor Monitors |
+-----------+     +-------+-----------+
                          |
                          | Webhook
                          v
              +-----------+-----------------+
              | Cronitor Failure Dispatcher |
              +--------+----+---+-----------+
                       |    |   |
               +-------+    |   +---------+
               |            |             |
               v            v             v
            User A        User B        User C
```
