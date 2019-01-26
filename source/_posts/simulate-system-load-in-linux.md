---
id: simulate-system-load-in-linux
date: 2019-01-22 22:50:29
title: Linux 中模拟多种系统负载的方法
categories: Collections
tags: [Linux]
---

近期在研究系统监控预警，包括但不限于：CPU 使用率预警、内存使用率预警、磁盘使用率预警以及 IO 预警。

在测试过程中，需要模拟系统负载来验证预警规则是否有效。故总结几种模拟负载的方式，以供日后查询。

<!--more-->

## CPU 使用率

方法很多，最简单直接的有：

- `cat /dev/zero > /dev/null`
- `cat /dev/urandom | gzip -9 > /dev/null`
- `dd if=/dev/zero of=/dev/null`
- `yes > /dev/null`
- ...

以上方法仅能对单核施加压力，多核心可以使用 `for` 循环 + 命令结尾 `&`，或使用多个管道连接来实现：

- `for i in 'seq 1 $(cat /proc/cpuinfo | grep "physical id" | wc -l)'; do cat /dev/zero > /dev/null & done`
- `cat /dev/urandom | gzip -9 | gzip -d | gzip -9 | gzip -d > /dev/null`

## 磁盘使用率

上节我们使用到了 `dd` 命令，该命令结合 `/dev/zero` 也可以被用于输出一定大小的文件，从而模拟磁盘使用率。

例如：

```
dd if=/dev/zero of=loadfile bs=1M count=1024 # 输出 1024M 的 \0 到 loadfile
```

## 磁盘 IO

利用刚刚生成的 `loadfile`，加上 `cp` 命令可以一定程度地模拟顺序 IO：

```
while true; do cp loadfile loadfile1; done # 无限循环复制文件
```

## 内存使用率

回看前面的几项需求，其实都可以通过 `stress` 工具和 [`lookbusy`](http://www.devin.com/lookbusy/) 工具实现，并且更加精准、可控、易用。

以下分别列出几个例子，方便<del>照抄</del>理解。

```bash
stress --cpu 2 # 产生 2 个工作进程对 CPU 施加压力，也就是将会占用两个 CPU 核心
stress --vm 1 --vm-bytes 128M --vm-hang 0 # 产生 1 个工作进程，占用 128MB 内存并保持
stress --io 1 # 产生 1 个工作进程对 IO 施加压力
```

```bash
lookbusy -c 50 # 占用所有 CPU 核心各 50%
lookbusy -c 50 -n 2 # 占用两个 CPU 核心各 50%
lookbusy -c 50-80 -r curve # 占用所有 CPU 核心在 50%-80% 左右浮动

lookbusy -c 0 -m 128MB -M 1000 # 每 1000 毫秒，循环释放并分配 128MB 内存
lookbusy -c 0 -d 1GB -b 1MB -D 10 # 每 10 毫秒，循环进行 1MB 磁盘写入，临时文件不超过 1GB
```

以上命令的参数均可结合使用，同时对系统多个维度施加压力。

## 其它工具

- `stress-ng`: <https://kernel.ubuntu.com/~cking/stress-ng/>
- `cpulimit`: <https://github.com/opsengine/cpulimit>
- `cpu-load-generator`: <https://github.com/beloglazov/cpu-load-generator>
- `fio`: <https://github.com/axboe/fio>

### 参考

- <https://stackoverflow.com/questions/2925606/how-to-create-a-cpu-spike-with-a-bash-command>
- <https://nitinbhojwani-tech-talk.blogspot.com/2017/05/simulate-cpu-memory-and-disk-load-on.html>
- <https://bash-prompt.net/guides/create-system-load/>
- <https://stackoverflow.com/questions/1971422/linux-how-to-put-a-load-on-system-memory>
- <https://www.cyberciti.biz/faq/stress-test-linux-unix-server-with-stress-ng/>
- <https://unix.stackexchange.com/questions/99334/how-to-fill-90-of-the-free-memory>

### 拓展

计算 IO 占用率（百分比）的方法：<https://unix.stackexchange.com/questions/318274/how-to-calculate-disk-io-load-percentage>
