---
title: "macOS 打开自带 NTFS 写文件功能"
date: 2017-09-22 16:27:27
id: macos-write-ntfs-driver
categories: Tutorials
---

1. 打开terminal

2. 执行如下命令：

```
diskutil list
```

可查看全部分区的名字，MAC系统默认挂载全部分区到 /Volumes 目录，

3. 执行如下命令：

```
sudo vim /etc/fstab
```

编辑fstab文件，添加如下一行并保存：

```
LABEL=「分区名」 none ntfs rw,auto,nobrowse,nosuid
```

具体参数值含义可以自行谷歌。

4. 由于设置好之后，磁盘不会在Finder内显示，所以我们需要建个软链接到桌面方便访问：

```
sudo ln -s /Volumes ~/Desktop/Volumes
```

注：MAC系统默认挂载全部分区到 /Volumes 目录，所以你也可以单独链接某个Volume。

5. Reboot!