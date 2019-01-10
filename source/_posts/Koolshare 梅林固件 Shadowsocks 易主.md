---
id: merlin-koolshare-shadowsocks-transferred
date: 2018-09-06 20:43:05
title: Koolshare 梅林固件 Shadowsocks 易主
categories: Documents
---

GitHub 原仓库的 Commit 记录已经消失，Issue 功能也被关闭了。

现移动到 <https://github.com/hq450/fancyss>。

似乎，也是被请去喝茶了？

某些人，干嘛非要封人嘴巴呢。掩耳盗铃，可笑。

更可笑的是，多数人不觉得自己被封住嘴巴。

习惯了不说话的日子，习惯了用原始人的方式。

最可怕的永远是人的思维。

不多说了。

我的 RT-AC86U Koolshare Merlin Shadowsocks 1.3.6 想要升级时出现 404，无法正常在线升级。

经查证是如上所述情况。

解决方案比较简单，修改 `/jffs/.koolshare/scripts/ss_update.sh` 替换仓库地址即可。

替换前：

```bash
main_url="https://raw.githubusercontent.com/koolshare/rogsoft/master/shadowsocks"
backup_url="https://rogsoft.ngrok.wang/shadowsocks"
```

替换后：

```bash
main_url="https://raw.githubusercontent.com/hq450/fancyss/master/fancyss_hnd"
```

截至目前，备用仓库地址还能用，你也可以先替换为备用地址先升级到过渡版本再升级到最新版。

继续加油，早日肉翻。