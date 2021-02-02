---
id: image-to-ascii-art
date: 2018-06-13 07:34:08
title: 是时候秀一波真正的恩爱了
tags: [Life]
---

要走创意路线好吗！`print 我爱你` 之流怕不是在小学五年级奥塞的时候就玩腻的，真丢「理科生」的脸。

<!--more-->

## 0x00 起因

<div align=center>

<img src="/resources/legacy/5b2060073e544.jpg" width="50%" height="50%">

<img src="/resources/legacy/5b2060041294b.jpeg" width="50%" height="50%">

<img src="/resources/legacy/5b206003b00a4.jpeg" width="50%" height="50%">

</div>

本着善待接纳的态度，😂这人怕不是刚入计算机系的大一新（la）生（ji）吧。

<div align=center>
<img src="/resources/legacy/5b20600752383.jpg" width="50%" height="50%">
</div>

当场分手 +1。

## 0x01 动手

代码优雅与否并不是重点=。=真正的秀，要让对面不懂代码的人能看得明白效果，并且觉得你写的有「卵」用。

不考虑什么「设计模式」、「依赖注入」、「最佳实践」之类的，劳资敲代码就是一把梭！

```python
# -*- coding: utf-8 -*-
from PIL import Image

codeLib = '''@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'. '''  # 生成字符画所需的字符集
count = len(codeLib)

def transform(image_file):
    image_file = image_file.convert("L")  # 转换为黑白图片，参数"L"表示黑白模式
    codePic = ''
    for h in range(0, image_file.size[1]):  # size属性表示图片的分辨率，'0'为横向大小，'1'为纵向
        for w in range(0, image_file.size[0]):
            # 返回指定位置的像素，如果所打开的图像是多层次的图片，那这个方法就返回一个元组
            gray = image_file.getpixel((w, h))
            codePic = codePic + \
                codeLib[int(((count-1)*gray)/256)]  # 建立灰度与字符集的映射
        codePic = codePic + '\r\n'
    return codePic

fp = open(u'my-lover.jpg', 'rb')
image_file = Image.open(fp)
image_file = image_file.resize(
    (int(image_file.size[0]), int(image_file.size[1]*0.4)))  # 调整图宽高比例
print u'Info:', image_file.size[0], ' ', image_file.size[1]

result = open('result.txt', 'w')
result.write(transform(image_file))
result.close()
```

> 以上代码修改自：<https://blog.csdn.net/wait_nothing_alone/article/details/52901531>

## 0x02 效果

![](/resources/legacy/5b20600e63807.jpg)

## 0x03 秀

<div align=center>
<img src="/resources/legacy/5b206008a1fa5.jpg" width="50%" height="50%">
</div>
