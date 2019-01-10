---
title: "树莓派折腾随手记 - 修改Swap大小"
date: 2018-03-01 10:11:07
id: raspberry-pi-change-swap-size
categories: Tutorials
---

> 树莓派默认情况下，虚拟内存只有区区 100 MB，这完全不能满足正常使用需求，本文将讲解如何修改为合理的值。

通常情况下，在 Linux 内，我们采用`swapoff`/`mkswap`/`swapon`等命令来格式化并挂载 Swap，但在树莓派内我们不推荐使用这种方式，树莓派本身提供了配置文件可以直接修改。

`sudo nano /etc/dphys-swapfile`

找到如下行：

`CONF_SWAPSIZE=100`

修改为：

`CONF_SWAPSIZE=1024`

然后重启，使用`free -m`查看，你就会发现：

```
              total        used        free      shared  buff/cache   available
Mem:            875         103         492          19         279         702
Swap:          1023           0        1023
```

Swap 已经变为 1GB。

> Referer: http://www.bitpi.co/2015/02/11/how-to-change-raspberry-pis-swapfile-size-on-rasbian/