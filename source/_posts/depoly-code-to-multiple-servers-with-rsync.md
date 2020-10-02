---
title: "服务器源码同步：rsync 配置过程小记"
date: 2017-09-20 07:07:50
id: depoly-to-multiple-servers-with-rsync
tags: [Legacy]
---

9.20 updated:

今天检查多家公司的管理端页面时发现，居然其他公司可以看到我们的测试数据，遂检查数据库，并不存在测试数据，又去翻配置 env 文件，数据库配置正常，又排除 rsync 同步了 config 缓存的可能之后，最终发现是 nginx 配置引起的反向代理全部进了 demo 服务器。。。

不过这也引起了我的重视：由于 laravel cache 驱动为 file，而 rsync 同步列表并没有排除`bootstrap/cache/config.php`，这样会导致执行`php artisan config:cache`缓存命令后，全部公司都连接同一个数据库！

于是开始解决问题：

step1.

exclude.list 单独写为一个文件，一行一条需要排除的相对路径；其中，添加：`bootstrap/cache/config.php`，排除此文件。

step2.

把原 exclude 参数改为：`exclude-from=<path>/exclude.list`，这样同步的时候就会排除掉 list 里的全部路径了。

done!

另外，rsync 可以实现同步本机文件，如下：

```
rsync -avzP --delete sgbd/ xlba/ --exclude-from='/home/wwwroot/env/ext/exclude.list'
```

直接写两个相对路径（源、目标）就可以了。

----

由于项目需要，故配置 rsync-server 和 rsync-client 同步 laravel 源码，其中 rsync-server 使用 amh 面板安装好，web 配置完成即可，但 rsync-client 需要单独进行配置。

需求如下：

1，.env 文件不得同步（每台 client 的.env 配置文件不同）

2，storage 文件夹只同步目录结构

3，自动定时同步

* * *

step.0

安装 rsync-client

step.1

由于我们同步服务器使用 rsync-server 而非 ssh，所以需要用到.pass 文件配置秘钥

```
cd /home/usrdata/rsync-client-3.1/etc/
echo {YOUR_PASSWORD} > test.pass
```

这样就把秘钥输出到 test.pass 文件了

step.2

编写 sh 脚本，实现如上需求

```
rsync -avzP --delete --password-file=/home/usrdata/rsync-client-3.1/etc/test.pass rsync://root@172.17.0.4/root /home/wwwroot/demo/domain/demo/web/ --include='*/' --exclude='*'
rsync -avzP --delete --password-file=/home/usrdata/rsync-client-3.1/etc/test.pass rsync://root@172.17.0.4/root /home/wwwroot/demo/domain/demo/web/ --exclude=.env --exclude=storage
```

第一行--include='*/'即为包含全部目录，--exclude='*'即为排除全部文件，这样全部的目录结构就同步下来了。

第二行两个 exclude，分别是排除 storage 目录和.env 文件，因为前面我们已经同步全部目录结构，所以直接排除掉 storage 同步即可。

最终：把这两行写到某个 sh 文件(e.g. test.sh)即可，即可实现 1、2 两个需求。

step.3

自动定时，当然是用 crontab 啦。

```
crontab -e                                                                     ## 编辑定时任务
*/5 * * * * bash /home/usrdata/rsync-client-3.1/etc/test.sh > /tmp/rsync.log   ## 追加此行,每五分钟同步一次
```

done!

reference: <https://blog.csdn.net/david_xtd/article/details/10149617>
