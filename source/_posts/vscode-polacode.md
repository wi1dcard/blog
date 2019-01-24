---
title: "Polacode - 生成优雅美观的代码片段图"
date: 2018-05-05 22:54:15
id: vscode-polacode
categories: Tools
---

> 妈妈再也不用担心滚动截图和截图边框了～

## 0x00

废话不多说，先上效果图：

![](https://i.loli.net/2018/08/15/5b73a517a1dd8.png)

## 0x01

其实这是一款 VS Code 的插件，只需要在 VS Code 内安装即可。

使用方法比较简单，首先使用快捷键 `Shift` + `Command` + `P` 调出命令窗口，然后输入 `Polacode` 回车。

弹出的界面就是 Polacode 了，在你的代码框里复制你要截图的代码，焦点切换到 Polacode 后 `Command` + `V`。

这时候你会发现代码已经粘贴进去了，美滋滋，而且还保留着你主题的颜色和格式；拉到最下面，单击快门图标保存即可。

## 0x02

最后，初次使用这个插件的时候有个 BUG，粘贴之后宽度超出 Polacode 边框宽度，显得非常难看，翻阅文档后发现有这么一句：

> When running out of horizontal space, try the command **View: > Toggle Editor Group Vertical/Horizontal Layout**.

于是按照步骤将编辑器切换为垂直布局即可，这样调出 Polacode 的时候就会是垂直切分的两个窗口，如下图：

![](https://i.loli.net/2018/08/15/5b73a51c8cd4a.png)

问题解决。

