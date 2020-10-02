---
id: alertmanager-dingtalk-integration-tips
tags: [Prometheus]
date: 2020-10-02 15:51:18
title: 改进 Alertmanager 的钉钉通知
categories:
---

多亏了 [prometheus-webhook-dingtalk](https://github.com/timonwong/prometheus-webhook-dingtalk) 项目，Alertmanager 集成钉钉消息通知得以实现。在实际使用过程中，我发现了一些可以改进的配置，例如通知消息模板可以更加清晰简洁、可以根据不同的报警优先级决定是否 Mention 某人等。

<!--more-->

## 改进通知模板

改进前：

![](/resources/46732adfdca2bd511b718e012552712f.png)

改进后：

![](/resources/6abee8f7d6c82925fbfdc01c183be6bf.png)

具体模板（`/config/example.tmpl`）：

```go
{{/* Alert List Begin */}}
{{ define "example.__text_alert_list" }}{{ range . }}

**{{ .Annotations.message }}**

[Prometheus]({{ .GeneratorURL }}) | [Alertmanager](https://alertmanager.example.com/#/alerts) | [Grafana](https://grafana.example.com/dashboards)

{{ range .Labels.SortedPairs }}> - {{ .Name }}: {{ .Value | markdown | html }}
{{ end }}
{{ end }}{{ end }}
{{/* Alert List End */}}

{{/* Message Title Begin */}}
{{ define "example.title" }}{{ template "__subject" . }}{{ end }}
{{/* Message Title End */}}

{{/* Message Content Begin */}}
{{ define "example.content" }}
### \[{{ index .GroupLabels "priority" }}\] [{{ index .GroupLabels "alertname" }}](https://example.app.opsgenie.com/alert/list)

{{ if gt (len .Alerts.Firing) 0 -}}
{{ template "example.__text_alert_list" .Alerts.Firing }}
{{- end }}

{{ if gt (len .Alerts.Resolved) 0 -}}
{{ template "example.__text_alert_list" .Alerts.Resolved }}
{{- end }}
{{- end }}
{{/* Message Content End */}}
```

`prometheus-webhook-dingtalk` 配置：

```yaml
templates:
  - /config/example.tmpl # 模板路径

targets:
  general:
    url: https://oapi.dingtalk.com/robot/send?access_token=...
    secret: ...
    message:
      title: '{{ template "example.title" . }}' # 渲染自定义模板
      text: '{{ template "example.content" . }}' # 渲染自定义模板
```

## Mention 海外号码

请看 [PR #119](https://github.com/timonwong/prometheus-webhook-dingtalk/pull/119) 或下面的例子。

## 选择性 Mention 某人

首先配置两个 `targets`，前者直接渲染模板，后者模板中再添加一行 `###### @手机号`（显示效果可以参考文章开头的图片）：

```yaml
targets:
  general: &target_base
    url: https://oapi.dingtalk.com/robot/send?access_token=...
    secret: ...
    message:
      title: '{{ template "example.title" . }}'
      text: '{{ template "example.content" . }}'

  critical:
    <<: *target_base
    mention:
      # 此处必须声明 Mention 的号码...
      mobiles: ["+1-1234567890", "18800001111"]
    message:
      text: |
        ###### @+1-1234567890 @18800001111

        {{ template "example.content" . }}
```

随后在 Alertmanager 配置两个分别对应的 `receivers`，以及多条 `routes` 即可：

```yaml
route:
  group_by: ["priority", "alertname"]
  receiver: general
  routes:
    - match_re:
        priority: P1
      receiver: critical

receivers:
  - name: general
    webhook_configs:
      - &dingtalk_config
        send_resolved: false
        url: http://alertmanager-webhook-dingtalk/dingtalk/general/send

  - name: critical
    webhook_configs:
      - <<: *dingtalk_config
        url: http://alertmanager-webhook-dingtalk/dingtalk/critical/send
```
