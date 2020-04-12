---
id: easier-curl-with-colors
tags: [PHP]
date: 2019-02-13 13:14:54
title: 更加清晰易读的 cURL 工具
categories: Recommendations
---

[reorx/httpstat](https://github.com/reorx/httpstat) 是一款更加清晰易读的 cURL 工具。其本意是将 cURL 请求的统计数据图形化、可视化，但也可作为日常的 HTTP 客户端使用。

<!--more-->

效果如下：

![](https://github.com/reorx/httpstat/raw/master/screenshot.png)

相比于繁复细致的 cURL 选项，使用此项目可快速查看响应头及相关的统计数据。

安装方式十分简单，通过 Python 的包管理器 `pip` 或是 Homebrew 均可：

```bash
pip install httpstat
# 或
brew install httpstat
```

由于该项目实际是个单文件 Python 脚本，所以作者还给出了直接下载使用的方式，在部分场景下十分有用：

```bash
wget https://raw.githubusercontent.com/reorx/httpstat/master/httpstat.py
```

同时，由于本项目是 cURL 的二次包装，其内部仍旧通过 `curl` 命令实现，所以支持大量 cURL 参数，面对复杂的请求数据同样得心应手，例如：

```bash
httpstat httpbin.org/post -X POST --data-urlencode "a=b" -v
```

另外，该项目还有其它语言版本，例如：

- Go: [davecheney/httpstat](https://github.com/davecheney/httpstat)
- Bash: [b4b4r07/httpstat](https://github.com/b4b4r07/httpstat)
- Node.js: [yosuke-furukawa/httpstat](https://github.com/yosuke-furukawa/httpstat)
- PHP: [talhasch/php-httpstat](https://github.com/talhasch/php-httpstat)

通过查看源码进行一番比较，其中 Bash 和 PHP 版本均采用与 Python（也就是原版）同样的实现方式，即通过 `curl` 命令实现；而 Go 和 Node.js 版本则不依赖于 `curl` 命令，直接使用网络库发起请求并输出统计数据。这两种实现方式各有优劣，我的倾向如下：

- Python 版本适合有 Python 环境，且需要与 `curl` 命令高度兼容的场景。
- Bash 版本适合无 Python 环境，且需要与 `curl` 命令高度兼容的场景。
- Go 版本无须多言，适合零依赖场景。
- Node.js 和 PHP 版本，用于兴趣爱好研究吧😂。

目前，我在我的 macOS 上安装了 Python 版本，路由器等网络设备上安装了 Go 版本。

最后，该项目还提供了一些环境变量用于输出速度等，例如通过 HTTP 协议下载 CacheFly 的文件来测试下行网速：

```bash
HTTPSTAT_SHOW_SPEED=true httpstat http://cachefly.cachefly.net/10mb.test
```

有兴趣就看看项目文档吧！
