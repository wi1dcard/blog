---
title: "I'm Wi1dcard"
comments: false
---

<!--more-->

## 自我介绍

<div class="card">

你好，我是 **Wi1dcard**，一名生于 1998 年，具备 6 年工作经验的软件工程师。

这是我的 [在线简历](https://wi1dcard.dev/resume/)，以及由 CI 自动渲染的 [PDF 版本](https://wi1dcard.dev/resume/Weizhe-Sun-Resume.pdf)。

从 2010 年接触 Pascal 语言起，我对代码产生了浓厚的兴趣，参加了信息学竞赛。后自学 MFC 和 WinForm，并在 2013 年开始接触外包项目。2015 年进入职场，逐渐转型 PHP 和后端方向。2018 年底开始涉足运维和网络相关。现就职于某区块链企业从事 **DevOps** 以及少量 IT 相关工作。

目前，我正在深入学习 **Kubernetes**；对 Golang 和 Rust 兴趣很大。

我的职业规划大多基于兴趣驱动，我喜欢做与众不同或是未曾有人尝试过的事。我善于独立思考、规划、钻研问题的更优解。在不断实践的过程中，我甚至会把自己推到极限，处于过度紧张和不健康的状态。我乐于高效地协作或提供帮助，但在专注时不希望被打扰，因此时常戴着耳机工作。

我热爱软件开发，享受发现问题并解决问题带来的成就感。你可以通过 `wi1dcard.cn@gmail.com` 联系我，期待与你成为同事和朋友！

</div>

## 自我修养

<div class="card">

- 高标准自我要求，态度严谨。
- 关注技术动向，社区活跃，积极参与开源。
- 良好的表达和总结能力，思维逻辑缜密，坚持写技术博客。
- 日常工作环境 macOS 和 Ubuntu；熟悉 CLI，不使用盗版软件。
- 重度 Google 用户。
- 良好的代码结构、命名、测试、文档、大小写、Git commit messages 以及 Git tree 习惯。
- 比开发者更关注权限与安全。
- 正努力成为 [T 型人才](https://en.wikipedia.org/wiki/T-shaped_skills)。

因此，我理想中所在的团队是：

1. 开放，严谨，热情的。
2. 工程师熟悉 macOS 或 Linux 的。
3. 支持工程师使用 Google 的。

</div>

## 技能列表

<div class="card">

≈ `#Kubernetes` + `#Prometheus-stack` + `#GitOps`

1. 拥有大量 Git workflows 和 CI/CD 实践经验，熟练使用 GitLab CI、GitHub Actions。
2. 拥有大量应用监控和预警实践经验，熟悉 Incident Management 和 On-call 工作机制，熟练使用 Prometheus、Alertmanager、Grafana、OpsGenie、Stackdriver。
3. 拥有大量 Infrastructure as Code 实践经验，熟练使用 Terraform 和 Ansible。
4. 具备 Kubernetes 集群维护经验，熟练使用 Docker、Helm、Helmfile，熟悉 Helm 生态。
5. 具备各大云服务商产品运维经验，熟悉 AWS 和 Google Cloud Platform，了解阿里云。
6. 迅速定位问题，并通过社区（GitHub Issues 等）获取帮助的能力。
7. 熟练读写英文文档，近期 OOPT 测得英语 CEFR 为 [C1](https://www.italki.com/user/7141493)。
8. 具备跨时区工作经验，熟练通过 Email 和 Slack 等方式与美国同事沟通。

</div>

## 近期工作

<div class="card">

- **把传统应用由 EC2 迁移到 Kubernetes**

  成功将多个拥有上千次有效 Git commits 的中大型 PHP 项目从原有 EC2 迁移到 Amazon EKS，有效提高系统资源利用率，大幅降低多个服务的编排难度。

- **创建并维护 Helm Charts**

  根据业务需要，创建并维护部署应用所使用的 Helm charts，包含 Deployments、Secrets、ConfigMaps、CronJobs 等资源。通过 Helmfile 将 Helm releases 代码化，采用「面向终态」而不是「面向过程」的运维思想彻底改造原有 DevOps 流程。

- **编写并优化 GitLab CI 配置**

  利用 GitLab CI 提供的 cache、artifact、rules、template job、detached job 等特性，不断优化 CI 配置，尽可能地自动化代码提交后风格检查、静态分析、单元测试、资源打包、构建镜像、部署等一系列操作。

- **维护 Terraform Modules 和 AWS 基础设施**

  基于 Infrastructure as Code 思想，创建并维护多个 Terraform modules 来管理位于 AWS 的基础设施，包含 EKS、S3、VPC、IAM、CloudFront、Lambda@Edge 等资源。通过 CI 自动化 apply，权限易管控、历史可追溯、随时可重建。

- **搭建并优化 Prometheus 等监控系统和告警规则**

  搭建 Prometheus 和 Grafana，维护 Prometheus Operator 等白盒监控和 Pingdom 等黑盒监控。根据业务需要，编写 Prometheus exporters、alert rules 和 Grafana dashboards。利用 PromQL 和可视化面板，降低排障难度，为日常监控和故障复盘提供可靠数据支持。

- **处理 Alerts 和优化 Incident 工作流**

  24 小时负责 On-call，本着追查到底的原则，排查、分发、追踪和处理各类 alerts。优化基于 Opsgenie 的 incident management 工作流，不断提高系统 SLA。

- **发现并解决现有开发工作流的问题**

  基于 GitOps 思想，通过调整配置或编写新工具，持续优化各团队的开发工作流，包括 CI pipelines 通知、cron jobs 通知、自动化 DB migrations、Slack workflows 和 unfurl 等。为业务工程师提供技术支持，包括开发系统工具、编写系统支持文档、排障、基础运维知识培训等；通过提升工程师的工作体验，进而提高开发效率。

- **构建公司网络并维护 Ansible Roles**

  为北京办公室提供基础网络保障，确保无障碍、无感知、快速稳定访问 Google 和位于美国数据中心的资源等，以及维护 UniFi Controller、Switch、AP 等网络设备。将网关部署和运维流程编写为 Ansible roles，并由 CI 自动化 apply。

- **优化权限和为美国同事提供 IT Support**

  负责员工入职与离职时在 Azure AD 和 G Suite 的 Onboarding 和 Offboarding。优化 SSO，确保各系统的用户均为合理的最小权限。为销售、市场和客户支持等团队的美国同事通过在线聊天、语音通话等方式提供 IT support。

</div>


### 继续了解我

<div class="card">

- 我的技术博客（<https://wi1dcard.dev/>）
- [LearnKu 有价值评论](https://learnku.com/users/32249/replies)
- [GitHub Repositories](https://github.com/wi1dcard?utf8=%E2%9C%93&tab=repositories&q=&type=source&language=)
- [GitHub Profile](https://github.com/wi1dcard)
- [GitLab Profile](https://gitlab.com/wi1dcard)
- [MBTI 性格报告](https://www.16personalities.com/ch/intj-%E4%BA%BA%E6%A0%BC)
- [我的详细任职历史](https://wi1dcard.dev/employment-history/)

</div>
