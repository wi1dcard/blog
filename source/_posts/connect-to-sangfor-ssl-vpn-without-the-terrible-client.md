---
id: connect-to-sangfor-ssl-vpn-without-the-terrible-client
tags: [Networking, Linux]
date: 2020-01-10 20:11:33
title: Connect to Sangfor SSL VPNs Without the Terrible Client
---

The VPN provider of Nanjing University has recently been changed to Sangfor, which is one of the biggest company who provides the corporate SDN, VPN and other enterprise network solutions in China. Although, the [SSL VPN client](https://vpn.nju.edu.cn/portal/#!/login) from Sangfor is extremely hard to use - Changing the default DNS server without any notification, hijacking all UDP packet that dport is 53, even removing all the default route generated from the CIDR of interfaces which prevents the client connect to any LAN devices except `**.**.**.1`. These issues have been described as "features" of their products from a training manual that I found in [Baidu Wenku](https://wenku.baidu.com/view/51fec468a45177232f60a2d2.html).

<!--more-->

By digging into the VPN client for several days, I finally give up with trying to add some kind of plugins or extensions, because they don't allow to. The client binary comes with a daemon, which will watch the route table and DNS settings. Even when I use `chattr` to avoid any changes of `/etc/resolv.conf`, both the daemon and VPN client won't work but only print an error.

As their perspective, I totally understand they could always facing unusual environment from the clients. But for me, These all whatever issues or features are obstruction and messing up my development configuration.

So I ended this up by launching a independent VM in my home cluster with V2Ray and Sangfor SSL VPN client installed. The V2Ray is running under serving mode, accept and handle incoming traffic from the real client as well as my Mac, then relay the traffic from the VM which is also in the VPN. Thus, when I ever need the campus network, all I have to do is connecting to the proxy provided by V2Ray, using SwitchyOmega, Surge or any other SOCKS5 compatible tool - without this terrible client.

Here are the scripts that I use.

```bash
# Install gnome and GUI in order to run VPN client.
apt install x-window-system-core
apt install gnome-core
apt install libgtk2.0-0:i386

# Add policy-based routing rules and update the routing tables.
ip route add table 100 default via <GATEWAY> dev eth0
ip route add table 200 default dev tun0 # proto kernel scope link src 2.0.0.118
# All traffic matched fwmark == 254 should be routed to table 200, and table 100 for the others.
ip rule add from all table 100
ip rule add fwmark 254 table 200

# Delete DNS hajacking iptables rule.
iptables -t nat -D OUTPUT -p udp -m udp ! --sport 7789 --dport 53 -j DNAT --to-destination 127.0.0.1:5373
ip rule add to 114.114.114.114 table main

# Install dnsmasq and relay all local dns queries to 114.114.114.114
no-resolv
server=114.114.114.114
```

Here is a example V2Ray configration of it. Please pay attention to `outbounds[].streamSettings.sockopt.mark` was set to **254**, which is the same value from routing policies described ahead.

```json
{
    "log": {
        "error": "/var/log/v2ray.log",
        "loglevel": "warning"
    },
    "inbounds": [
        {
            "protocol": "vmess",
            "port": <PORT>,
            "settings": {
                "clients": [
                    {
                        "id": "<USER_ID>"
                    }
                ]
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom",
            "tag": "direct",
            "streamSettings": {
                "sockopt": {
                    "mark": 254
                }
            }
        }
    ]
}
```
