---
title: "VS Code - 来自微软的骚操作"
date: 2018-07-10 09:23:17
id: proud-to-use-vscode
categories: tools
---

PHP Storm 因功能强大被 PHPer 们所熟知，但自身功能愈发强大带来的问题也同样明显：功能臃肿／启动缓慢／内存占用高等。VS Code 经过几年的发展算是后起之秀，占领了一部分小众市场。

尝试发现，通过深度配置，VS Code 编写 PHP 代码的体验完全不亚于 PHP Storm。故今天为大家介绍：来自微软的骚操作 —— VS Code。

## 更新（2018年7月10日）

最近发现个新插件，支持同步 VSCode 设置，名叫「[Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)」，因此我使用此插件把配置完全公开至 [GitHub Gist](https://gist.github.com/wi1dcard/32d8cc169104a578d4adb509a91296c2) 以供参考。

![最新效果](https://i.loli.net/2018/07/10/5b4442cd2358e.png)

## 安装

直接访问官网：<https://code.visualstudio.com>

## 插件

VS Code强大之处不在于本身，而在于强大的可扩展性、以及日渐壮大的插件商店。这里列出我用到的几个插件：

*   One Dark Pro：一款源自Atom的主题；
*   Composer：用于支持在Code命令窗口（⬆️+Command+P）快捷输入Composer命令；
*   Laravel 5 Snippets（Winnie Lin）：包含常用Facade的Snippets；
*   Laravel Artisan：用于支持在Code命令窗口快捷输入Artisan命令；
*   Path Intellisense：智能补全文件路径；
*   PHP Debug：配合XDebug实现强大的调试功能；
*   PHP DocBlocker：智能补全PHP Doc；
*   PHP Intelephense：截至目前我认为最好的PHP自动补全插件；
*   vscode-icons：替换左侧资源管理栏的图标。

## 配置

装完插件需要调整部分配置实现自定义部分功能和界面，使用 `Command+,` 打开设置页，在右侧输入用户配置替换原有系统配置即可。分享我的配置：

```json
{
    "workbench.colorTheme": "One Dark Pro", // 主题
    "editor.formatOnType": true, // 打字时自动美化代码
    "editor.autoIndent": true, // 自动调整缩进
    "editor.formatOnPaste": true, // 粘贴时自动美化代码
    "editor.fontSize": 14, // 字体大小
    "editor.lineHeight": 26, // 行高
    "editor.fontFamily": "Monaco", // 编辑器字体
    "php.validate.enable": true, // 打开Code自带的自动检查代码
    "php.validate.executablePath": "php", // 配置php执行文件的路径
    "files.autoSave": "onFocusChange", // 编辑器离开焦点自动保存
    "php.suggest.basic": false, // 关闭Code自带的自动补全(有插件)
    "editor.snippetSuggestions": "inline", // Laravel Snippets在自动补全列表中的排序
    "workbench.iconTheme": "vscode-icons" // 图标
}
```

`2018.5.13` 更新：

```json
{
    //常用
    "workbench.colorTheme": "One Dark Pro",
    "workbench.iconTheme": "vscode-icons",
    "window.zoomLevel": 0,
    "explorer.confirmDelete": false,
    "files.autoSave": "onFocusChange",

    //编辑器
    "editor.formatOnType": true,
    "editor.formatOnPaste": true,
    "editor.autoIndent": true,
    "editor.fontSize": 14,
    "editor.lineHeight": 26,
    "editor.fontFamily": "Monaco",
    "editor.snippetSuggestions": "inline",

    //PHP
    "php.suggest.basic": false,
    "php.validate.enable": true,
    "php.validate.executablePath": "php",

    //C#
    "csharp.format.enable": false,
    "csharp.referencesCodeLens.enabled": false,

    //Python
    "python.pythonPath": "python3",

    //第三方插件
    "code-runner.saveAllFilesBeforeRun": true,
    "phpfmt.detect_indent": true,
    "phpfmt.visibility_order": true
}
```

## 自定义Snippets

打开主菜单->首选项->用户代码片段，输入：PHP，即可跳到自定义 Snippets 页面，分享我的配置：

```json
{
    "Laravel Action":{
        "prefix": "action",
        "description": "Action in Laravel Controller",
        "body": [
            "public function ${1:action}(Request \\$request) {",
            "\t$0",
            "}"
        ]
    }
}
```

关于自定义Snippets的详细介绍可参考此文：[跟我一起在Visual Studio Code 添加自定义snippet（代码段），附详细配置](http://blog.csdn.net/maokelong95/article/details/54379046)

## 快捷键

[VS Code for Mac常用快捷键列表](http://www.jianshu.com/p/9f50dfc985e2)

## 最终效果

今晚会议桌，不要错过。／斜眼笑

![](https://i.loli.net/2018/08/15/5b73a5a0c4dac.png)