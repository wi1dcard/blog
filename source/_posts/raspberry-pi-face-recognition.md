---
title: "树莓派折腾随手记 - 人脸门禁"
date: 2018-02-13 21:31:40
id: raspberry-pi-face-recognition
tags: [RaspberryPi, Node.js]
---

> 前几天妹子送了个生日礼物——树莓派，想到公司门禁还是指纹解锁，随即说干就干，开始折腾个人脸门禁顺便入门吧。

## 0x00 思路

最开始我的想法是由树莓派独立完成摄像头图像捕捉、人脸检测、比对；转念一想，后期这玩意可以迎合公司项目，放到政企专网内部运作，还是 C／S 比较合适（更新方便、统一管理、Client 端平台无限制）；后来受到公司另一个小伙伴的启发，既然采用 C／S 架构，那服务器端肯定是 x64 的 CPU，可以调用虹软人脸 SDK，避免使用开源算法头疼优化问题，所以最终的结构基本是这样的：

![](/resources/legacy/5b73a57eea40e.png)

（凑合看吧……毕竟是自己整理思路的时候随手画的）

## 0x01 准备

#### 硬件

- 树莓派 3B
- 罗技 C170 摄像头（街边电脑店买的）
- Linux 服务器一台（with x64 CPU）

#### 软件

- C
- Node.js
- [虹软 SDK](http://www.arcsoft.com.cn/ai/usercenter/index)

## 0x02 折腾

#### 树莓派: 安装系统

- [操作系统大全](http://wiki.nxez.com/rpi:list-of-oses)
- [在 macOS 上写入系统镜像](https://www.cnblogs.com/bindong/p/5818497.html)
- [连接 WiFi - 方法 1](http://www.52pi.net/archives/58)
- [连接 WiFi - 方法 2](https://www.embbnux.com/2016/04/10/raspberry_pi_3_wifi_and_bluetooth_setting_on_console/)
- [连接 WiFi - 方法 3](http://blog.csdn.net/messidona11/article/details/73649278)
- [安全关机重启命令](http://shumeipai.nxez.com/2013/08/25/raspberry-pi-how-to-safely-shutdown-restart.html)
- [VNC 可视化远程](https://www.realvnc.com/en/connect/docs/raspberry-pi.html#raspberry-pi-setup)

#### 树莓派: USB 摄像头支持列表

- [USB Webcams](https://elinux.org/RPi_USB_Webcams)

#### 树莓派: 连接摄像头

- [fswebcam](http://www.ncnynl.com/archives/201607/266.html)
- [罗技 C170 报错问题](https://www.raspberrypi.org/forums/viewtopic.php?t=60076)(不支持 RGB 通道,必须使用`-p YUYV`)
- [mplayer](http://blog.csdn.net/u011552404/article/details/50807741)

#### 树莓派: Node.js 连接摄像头

- [web 调试树莓派摄像头](https://www.jianshu.com/p/a386081d1627)
- [树莓派+摄像头: Node.js 打造 1D/2D 条码扫描仪](http://blog.csdn.net/yushulx/article/details/60763737)
- [node-v4l2camera](https://github.com/bellbind/node-v4l2camera)
- [jpeg-js](https://github.com/eugeneware/jpeg-js)
- [jsmpeg](https://github.com/phoboslab/jsmpeg)

#### 服务器(C): 编译虹软 SDK 例程

- [error: ‘nullptr’ was not declared in this scope](http://blog.csdn.net/w1653774595/article/details/68491238)
- [cannot open shared object file: No such file or directory](http://blog.csdn.net/joshuaxx316/article/details/50553185)

> 没错, 玩 C++ 最难的, 就是编译... 2333

#### 服务器(C): 封装并编译动态链接库

- [C 编译: 动态连接库 (.so 文件)](https://www.cnblogs.com/vamei/archive/2013/04/04/2998850.html)
- [GCC 编译动态链接库](http://blog.csdn.net/orzlzro/article/details/6460058)
- [.so 动态库 makefile 的嵌套调用](http://blog.csdn.net/nana_93/article/details/8274052)
- [Linux 下 so 导出指定函数](http://blog.csdn.net/seeklm/article/details/39208801)

#### 服务器(Node): 调用动态链接库

- [node-ffi](https://github.com/node-ffi/node-ffi)

#### 服务器(Bash): 图片转 YUV 通道原始数据

- [ffmpeg jpeg 转 yuv422p(420p)](http://blog.csdn.net/smilestone_322/article/details/21104871)

#### 服务器(Node): 实现人脸 HTTP API

- [Node.js 远程调试](https://nodejs.org/en/docs/inspector/)
- [node.js 如何完美的从命令行接收参数所传递进来的值](https://segmentfault.com/q/1010000000367285)
- [Nodejs 进阶：基于 express+multer 的文件上传](https://www.cnblogs.com/chyingp/p/express-multer-file-upload.html)
- [nodejs 中的中间件--Multer](http://blog.csdn.net/charlene0824/article/details/51154059)

#### 树莓派: 调用人脸 API

- [Request - Simplified HTTP client](https://github.com/request/request#forms)

#### 其它

- [OpenCV and Pi Camera Board](https://thinkrpi.wordpress.com/opencv-and-pi-camera-board/)
- [树莓派人脸识别门禁系统代码以及代码分析——opencv 拍照调用 FACE++处理](https://baijiahao.baidu.com/s?id=1571031364102290&wfr=spider&for=pc)
- [【Raspberry Pi 3 试用体验】+Opencv+python 的人脸识别](http://bbs.elecfans.com/forum.php?mod=viewthread&tid=607153&extra=)
- [使用树莓派进行简易人脸识别](http://www.shumeipaiba.com/xiangmu/zhineng/78.html)
- [树莓派一键部署系列之二：openface 人脸识别程序](https://www.jianshu.com/p/05f4c2c2d6be)

## 0x03 成果

实时刷新:

![](/resources/legacy/5b73a589d5682.png)

> 单线程基本上每秒 2-3 帧, 因为识别在服务器, 所以几乎不存在性能问题, 只要带宽够, 有多少 frames 就能识别多少.

全家福:

![](/resources/legacy/5b73a591a9ec2.png)

> 原谅我不是个专业硬件工程师, 只会简洁的连线风格, lol.

## 0x04 后记

没有后记, 祝自己生日快乐的同时, 也希望 2018 大吉大利, 妹子到手 (正经脸).
