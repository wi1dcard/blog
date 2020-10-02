---
id: reuse-gitlab-ci-configs-across-projects
tags: [CI/CD]
date: 2020-02-26 22:19:06
title: 跨项目 GitLab CI 配置复用与管理
---

为了能够使代码在不同项目复用，我司抽象、编写了许多私有 libraries。它们的源代码被统一存放在 GitLab，由 CI 确保代码风格一致，并执行单元测试和静态检查等。由于仓库数量众多，如何有效地组织和管理 CI 配置成了问题。经过长时间的探索和优化，我整理了一些经验，希望对你有所帮助。

<!--more-->

![](/resources/7d88ca70b055b3162b4c4b3c0499ab95.png)

## YAML 的小技巧

整整 70 多页的 [YAML 1.2 Specification](https://yaml.org/spec/1.2/spec.pdf) 定义了 YAML 灵活、丰富的语法。这其中一项名为 [Node Anchors](https://yaml.org/spec/1.2/spec.html#id2785586) 的特性能够帮我们实现纯 YAML 的配置复用。

例如：

```yaml
deploy production:
  script:
    - echo "deploying to production"
  only: &foo_anchor
    variables:
      - $CI_COMMIT_TAG

deploy staging:
  script:
    - echo "deploying to staging"
  except: *foo_anchor
```

其中，`only` 和 `except` 是结构相同但作用刚好相反的一对字段。使用 `&` + anchor 标识符即可设置锚点，在需要复用的字段填写 `*` + anchor 标识符即可，它们的值将会保持一致。

YAML 1.1 中还定义了 [Merge Key](https://yaml.org/type/merge.html) 特性，虽然在 YAML 1.2 中已经没有明确规定，但在 GitLab CI 配置中仍然可以继续使用。相比之下，我们更加推荐使用 `extends` 字段，因此该此处不再赘述。

## `extends` 字段

在 GitLab CI 配置文档中描述了一个名为 [`extends`](https://docs.gitlab.com/ee/ci/yaml/#extends) 的字段，可类比地理解为面向对象中的「继承」。例如：

```yaml
.foo_template_job:
  script:
    - echo "Deploying ${DEPLOY_ENV}"

deploy production:
  extends: .foo_template_job
  variables:
    DEPLOY_ENV: production

deploy staging:
  extends: .foo_template_job
  variables:
    DEPLOY_ENV: staging
```

其中，`.foo_template_job` 是一个 template job，顾名思义，它不会被当作真正的 job 出现在 pipelines 中，而是作为模板被其它 jobs 复用、扩展。同时我们分别定义了 `deploy production` 和 `deploy staging` 两个 job 以及不同的 `variables`，最终被 template job 内的 `script` 使用。

这样我们就能达成各个环境可「继承」同一份部署脚本的目的，只需扩展并修改变量即可。

`extends` 还支持多个 template jobs 以及在普通 job 中覆盖模板字段等特性：

```yaml
.yarn:
  image: node:latest
  before_script:
    - yarn install --production
    - export PATH="$PATH:$PWD/node_modules/.bin"

.cached:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - dist/

build:
  extends:
    - .yarn
    - .cached
  image: node:12 # 覆盖 .yarn 中定义的 image
  script:
    - echo "Building artifacts"
```

## `include` 字段与 Git Subtree

上文中我们介绍了如何在 `.gitlab-ci.yml` 中实现内部复用，这在单一项目中有效。为了能够跨项目复用，我们使用了 [`include`](https://docs.gitlab.com/ee/ci/yaml/#include) 字段和 Git subtree 来实现。

通过 `include` 字段我们可以将复杂的 CI 配置拆分成多个文件，例如管理多个 stages：

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy
include:
  - local: .gitlab/build.yml # 仓库内的配置文件路径
  - local: .gitlab/deploy.yml

# .gitlab/build.yml
build binaries:
  stage: build
  script:
    - echo "Building binaries"

# .gitlab/deploy.yml
deploy production:
  stage: deploy
  script:
    - echo "Deploying production"
```

我们把常用的 template jobs 集中到了一个名为 `ci-templates` 的仓库中，例如 PHP 项目必备的 `composer install`：

![](/resources/bdd8e4f8f8ac2599d4e3838779c68253.png)

随后在需要使用的项目中，将 `ci-templates` 仓库的内容通过 subtree 引入：

```bash
git subtree add --prefix=.gitlab/ci-templates git@gitlab:devops/ci-templates.git master --squash
```

再使用 `include` 指令包含即可：

```yaml
include:
  - local: .gitlab/ci-templates/templates/composer.yml

php-cs-fixer:
  extends: .composer # Template job 位于被 include 的文件中
  script:
    - php-cs-fixer fix --dry-run --diff 1>&2
```

关于 subtree 的相关知识不再赘述，请参考相关文档。

## 不使用 Git Subtree 的 `include`

通过 Git subtree 引入的文件不会随着上游（`ci-templates`）仓库的更新而同步，需要执行 `git subtree pull` 命令将变更 Pull 到项目仓库中。这种方式的好处是 DevOps 修改 templates 时，不会造成潜在的、可能造成其它项目 CI 损坏的变更。同一 Git ref（例如 tags 或 commits）执行 pipelines 的结果能够保持一致。

但随着引用 templates 的仓库越来越多，每次更新 `ci-templates` 时，我们不得不在各个项目仓库内手动 pull。随着 [GitLab 11.7 发布](https://about.gitlab.com/releases/2019/01/22/gitlab-11-7-released/#include-cicd-files-from-other-projects-and-templates)，此问题终于得到了解决，`include` 字段支持直接引入来自其它仓库的 templates 文件了（参考 [`include:file`](https://docs.gitlab.com/ee/ci/yaml/#includefile)）。以下是一个简单的例子：

```yaml
include:
  - project: devops/ci-templates # GitLab 项目全称
    file: /templates/composer.yml # Template 文件在仓库内的路径

phpstan:
  extends: .composer
  script:
    - phpstan analyse --ansi
```

## 结语

由于我们内部的 PHP 扩展包 CI/CD 流程极为相似且较为简单，出现潜在「多米诺骨牌效应」的可能性较低；考虑到维护成本，我们最终选择在扩展包仓库使用 `include:file` 的方式引入 templates。CI/CD 复杂严谨的项目类型仓库，则保留使用 Git subtree，以降低意外行为的可能性。
