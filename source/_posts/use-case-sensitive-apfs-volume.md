---
id: use-case-sensitive-apfs-volume
tags: [macOS, Git]
date: 2019-02-21 13:20:29
title: 使用大小写敏感的 APFS 卷存储代码
categories: Tutotials
---

由于 macOS 默认分区和卷都是大小写不敏感的，对于开发者来说，通常需要面对的是大小写敏感的环境。并且，这个小差异的确带来了一些不便，例如 [使用 Git 时遇到的坑](https://learnku.com/articles/3782/a-pit-reminder-a-class-or-a-trait-suddenly-can-not-find)。然而，自己又没有勇气重新格式化、装系统。直到最近，在跟同事聊天时给了我一个启发……

<!--more-->

## 思路

macOS 最新的 APFS 文件系统支持在 Container 内任意创建 Volume（卷），比分区简单快捷很多，同时还可以单独指定是否大小写敏感。再加上 Unix 能够任意挂载的特性，因此我只需创建一个新卷，将项目文件移动过去，随后将该卷挂载至原代码目录即可。

具体操作方式如下。

## 步骤

### 创建大小写敏感的卷

首先，打开 **Disk Utility**，确保你的文件系统是 APFS；若是 HFS，请 [升级](http://www.macintosh-data-recovery.com/blog/how-to-convert-hfs-hard-drive-to-apfs-on-high-sierra/)。

在左侧列表右键单击 **Macintosh HD**，选择 **Add APFS Volume**。

给它起个名字，随后 Format 选择 **APFS (Case-sensitive)**，务必注意大小写敏感。

确认无误后点击 Add 即可。

### 迁移数据

没有问题的话，新创建的卷应该已经挂载到 `/Volumes/<NAME>` 目录，接下来需要把原有代码文件移动到这个卷。使用 `mv` 命令，或是通过 Finder 操作均可。

### 修改挂载点

默认情况下，系统会将所有卷挂载至 `/Volumes` 目录下，以卷名区分。我的项目存放于 `/Projects`，因此需要将新卷挂载到该目录。

再次打开 **Disk Utility**，在左侧列表右键单击新创建的卷，选择 **Get Info**。点击 **File system UUID** 一行，使用 `Command` + `C` 复制出来：

```
File system UUID : XXXXXXXX-ABCD-DCBA-1234-XXXXXXXXXXXX
```

记住冒号后的 UUID。接下来点击 **Unmount** 按钮卸载该卷。

打开终端，使用 `sudo vifs` 即可编辑 `/etc/fstab` 文件，输入以下内容并保存：

```bash
UUID=XXXXXXXX-ABCD-DCBA-1234-XXXXXXXXXXXX <MOUNT_POINT> apfs rw 0 2
```

请注意将 `<MOUNT_POINT>` 替换为挂载目录，例如 `/Projects`。若该目录不存在，不要忘记创建它。

### 重新挂载

重新点击 **Mount** 按钮或是 `mount -a` 命令均可。

完成！效果如下：

![](/resources/79b332ecf9af7314541b4ddad1a25575.png)

## 结语

参考：

- <https://apple.stackexchange.com/questions/291149/permanently-change-mount-point-of-volume>

