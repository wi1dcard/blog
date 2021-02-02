---
id: huawei-5g-dongle-usb-tethering-with-openwrt-in-esxi
tags: [ESXi, OpenWrt, Networking, IT]
date: 2020-11-11 13:00:43
title: ESXi OpenWrt 使用华为随身 Wi-Fi 实现 WAN 故障转移
---

这几天想给家里上「双网」，但弱电箱只有一根光纤，所以无法拉双线。正好手上有一个 [华为 5G 随身 Wi-Fi Pro](https://consumer.huawei.com/en/routers/5g-mobile-wifi-pro/)，干脆用它来做 Failover（故障转移）吧。

<!--more-->

## 目标

目标网络拓扑大概是这样：

```
+-------------+      +-----------+
| Fiber Modem |      | 5G Dongle |
+----+--------+      +--------+--+
     |                        |
  Ethernet              USB Cable
     |                        |
     |                        |
     |                        |
     |   +----ESXi Host----+  |
     |   |                 |  |
     +-->+  OpenWrt VM     +<-+
         |  ... Other VMs  |
         |                 |
         +-----------------+
```

## 计划

1. 把 5G Dongle 挂载到 OpenWrt VM 的 USB Controller，或者把主板上的 USB Controller 直通进 OpenWrt VM。
2. 在 OpenWrt 安装 `usb-modeswitch` 用于把 CDROM Mode 切换到 Tethering Mode。
3. 在 OpenWrt 安装 USB Tethering 相关的软件包，并创建一个新的接口，和 Tethering 的物理接口桥接。
4. 使用 `mwan3` 之类的工具实现 Failover 自动切换。

## ESXi 直通 USB Controller

在开始之前，我先试了下把 5G Dongle 直接插 ESXi 物理机，默认应该为 CDROM 模式，果不其然在 ESXi 控制台发现它被识别为 Storage。为了兼容性，再加上不想深入 ESXi（打算后期换 PVE），干脆简单点 — 直通主板上的 USB Controller。

1. 登录 ESXi web console，在左侧菜单依次进入 Host -> Manage -> Hardware -> PCI Devices，选中你的 USB Controller，记住下方的 Device ID 和 Vendor ID。
   ![](/resources/44de8da06395adc369fd377f77b21e67.png)

2. SSH 登录 ESXi，修改 `/etc/vmware/passthru.map` 文件，新增以下几行：
   ```
   # Intel Corporation Sunrise Point-LP USB 3.0 xHCI Controller
   8086  9d2f  d3d0     false
   ```
   其中，`8086` 是 Vendor ID，`9d2f` 是 Device ID，随后两项固定。

3. 重启 ESXi Host，再次登录 web console 并找到 USB Controller，点击上方 `Toggle passthrough` 按钮。再次重启 ESXi Host，确认右侧 Passthrough 一栏为 Active 即可。
   ![](/resources/708aca71dfd29a62fc849df78c513346.png)

4. 关机 OpenWrt VM，并新增 PCI Device，选择你的 USB Controller。
   ![](/resources/8d3624edd7ea0c75461be8dcd8ffde99.png)

5. 修改 VM 的内存配置，将 Reservation 与 RAM 保持一致（选中 `Reserve all guest memory (All locked)`）。
   ![](/resources/103a62b813984bce79af62f8632ad408.png)

6. 把 5G Dongle 通过 USB 接入 ESXi Host，启动 OpenWrt VM。

## 安装 `usb-modeswitch`

1. SSH 登录 OpenWrt，执行：
   ```bash
   opkg update
   opkg install usbutils usb-modeswitch
   ```

2. 重新插拔 5G Dongle，或者执行以下命令重启 `usbmode` 服务：
   ```bash
   service usbmode restart
   ```

3. 执行 `lsusb`，应当能看到华为 5G 随身 Wi-Fi 的影子了：
   ```
   ...
   Bus 006 Device 002: ID 12d1:14db Huawei Technologies Co., Ltd. E353/E3131
   ...
   ```
   注意此行结尾没有 `(Mass storage mode)` 之类的字样，说明 `usb-modeswitch` 成功将设备切换到 Tethering 模式了。

## 安装 USB Tethering 需要的软件包

```bash
opkg install kmod-nls-base kmod-usb-core kmod-usb-net kmod-usb-net-rndis kmod-usb-net-cdc-ether kmod-usb2 kmod-usb3
```

## 创建桥接网络接口

1. 如图，创建新的 Interface，桥接到 `eth3`（因人而异），点击 `Create Interface`。
   ![](/resources/0161eee53da68433ac3dfd3c071ad3f8.png)

2. 切换到 `Firewall Settings` 标签页，分配 Firewall-zone `wan`。
   ![](/resources/61eae34583b636dd8ee1d0c596708f8b.png)

## 安装 `mwan3` 实现 Failover

```bash
opkg install mwan3 luci-app-mwan3 luci-i18n-mwan3-zh-cn
```

最后，通过 LuCI 或是直接修改配置文件 `/etc/config/mwan3` 均可，例如我的配置文件如下：

```conf
config globals 'globals'
	option mmx_mask '0x3F00'
	option rtmon_interval '5'

config interface 'wan'
	option enabled '1'
	option family 'ipv4'
	option count '1'
	option timeout '2'
	option interval '5'
	option down '3'
	option up '8'
	option initial_state 'online'
	option track_method 'ping'
	option size '56'
	option max_ttl '60'
	option check_quality '0'
	option failure_interval '5'
	option recovery_interval '5'
	option reliability '2'
	list track_ip '218.2.2.2'
	list track_ip '119.29.29.29'
	list track_ip '223.5.5.5'
	list track_ip '114.114.114.114'

config interface 'wanb'
	option family 'ipv4'
	option count '1'
	option timeout '2'
	option interval '5'
	option down '3'
	option up '8'
	option initial_state 'online'
	option track_method 'ping'
	option size '56'
	option max_ttl '60'
	option check_quality '0'
	option failure_interval '5'
	option recovery_interval '5'
	option enabled '1'
	list track_ip '218.2.2.2'
	list track_ip '119.29.29.29'
	list track_ip '223.5.5.5'
	list track_ip '114.114.114.114'
	option reliability '2'

config member 'wan_m1_w3'
	option interface 'wan'
	option metric '1'
	option weight '3'

config member 'wan_m2_w3'
	option interface 'wan'
	option metric '2'
	option weight '3'

config member 'wanb_m1_w2'
	option interface 'wanb'
	option metric '1'
	option weight '2'

config member 'wanb_m2_w2'
	option interface 'wanb'
	option metric '2'
	option weight '2'

config policy 'wan_only'
	list use_member 'wan_m1_w3'
	list use_member 'wan6_m1_w3'

config policy 'wanb_only'
	list use_member 'wanb_m1_w2'
	list use_member 'wanb6_m1_w2'

config policy 'balanced'
	list use_member 'wan_m1_w3'
	list use_member 'wanb_m1_w2'
	list use_member 'wan6_m1_w3'
	list use_member 'wanb6_m1_w2'

config policy 'wan_wanb'
	list use_member 'wan_m1_w3'
	list use_member 'wanb_m2_w2'
	list use_member 'wan6_m1_w3'
	list use_member 'wanb6_m2_w2'

config policy 'wanb_wan'
	list use_member 'wan_m2_w3'
	list use_member 'wanb_m1_w2'
	list use_member 'wan6_m2_w3'
	list use_member 'wanb6_m1_w2'

config rule 'default_rule_v4'
	option dest_ip '0.0.0.0/0'
	option family 'ipv4'
	option proto 'all'
	option sticky '0'
	option use_policy 'failover'

config rule 'default_rule_v6'
	option dest_ip '::/0'
	option family 'ipv6'
	option proto 'all'
	option sticky '0'
	option use_policy 'default'

config policy 'failover'
	list use_member 'wan_m1_w3'
	list use_member 'wanb_m2_w2'
	option last_resort 'unreachable'
```

## 参考文献

- <https://lx-soft.net/archives/242>
- <https://openwrt.org/docs/guide-user/network/wan/wwan/3gdongle>
- <https://openwrt.org/docs/guide-user/storage/usb-installing>
- <https://openwrt.org/docs/guide-user/network/wan/smartphone.usb.tethering>
