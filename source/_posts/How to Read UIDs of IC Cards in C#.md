---
title: "How to Read UIDs of IC Cards in C#"
date: 2017-09-07 16:46:16
id: read-uids-of-ic-cards
categories: tutorials
---

今天沈同学来问c#读ic卡的问题，我第一反应是想到了windows提供的智能卡驱动API，之前用c++实现过一套。

reference：<https://msdn.microsoft.com/en-us/library/dd627646(v=vs.85).aspx>

可只有英语，对于没有阅读过原版MSDN的实习生来说有一定难度，即便有复杂的c++源码参照，估计也要研究个几天。

so，用c#写windows，要的就是它的轮子多。遇到这种情况，果断网上搜一下先，但结果不尽人意，大多都是专门用于某个型号读卡器的厂家提供的SDK。

于是果断去微软官方的包管理器nuget里找，（keyword：smart card）……

![blob.png](https://i.loli.net/2018/08/15/5b73a59a8ec2a.png)（右键单击引用，选择管理nuget程序包）

![blob.png](https://i.loli.net/2018/08/15/5b73a59b6b293.png)（单击浏览，然后搜索）

![blob.png](https://i.loli.net/2018/08/15/5b73a59c00073.png)

看这个名字比较像我们需要的东西，于是点击右边的下载按钮下载即可自动下载安装，非常方便。如遇到下载缓慢的情况请自行科学上网。

安装完成之后，直接不找文档了，这种小东西直接看类声明：

![blob.png](https://i.loli.net/2018/08/15/5b73a59cd251b.png)（左侧引用->命名空间名，右侧新Tab里双击展开，就能看到命名空间和包含的类型）

可以看到，这个库非常简洁，只有两个类，我喜欢2333~

进去看下这两个类的方法，基本上能够顾名思义，话不多说，直接上手写代码尝试：

```csharp
using TOC.SmartCardReader;
using System.Diagnostics;

        //智能卡上下文变量
        HDMICardContext CardContext;

        private void Form1_Load(object sender, EventArgs e)
        {
            //new上下文
            this.CardContext = new HDMICardContext();
            //初始化
            var res = CardContext.Initilize();
            //判断初始化结果
            if (!res)
            {
                MessageBox.Show("fatal!");
                return;
            }
            //挂载事件处理函数
            CardContext.CardInserted += new EventHandler(CardInserted);
        }

        private void CardInserted(object sender, EventArgs args)
        {
            //这里最开始有点懵，不知道怎么拿到Result，下断点看了一下sender的类型就是我们要的Result，于是直接as一下然后输出即可
            var res = sender as TOC.SmartCardReader.Models.SmartCardResult;
            Debug.WriteLine(string.Format("inserted, card uid: {0}", res.CardUID));
        }
```

完成，程序运行即可看到输出。