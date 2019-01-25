---
title: "纠结！纯内网 Web 控制智能硬件的技术选型之路"
date: 2018-03-11 12:22:48
id: controlling-smart-device-on-web
categories: Documents
---

> 通常情况下，我们采用 TCP Socket 与智能硬件进行通信。外网环境中，有无数种解决方案：Swoole（PHP），Node.js，SuperSocket（.NET）…… 而在政企事业单位的内网环境，事情或许就不那么好办了。

## 0x01 目的

- 接收来自硬件的数据，并在 Web 端展示。
- 通过 Web 端操作，将指令下发至硬件。

## 0x02 限制

- 浏览器需要支持 IE 等老版本浏览器。
- 服务端需要支持 Windows Server 虚拟机（最低版本 2008）。
- 纯内网环境，无法访问外网源，无法使用各类包管理器（其实可以自己搭建内网源，但过于复杂，人力成本太高）。

## 0x03 思路

目前公司 Web 后端语言均为 PHP，所以以下思路全部围绕 PHP 开展。

### Plan A-1

既然围绕 PHP，首先我所想到的就是这种方案：

`Ajax/Axios + PHP + Swoole + Hardware`

> 前端之所以不采用 WebSocket，浏览器兼容性。

这也是我前几天的技术博客「Laravel + Swoole 实现 TCP/UDP Socket 服务端」所设想的，但很快这种方案被毙了，原因很简单：

- Swoole 不支持 Windows。

### Plan A-2

那么是否有办法在 Windows 下运行 Swoole？

- Cygwin？毙了，内网不能下载包。
- Hyper-V 虚拟机跑 Linux？毙了，嵌套虚拟化 Windows Server 2016 才支持。
- VMware？Virtual Box？毙了，且不说物理机的虚拟层支持不支持嵌套虚拟化（Nested），就是支持，指不定卡成什么样。
- Docker？不用想，毙了，Docker for Windows 基于 Hyper-V。

### Plan B-1

毙了 Swoole，还有 Workerman 啊。

于是看了下 [walkor/workerman-for-win](https://github.com/walkor/workerman-for-win)，凉凉。

相比于 Workerman Linux 版本几千个 Star，简直尬啊。再加上 README 标明的：「此版本可用于 windows 下开发使用，不建议用在生产环境」。最后，看了看[文档](http://doc3.workerman.net/install/requirement.html)，Win 版本少了些对于提高性能十分有益的重要特性。

毙了。

### Plan B-2

不死心，GitHub 上找找有没有小众又成熟的 PHP Socket 服务端。

- [reactphp/socket](https://github.com/reactphp/socket)
- [hoaproject/Socket](https://github.com/hoaproject/Socket)

前者内部未处理 `TCP 粘包` 问题，手动处理对于 PHP 组来说难度相当……巨大。

后者文档不全，非事件驱动，居然还是单进程、单线程的 while 循环。

毙了。

### Plan C

于是决定，不得不换一门语言处理这个问题。「这门语言」必须具有：易部署、稳定、兼容 Windows 的特性。

尽管我首先想到的是微软的亲儿子 .NET，但另一门语言也浮现在我的脑海里：Node.js。

Node.js 本身所具有的事件驱动、非阻塞 IO 等特性十分适合用来开发 Socket 服务端；这一点在各类社区也得到印证，使用 Node 开发的 WebSocket、Socket 服务端层出不穷，且十分活跃；而微软的支持也不差，VS Code 就是基于 Node 开发。

但痛点也有，例如：全是回调，随着项目规模增长，回调越来越多，参数类型不明确，异常处理困难，万一哪里没写好造成隐藏 BUG，动不动就崩溃，麻烦可就大了。何况公司目前还没有专业玩 Node 的程序员。

> 个人认为，Node.js 自己玩玩入门简单，几行代码就能上手运行，但想要在生产环境下玩转 Node：一方面需要很强的编程思维功底，不然很难理解这种完全非阻塞的模式；另一方面需要对 Node 文档进行通读，具有一定了解、经验，否则万一某个变量类型搞错抛出异常，或是 Buffer 使用不当导致内存泄露，那都是隐性且致命的。

忍痛割爱！毙了。

### Plan D

最后一个方案，.NET。大致思路是这样的。

`Ajax/Axios + PHP + .NET + Hardware` 

- .NET 方面采用成熟的 TCP/UDP 服务端组件 —— SuperSocket
- PHP 与 .NET 相互通信，可以采用 Redis 消息队列，MySQL 中转等方案；也可以将 PHP 作为 TCP Client 对 SuperSocket 发送数据，当 SuperSocket 接收到硬件数据时，调用 PHP 编写的 HTTP API 即可。

这是目前我能想到的，结合现实情况，最节省人力物力成本，且相对稳定、简易的解决方案。部署时只需要：

- 运行 WNMP，跑 PHP 代码。
- 安装 .NET Framework，跑 .NET 服务端。

即可。

## 0x04 感想

内网，坑！