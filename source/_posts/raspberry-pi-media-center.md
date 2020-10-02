---
title: "树莓派折腾随手记——继电器+红外=客厅总控"
date: 2018-03-24 21:28:06
id: raspberry-pi-media-center
tags: [RaspberryPi, Node.js]
---

> 投影仪（电视）+机顶盒+音响设备控制项目，因自用于客厅总控，故命名为`MediaCenter`。

提示：强电危险，接线务必注意安全。

## 0x00 准备

硬件：

- 树莓派 3B。
- 微雪继电器模块，[淘宝链接](https://detail.tmall.com/item.htm?id=531914166130&spm=a1z09.2.0.0.67002e8dsKtzcx&_u=o1h9ho092e3b)。
- 未接线插座+电缆线。
- 红外学习模块，[淘宝链接](https://item.taobao.com/item.htm?spm=a1z09.2.0.0.67002e8dsKtzcx&id=524497520815&_u=o1h9ho09f270)。
- USB 转 TTL（PL2303），[淘宝链接](https://item.taobao.com/item.htm?spm=a1z09.2.0.0.67002e8dsKtzcx&id=18358111167&_u=o1h9ho092487)。

> 继电器模块也可以换成其它普通继电器，使用树莓派 GPIO 口输出高低电平即可，我采用现成模块，以求稳定可靠。
> 红外模块也可以直接连接树莓派 UART，我采用加装 USB 转 TTL 模块，避免浪费唯一一个 UART。

软件：

- Python 3
- Laravel 5 + Composer
- Node.js + NPM
- Vue
- Laravel Echo Server

## 0x01 基本思路

1. 连接 PL2303 和红外模块。
2. 连接插排，破开火线，连接继电器。无强电经验建议咨询电工，一旦接错轻则短路，重则起火！
3. 编写 Python 脚本，用于控制继电器。主要为操作 GPIO，输出高低电平。源码：`resource/relay.py`。
4. 编写 Python 脚本，用于控制红外模块。主要为操作串口，根据硬件厂商协议对接即可。源码：`resource/infrared.py`。
5. 编写 Laravel 控制器、路由，用于调用如上脚本；不要忘记权限问题，需要将运行 php-fpm 的用户添加至 gpio、dialout 用户组，且给予脚本可执行权限。
6. 使用 Laravel Broadcasting 广播，将脚本执行状态发送到客户端，[详解](https://github.com/wi1dcard/laravel-broadcasting)。
7. 编写前端，用于实时展示。
8. 代码丢到树莓派。

详细源码可参考[此仓库](https://github.com/wi1dcard/media-center)。

## 0x02 效果

硬件：

![](/resources/legacy/5b73a568e374e.png)

用绝缘胶布贴死继电器模块，避免不小心误触碰。

![](/resources/legacy/5b73a575b8ed6.png)

小插座是常电，接投影仪；大插排是走继电器控制，接音响和机顶盒。这里没有把常电线破开，而是直接在常电插座内接出来地火零。

> 接线稍有点乱，凑合看吧，毕竟不是硬件出身，幸亏小时候跟我爹学的强电基础没忘光/斜眼笑。小插排出来的线缆原本打算长一点，后来又觉得太长... 很尬。

软件：

![](/resources/legacy/5b73a5799d978.png)

网页直接嵌入 Dashboard。

## 0x03 感想

最开始思考如何不用满屋找遥控器且优雅地打开电视费了很大时间；主要问题不在于技术如何实现，而在于如何对我这种咸鱼更加简单快捷。打开网页太麻烦，客户端不够“绿色”，APP 太复杂，最终发现 Mac Dashboard 居然能丢网页，完美。
