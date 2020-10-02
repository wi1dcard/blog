---
id: configure-nanopi-as-a-router
tags: [Networking, Linux, RaspberryPi]
date: 2019-06-11 21:37:40
title: 将 NanoPi 配置为单臂路由器
---

在近期折腾科学上网网关的过程中，顺便研究了一下 VLAN。通过适当地配置，一台只具备单物理网口的 NanoPi NEO2，同样可以变身「单臂」路由器。

<!--more-->

## 准备工作

- NanoPi NEO2
- 支持 **802.1Q** VLAN 的交换机（例如我正在使用的 Netgear GS108Ev3）

## 配置交换机

配置交换机无非就是划分 VLAN 的过程。我将交换机的 8 个端口划分为两个 VLAN，ID 分别为 1 和 2。

![](/resources/2d5b27288ebb43d762873c70f9a42d70.png)

如上图所示，其中：

- VLAN 1 作为 WAN，对应 1、2、3、4 口。
- VLAN 2 作为 LAN，对应 4、5、6、7、8 口。

可以看出，第 4 个接口横跨两个 VLAN，随后我们将会把 NanoPi 连接到该接口上。

同时，我将第 4 个接口配置为 Tagged VLAN，其余接口均配置为 Untagged：

![](/resources/a9c3be7748ff661d848fa865b46b87f5.png)

![](/resources/4eeb03cb1d02e3361b02c16349c1f03a.png)

这样，NanoPi 便能通过 VLAN Tag 获知数据包的来源是 WAN（VLAN 1）还是 LAN（VLAN 2）；同时，也可以标记发出数据包应当传输到哪个 VLAN。

> 提示：关于 VLAN Tag 的知识请自行搜索；另外，交换机私有的、基于端口的 VLAN 不支持 Tag 功能，务必注意。

最后，配置接口默认的 PVID：

![](/resources/894f74a9c865e75283c0e708c5f645ce.png)

注意第 4 个接口，我将它的 PVID 设置为 2，也就是对应 VLAN 2；即收到由该接口发来的不带 VLAN Tag 的数据包，则默认认为属于 VLAN 2。

## 配置 NanoPi

首先连接到 NanoPi，创建对应 VLAN 的虚拟接口：

```bash
nmcli conn add type vlan ifname WAN dev eth0 id 1 # VLAN 1
nmcli conn add type vlan ifname LAN dev eth0 id 2 # VLAN 2
```

由于 NanoPi 在 LAN 内承担路由的工作，因此需要配置为静态 IP：

```
nmcli conn mod vlan-LAN \
    ipv4.method manual \
    ipv4.addresses 192.168.88.1/24 \
    ipv4.gateway 192.168.88.1 \
    ipv4.dns 192.168.88.1
```

其中 `192.168.88.1` 是 LAN 的网关 IP（也就是 NanoPi 自身的 IP 啦），`/24` 为 LAN 的子网 CIDR 前缀。

接下来，停止 Systemd 提供的本地 DNS 缓存服务 `systemd-resolved`，使用 DNSMASQ 代替：

```
systemctl stop systemd-resolved
systemctl disable systemd-resolved
apt install dnsmasq
```

并修改 `/etc/dnsmasq.conf`，配置 DHCP 服务和 DNS 服务：

```conf
# 仅对 LAN 提供服务
interface=LAN

# 不读取 /etc/resolv.conf 作为上游 DNS 服务器
no-resolv
# 配置上游 DNS 服务器为 114.114.114.114
server=114.114.114.114
# DNS 记录缓存数量为 10000
cache-size=10000

# DHCP IP 范围，由 192.168.88.50 到 192.168.88.150
# 子网掩码为 255.255.255.0，DHCP 租约有效期为 1 小时
dhcp-range=192.168.88.50,192.168.88.150,255.255.255.0,1h
# DHCP 选项，下发给客户端的 DNS 服务器为 192.168.88.1
dhcp-option=option:dns-server,192.168.88.1
```

另外，还需要配置 iptables，实现路由器最重要的功能 —— NAT：

```bash
# 增加规则
iptables -t nat -A POSTROUTING -o WAN -j MASQUERADE
# 持久化规则
apt install iptables-persistent netfilter-persistent
netfilter-persistent save
```

最后，开启内核 IPv4 数据包转发即可：

```
sed -i -E 's/#?\s*(net.ipv4.ip_forward)(.*)$/\1 = 1/' /etc/sysctl.conf
sysctl -p /etc/sysctl.conf
```

## 参考资料

- <https://www.liangshuang.name/2018/09/05/router-on-a-stick-with-raspberrypi-shadowsocks/>
- <https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/sec-configure_802_1q_vlan_tagging_using_the_command_line_tool_nmcli>
