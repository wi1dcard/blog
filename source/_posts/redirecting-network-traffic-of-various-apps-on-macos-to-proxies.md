---
id: redirecting-network-traffic-of-various-apps-on-macos-to-proxies
tags: [macOS, GFW]
date: 2020-03-28 04:29:03
title: 盘点使 macOS 应用流量通过代理的多种方式
categories: Tutorials
---

在开发过程中，我们经常需要使用到国外的资源，例如各种包依赖等。国内目前比较普遍的做法是使用由知名第三方维护的国内镜像。虽然方便，但也存在一些无法避免的问题，例如：

- 镜像可靠性未知，出问题时我们无能为力，只能等待第三方修复。
- 镜像同步时间未知，可能存在数据滞后。
- 存在安全隐患（尽管可能性较小）。

因此，我个人更加推荐依赖代理来实现快速访问所需资源的目的。本文不会涉及任何违反法律法规的内容，只来谈谈 macOS 下如何让不同应用的流量通过 **本地的** 代理服务。

<!--more-->

在开始前，我将假设你已经在本地配置好了 HTTP 和 SOCKS5 代理服务，分别能够通过 `http://127.0.0.1:8080` 和 `socks5://127.0.0.1:1080` 访问。

## 系统代理

作为 macOS 内置的功能，你可以在 System Preferences -> Network -> Advanced -> Proxies 内配置系统代理。

![](/resources/0575c4fefed9644a5774137af4e7adc6.png)

另外也可以使用命令行配置系统代理：

```bash
networksetup -setwebproxy "Wi-Fi" 127.0.0.1 8080 # HTTP proxy
networksetup -setsocksfirewallproxy "Wi-Fi" 127.0.0.1 1080 # SOCKS5 proxy

networksetup -setwebproxystate "Wi-Fi" on
networksetup -setsocksfirewallproxystate "Wi-Fi" on
```

其中 `"Wi-Fi"` 是你的网络接口名，请根据实际情况填写。

不过，macOS 的系统代理仅对部分 GUI 或做了 macOS 适配的应用生效，例如 Chrome 等 Web 浏览器、系统更新等。在开发时我们经常需要接触 CLI，应该怎么做呢？

## `http_proxy` 和 `all_proxy` 环境变量

绝大多数使用 HTTP 协议的 CLI 应用都支持这两个环境变量，这几乎已经成为了「行业标准」：

```bash
export http_proxy=http://127.0.0.1:8080 https_proxy=$http_proxy all_proxy=socks5://127.0.0.1:1080
```

典型支持的命令包括 `curl`、`go get`、`composer install` 等。使用 `curl -v ipinfo.io` 查看输出可发现代理配置已经生效：

```plain
* Uses proxy env variable http_proxy == 'http://127.0.0.1:8080'
*   Trying 127.0.0.1...

...
```

如果你本地的代理服务常驻后台运行，可将 `export ...` 命令写入 `.zshrc`，这样每次启动 Zsh（Shell）时就自动配置好了。

## SSH Config `ProxyCommand` 指令

像 Git over SSH、SCP、SFTP 这类基于 SSH 协议的应用，并不支持以上两个环境变量。不过我们可以修改 SSH 配置文件 `~/.ssh/config` 来实现，例如：

```conf
Host github.com
    ProxyCommand /usr/bin/nc -x 127.0.0.1:1080 %h %p
```

以上配置中的 `ProxyCommand` 只在连接到 `github.com` 时生效，你可以将 `Host github.com` 替换成其它 Git 服务商的主机名，也可以替换为 `Host *`，表示 SSH 到任意主机均生效。但我并不推荐这么做，除非你想 SSH 到自己的服务器时也通过代理。

## Proxifier 和 Surge

根据我自己的经验，以上方法已经能够覆盖绝大多数开发者的使用场景。如果有些应用还是不走代理，你可以试试 Proxifier 和 Surge 这两款产品。其中 Surge 是 macOS 专有应用，不可用于 Windows 或 Linux 系统。这类应用的思路大致是：

1. 伪装成 TUN 设备（可理解为虚拟网卡）。
2. 修改或覆盖系统默认路由，把所有 TCP、UDP、ICMP 等三层及以上的流量全部发到虚拟 TUN 设备。
3. 经过内部处理后把流量导向代理服务。
4. 代理服务器流出的流量使用 `SO_MARK` 等方式进行特殊标记，使用系统策略路由导向到真实网卡，避免死循环。

例如启动 Surge 增强模式后，可使用 `netstat -nr` 看出路由表的变化：

```plain
Routing tables

Internet:
Destination        Gateway            Flags        Netif Expire
default            192.168.1.254      UGSc           en0             <-- 默认路由
1                  198.18.0.1         UGSc         utun7             <---
2/7                198.18.0.1         UGSc         utun7              |
4/6                198.18.0.1         UGSc         utun7              |  为了覆盖默认路由
8/5                198.18.0.1         UGSc         utun7              |  Surge 新增的路由
16/4               198.18.0.1         UGSc         utun7              |
32/3               198.18.0.1         UGSc         utun7              |
64/2               198.18.0.1         UGSc         utun7             <---
...
```

虚拟 TUN 设备接口名为 `utun7`，网关 IP 为 `198.18.0.1`，这个 IP 段还被 Surge 用来做一些特殊用途，例如反查 IP 对应的域名以支持策略代理功能，在此不再详述。

这类实现虽然理论上能够将系统所有流量都导向这个虚拟的 TUN 设备，但仍有一些局限。目前根据我的观察，FaceTime 似乎不会遵循路由表的配置，我猜是 Apple 为了优化通讯协议直接绕过了自定义路由表以便于发起点对点通讯吧。

另外，由于 SOCKS 和 HTTP 代理协议的限制，虽然修改路由表后 ICMP 流量也会到达虚拟 TUN 设备，但它不能代理 ICMP 协议，因此如何「优雅地」处理这些流量，仍然是 Surge 这类产品需要优化的问题。

综上，我个人不特别常用 Surge 的增强模式，但有时不确定某个应用是否支持通常的代理配置、时间又比较紧张时，魔改路由的确是个简单粗暴、快刀斩乱麻的解决方案。

## 通过 `LD_PRELOAD` 劫持共享库

利用这种方式最好的当属 [proxychains-ng](https://github.com/rofl0r/proxychains-ng) 项目了，它是上古世纪 proxychains 的继任者。

主要思路是通过修改 `LD_PRELOAD` 环境变量，劫持 `connect()` 等系统调用，从而将流量转发到代理服务器。由于我对这类产品使用不多，因此不多作评论。但比较肯定的是，像 Golang 静态编译后的应用，由于它们不会载入系统共享库，所以 `proxychains-ng` 对其无效。

## 通过 `ptrace` 跟踪系统调用

与上一种方法类似，该方法的思路也是对 `connect()`「做手脚」，只是不通过劫持共享库实现。只可惜目前 macOS 上由于系统安全性等原因，这类实现仍然处在探索阶段。另外，我个人比较担心（猜测）通过 `ptrace` 监视系统调用，性能是否会受到明显影响。因此目前暂时不推荐。如果你有兴趣的话，可以看看 [graftcp](https://github.com/hmgle/graftcp) 项目。

## 总结

以上是我知道的几乎所有在 macOS 上配置代理的方法。个人比较推荐前几种，既能够覆盖大多数场景，也不需要安装额外的应用。如果你对网络方面感兴趣，也不妨探索性地尝试下其它方案。
