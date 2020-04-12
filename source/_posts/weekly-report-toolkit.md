---
id: weekly-report-toolkit
date: 2018-08-30 13:42:06
title: 我的周报工具箱
categories: Misc
tags: [PHP]
---

大概在两个月以前，刚入职目前所在的公司，要求写周报，而且要求比较详细，每天的任务都需要列清楚。

对于我这种很健忘，并且喜欢以结果为导向，专注于代码的程序员简直要命。

所以下决心，搞个帮我写周报的工具。于是这个项目诞生了。

自己用了一阵子感觉还不错，经过一番整理完善决定开源。

仓库地址：<https://github.com/wi1dcard/weekly-report>

其实没什么技术含量，无非就是利用 Git 的提交记录，编排成 Markdown。

BTW，其实或许用 Python 写会更合适。

最后，我的周报项目 VS Code 配置如下。

```json
{
    "[markdown]": {
        "editor.wordWrap": "off",
        "editor.fontFamily": "Inconsolata",
        "editor.lineHeight": 24,
        "editor.fontSize": 16,
        "editor.fontWeight": "normal"
    },

    "markdown-pdf.displayHeaderFooter": false,
    "markdown-pdf.includeDefaultStyles": false,
    "markdown-pdf.styles": [
        "pdf.css"
    ],
    "markdown-pdf.width": "30cm",
    "markdown-pdf.height": "100cm"
}
```
