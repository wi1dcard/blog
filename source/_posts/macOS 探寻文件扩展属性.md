---
id: macos-ls-extended-attributes
date: 2018-08-29 16:31:08
title: macOS 探寻文件扩展属性
categories: wtf
---

## 过程

今天用 `ll` 命令偶然观察到一个细节，某些文件（夹）属性后面带有 `@` 字符：

```
$ ll
total 104
-rw-r--r--@  1 user  staff     0B  7 25 18:56 Icon?
...
drwx------@ 15 user  staff   480B  8 29 13:43 renren
```

经过谷歌一番，原来这代表文件含有 [扩展属性](https://en.wikipedia.org/wiki/Extended_file_attributes)。

使用 `ll -@` 可以查看详细的属性信息。

```
total 104
-rw-r--r--@  1 jootu  staff     0B  7 25 18:56 Icon?
        com.apple.FinderInfo      32B
        com.apple.ResourceFork    50K
...
drwx------@ 15 user  staff   480B  8 29 13:43 renren
        com.apple.quarantine      57B
```

对于强迫症来说，如何去除扩展属性显得尤为重要，尤其是不能容忍在一批同作用的文件里有那么几个「特殊的家伙」😂。

当然，在去除扩展属性之前，先要确定这个属性的用途。如上，`Icon?` 是系统文件，我没有修改；而 `renren` 是从网上下载解压的一个文件夹，应该没什么猫腻才对。

再次谷歌，得知 `com.apple.quarantine` 是系统自动添加的；像在 macOS 打开下载的文件时，经常会提示「这是从互联网下载的文件」云云，便是这个属性的作用。当用户确认之后，这个属性便会被取消。

当然我们也可以手动移除它，使用 `xattr` 命令即可。

```bash
xattr -d com.apple.quarantine
```

完。

## 参考

- <https://unix.stackexchange.com/questions/10/what-does-the-mean-in-ls-l>
- <https://medium.com/@jackyu/%E7%A5%9E%E7%A7%98%E7%9A%84-mac-ea-com-apple-quarantine-553b4d265f36>
- <https://www.jamf.com/jamf-nation/articles/59/managing-file-quarantine-attributes>