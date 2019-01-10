---
id: configure-prometheus-monitoring-with-grafana
date: 2019-01-09 20:34:12
title: 配置 Prometheus 服务器监控和 Grafana 看板
categories: translations
---

> 译者序：Prometheus 是服务器监控系统的后起之秀，可以和 Kubernetes 完美结合用于监控大量集群和应用。Grafana 是一款数据可视化看板，可指定多个数据源执行查询，将枯燥的数据转化为多维度的面板。两者均为开源项目，通过配置可实现直观强大的监控、报警、分析系统，实属运维神器。

<!--more-->

效果预览：

![](https://grafana.com/api/dashboards/1860/images/1718/image)
![](https://i.loli.net/2019/01/10/5c36b2bf5f1a8.png)

> 原文地址：<https://www.scaleway.com/docs/configure-prometheus-monitoring-with-grafana/>

本文将介绍如何使用 Prometheus + Grafana 看板监控服务器状态。

Prometheus（普罗米修斯）是一款从 2012 年开始研发的弹性监控解决方案。该系统将其数据存储至时序数据库，且提供了多维度的数据模型和强大的查询语言来生成被监控资源的报表。

要使用 Prometheus 和 Grafana 大约有五个步骤：

- 准备服务器环境
- 下载并安装 Node Exporter
- 下载并安装 Prometheus
- 配置 Prometheus
- 下载并安装 Grafana

## 准备服务器环境

在本教程内，我们使用 Ubuntu Xenial（16.04）系统来演示。

1. 为了能够让 Prometheus 安全地运行在我们的服务器上，我们首先要为 Prometheus 和 Node Exporter 创建一个不含登录权限的用户。可使用 `--no-create-home` 参数避免创建用户根目录，使用 `--shell /usr/sbin/nologin` 来禁止用户打开 Shell。

    ```bash
    sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus
    sudo useradd --no-create-home --shell /bin/false node_exporter
    ```

2. 创建目录，用于存储 Prometheus 可执行文件以及其配置：

    ```bash
    sudo mkdir /etc/prometheus
    sudo mkdir /var/lib/prometheus
    ```

3. 设置以上目录的拥有者为 `prometheus` 用户，确保 Prometheus 有权限访问这些文件夹。

    ```bash
    sudo chown prometheus:prometheus /etc/prometheus
    sudo chown prometheus:prometheus /var/lib/prometheus
    ```

## 下载并安装 Node Exporter

由于 Prometheus 仅具备采集系统指标的功能，因此我们需要通过 **Node Exporter** 来扩展它的能力。**Node Exporter** 是一款收集系统 CPU、磁盘、内存用量信息并将它们公开以供抓取的工具。

1. 下载 Node Exporter 的最新版本。

    ```bash
    wget https://github.com/prometheus/node_exporter/releases/download/v0.16.0/node_exporter-0.16.0.linux-amd64.tar.gz
    ```

    > 译者注：由于本文项目仍在持续更新，故请到 GitHub 查看最新版本 Release 链接再下载。以下类同，不再赘述。

2. 解压压缩包后，会发现一个名为 `node_exporter-0.16.0.linux-amd64` 的目录，包含了可执行文件、README 以及许可证文件：

    ```bash
    tar xvf node_exporter-0.16.0.linux-amd64.tar.gz
    ```

3. 复制其中的可执行文件到 `/usr/local/bin` 目录下，并将其拥有者设为上文创建的 `node_exporter` 用户：

    ```bash
    sudo cp node_exporter-0.16.0.linux-amd64/node_exporter /usr/local/bin
    sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
    ```

4. Node Exporter 剩余的文件已不需要，删除即可：

    ```bash
    rm -rf node_exporter-0.16.0.linux-amd64.tar.gz node_exporter-0.16.0.linux-amd64
    ```

5. 为了让 Node Exporter 能够跟随系统自动启动，我们需要创建一个 Systemd 服务。例如使用 Nano 编辑器创建该服务文件：

    ```bash
    sudo nano /etc/systemd/system/node_exporter.service
    ```

6. 将以下内容复制到文件内，保存并退出。

    ```ini
    [Unit]
    Description=Node Exporter
    Wants=network-online.target
    After=network-online.target

    [Service]
    User=node_exporter
    Group=node_exporter
    Type=simple
    ExecStart=/usr/local/bin/node_exporter

    [Install]
    WantedBy=multi-user.target
    ```

7. 在 Node Exporter 中，收集器（`Collectors`）用于搜集系统信息。默认情况下，一部分收集器已被开启，你可以在 [README](https://github.com/prometheus/node_exporter/blob/master/README.md#enabled-by-default) 文件中查看具体列表。如果你想要使用某些特定的收集器，可以在以上文件的 `ExecStart` 配置中进行定义。例如：

    ```ini
    ExecStart=/usr/local/bin/node_exporter --collectors.enabled meminfo,hwmon,entropy
    ```

    编辑后记得保存。

8. 重启 Systemd 以便能够使用新创建的服务：

    ```bash
    sudo systemctl daemon-reload
    ```

9. 使用以下命令启动 Node Exporter：

    ```bash
    sudo systemctl start node_exporter
    ```

10. 确保其启动成功：

    ```bash
    sudo systemctl status node_exporter
    ```

    你将会看到类似如下的输出，分别展示已启动状态 `active (running)`，以及主进程 ID（`PID`）：

    ```bash
    ● node_exporter.service - Node Exporter
       Loaded: loaded (/etc/systemd/system/node_exporter.service; disabled; vendor preset: enabled)
       Active: active (running) since Mon 2018-06-25 11:47:06 UTC; 4s ago
     Main PID: 1719 (node_exporter)
       CGroup: /system.slice/node_exporter.service
               └─1719 /usr/local/bin/node_exporter
    ```

11. 没什么问题的话，便可以开启 Node Exporter 的开机自启动了：

    ```bash
    sudo systemctl enable node_exporter
    ```

## 下载并安装 Prometheus

1. 下载并解压 Prometheus 的最新版本。

    ```bash
    sudo apt-get update && apt-get upgrade
    wget https://github.com/prometheus/prometheus/releases/download/v2.2.1/prometheus-2.2.1.linux-amd64.tar.gz
    tar xfz prometheus-*.tar.gz
    cd prometheus-*
    ```

    该目录内包含以下两个可执行文件：
        - `prometheus` - Prometheus 主程序
        - `promtool`
    
    以下两个子目录则分别包含了 Web 接口、示例配置以及许可证文件：
        - `console`
        - `console_libraries`

2. 复制可执行文件到 `/usr/local/bin/` 目录。

    ```bash
    sudo cp ./prometheus /usr/local/bin/
    sudo cp ./promtool /usr/local/bin/
    ```

3. 设置以上文件的拥有者为上文创建的 `prometheus` 用户。

    ```bash
    sudo chown prometheus:prometheus /usr/local/bin/prometheus
    sudo chown prometheus:prometheus /usr/local/bin/promtool
    ```

4. 复制 `console` 和 `console_libraries` 目录到 `/etc/prometheus`。

    ```bash
    sudo cp -r ./consoles /etc/prometheus
    sudo cp -r ./console_libraries /etc/prometheus
    ```

5. 设置以上目录及其子目录和文件的拥有者为 `prometheus` 用户。

    ```bash
    sudo chown -R prometheus:prometheus /etc/prometheus/consoles
    sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
    ```

6. 回到先前下载的目录，删除不再需要的原始文件。

    ```bash
    cd .. && rm -rf prometheus-*
    ```

## 配置 Prometheus

在使用 Prometheus 之前，首先需要进行基本的配置。由此，我们需要创建一个名为 `prometheus.yml` 的配置文件。

> 注意：Prometheus 的配置文件使用 [YAML](http://www.yaml.org/start.html) 格式，严格禁止使用 Tabs。如果文件内容格式不正确，Prometheus 将无法正常启动。故编辑配置文件时请留心。

1. 在文本编辑器（例如 Nano）内编辑 `prometheus.yml` 文件。

    Prometheus 的配置文件分为三个部分：`global`、`rule_files` 和 `scrape_configs`。

    在 `global` 部分内，可以找到一些通用配置：`scrape_interval` 用于设置 Prometheus 多久抓取一次目标（`Targets`），`evaluation_interval` 用于设置多久计算一次规则（`Rules`）。而规则用于控制存储预先计算的数据，以及何时生成告警（`Alert`）。

    在 `rule_files` 部分内，包含了 Prometheus 加载的规则文件路径。

    配置文件的最后一个部分名为 `scrape_configs`，包含了 Prometheus 监控的资源信息。

    以上配置文件看起来应当类似：

    ```yml
    global:
      scrape_interval:     15s
      evaluation_interval: 15s

    rule_files:
      # - "first.rules"
      # - "second.rules"

      scrape_configs:
        - job_name: 'prometheus'
          scrape_interval: 5s
          static_configs:
            - targets: ['localhost:9090']
    ```

    全局 `scrape_interval` 设置为了适用于多数情况的 15 秒。

    我们目前还没有任何规则文件，所以 `rule_files` 部分已使用 `#` 注释。

    在 `scrape_configs` 部分，我们定义了第一个导出器（`Exporter`），用于 Prometheus 监控它自己。由于我们需要更加精确的 Prometheus 状态信息，我们将该任务（`Job`）的 `scrape_interval` 降低为 5 秒。`static_configs` 的 `targets` 参数表示导出器的监听地址。在本例中是同一服务器，所以我们使用 `localhost` 以及 Prometheus 自己的端口 `9090`。

    Prometheus 将会抓取在 `scrape_configs` 内定义的导出器，因此我们需要将 Node Exporter 添加至该文件，就像上文中监控 Prometheus 自己一样。

    将以下部分加入配置文件即可：

    ```bash
    - job_name: 'node_exporter'
        scrape_interval: 5s
        static_configs:
            - targets: ['localhost:9100']
    ```

    如上，我们再次覆盖了 `scrape_interval` 配置并设置为 5 秒。并且 Node Exporter 与 Prometheus 运行在统一服务器，所以我们可以直接使用 `localhost` 以及 Node Exporter 的默认端口：`9100`。

    若是从外部服务器抓取数据，你需要使用远程服务器的 IP 地址替换 `localhost`。

    欲知 Prometheus 全部配置项，请阅读 [官方配置文档](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)。

2. 设置该配置文件的拥有者为 `prometheus` 用户。

    ```bash
    sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml
    ```

好了，Prometheus 服务已经准备好大显身手了！

## 运行 Prometheus

1. 直接使用以下命令启动 Prometheus 即可，该命令将会以 `prometheus` 用户的身份运行。

    ```bash
    sudo -u prometheus /usr/local/bin/prometheus --config.file /etc/prometheus/prometheus.yml --storage.tsdb.path /var/lib/prometheus/ --web.console.templates=/etc/prometheus/consoles --web.console.libraries=/etc/prometheus/console_libraries
    ```

    接着，你会看到一些状态输出，以及服务已启动的信息：

    ```
    level=info ts=2018-04-12T11:56:53.084000977Z caller=main.go:220 msg="Starting Prometheus" version="(version=2.2.1, branch=HEAD, revision=bc6058c81272a8d938c05e75607371284236aadc)"
    level=info ts=2018-04-12T11:56:53.084463975Z caller=main.go:221 build_context="(go=go1.10, user=root@149e5b3f0829, date=20180314-14:15:45)"
    level=info ts=2018-04-12T11:56:53.084632256Z caller=main.go:222 host_details="(Linux 4.4.127-mainline-rev1 #1 SMP Sun Apr 8 10:38:32 UTC 2018 x86_64 scw-041406 (none))"
    level=info ts=2018-04-12T11:56:53.084797692Z caller=main.go:223 fd_limits="(soft=1024, hard=65536)"
    level=info ts=2018-04-12T11:56:53.09190775Z caller=web.go:382 component=web msg="Start listening for connections" address=0.0.0.0:9090
    level=info ts=2018-04-12T11:56:53.091908126Z caller=main.go:504 msg="Starting TSDB ..."
    level=info ts=2018-04-12T11:56:53.102833743Z caller=main.go:514 msg="TSDB started"
    level=info ts=2018-04-12T11:56:53.103343144Z caller=main.go:588 msg="Loading configuration file" filename=/etc/prometheus/prometheus.yml
    level=info ts=2018-04-12T11:56:53.104047346Z caller=main.go:491 msg="Server is ready to receive web requests."
    ```

2. 打开浏览器，输入 `http://IP.OF.YOUR.SERVER:9090` 便能够访问到 Prometheus 的 Web 页面了。如果一切正常，我们需要先暂时在命令行按下 `Ctrl` + `C` 结束进程。

    > 如果启动 Prometheus 服务时有错误信息输出，请再次确认配置文件是否存在语法错误。错误信息将会指明应当如何检查。

3. 好了，Prometheus 已经能够正常工作，但它还没有跟随系统启动。接下来我们再次创建一个 Systemd 服务文件来告知系统开机启动：

    ```bash
    sudo nano /etc/systemd/system/prometheus.service
    ```

    该文件将会指明使用 `prometheus` 用户运行 Prometheus，并指定其配置文件的路径。

4. 复制以下内容并粘贴，保存后退出文本编辑器。

    ```ini
    [Unit]
      Description=Prometheus Monitoring
      Wants=network-online.target
      After=network-online.target

    [Service]
      User=prometheus
      Group=prometheus
      Type=simple
      ExecStart=/usr/local/bin/prometheus \
      --config.file /etc/prometheus/prometheus.yml \
      --storage.tsdb.path /var/lib/prometheus/ \
      --web.console.templates=/etc/prometheus/consoles \
      --web.console.libraries=/etc/prometheus/console_libraries
      ExecReload=/bin/kill -HUP $MAINPID

    [Install]
      WantedBy=multi-user.target
    ```

5. 重载 `systemd` 后才能使用新创建的服务：

    ```bash
    sudo systemctl daemon-reload
    ```

    开启 Prometheus 服务，实现开机自启：

    ```bash
    sudo systemctl enable prometheus
    ```

6. 启动 Prometheus：

    ```bash
    sudo systemctl start prometheus
    ```

搞定，我们成功安装 Prometheus 用来监控服务器，Prometheus 服务已经可以正常访问了。

## Prometheus Web 端

Prometheus 内置一个简易的 Web 服务，可通过 `http://your.server.ip:9000` 访问。通过它能够查询其收集到的数据。

我们可以使用它验证 Prometheus 服务的运行状态：

![](https://www.scaleway.com/assets/images/docs/prometheus_targets.png)

此外，还可以查询被收集的数据：

![](https://www.scaleway.com/assets/images/docs/prometheus_graph.png)

此 Web 页面十分轻量，如果你不仅仅只想测试一下效果，Prometheus 团队建议使用类似 Grafana 的工具来替代它。

## 安装 Grafana

1. 下载并安装 Grafana。

    ```bash
    wget https://dl.grafana.com/oss/release/grafana_5.4.2_amd64.deb
    sudo apt-get install -y adduser libfontconfig
    sudo dpkg -i grafana_5.4.2_amd64.deb
    ```

2. 使用 `systemd` 开启 Grafana 的开机自启动。

    ```bash
    sudo systemctl daemon-reload && sudo systemctl enable grafana-server && sudo systemctl start grafana-server
    ```

    Grafana 已经开始运行，我们可以通过 `http://your.server.ip:3000` 访问。默认的用户名和密码是 `admin` / `admin`。

    ![](https://www.scaleway.com/assets/images/docs/grafana_dashboard.png)

3. 现在你需要创建一个数据源（`Data Source`），也就是 Prometheus：

   - 点击 Grafana Logo 打开侧边栏。
   - 在侧边栏内，点击「Data Sources」。
   - 选择「Add New」。
   - 选择「Prometheus」作为数据源。
   - 设置 Prometheus 服务的 URL（在本例中为：`http://localhost:9090/`）。
   - 点击 「Add」即可测试连接并保存为新的数据源。

   如上配置应当类似：

   ![](https://www.scaleway.com/assets/images/docs/grafana_datasource.png)

4. 现在你可以创建第一个看板（`Dashboard`）用于展示 Prometheus 收集到的信息了。你也可以从[共享看板集合](https://grafana.com/dashboards?dataSource=prometheus)导入一些现成的看板。

    如下是一个例子看板，它查询了节点服务器的 CPU 使用量并展示在 Grafana 内：

    ![](https://www.scaleway.com/assets/images/docs/grafana_stats.png)

在本教程中，我们安装了 Prometheus 服务以及两个数据导出器供 Prometheus 抓取，并配置了由 Peometheus 提供数据的 Grafana 看板。不要犹豫，快去看看 [Prometheus](https://prometheus.io/docs/introduction/overview/) 和 [Grafana](http://docs.grafana.org/) 的官方文档吧。

## 译者推荐

拓展阅读：

- <https://yunlzheng.gitbook.io/prometheus-book/>
- <https://prometheus.io/docs/guides/node-exporter/>
- <https://songjiayang.gitbooks.io/prometheus/content/>
- <https://www.digitalocean.com/community/tutorials/how-to-install-prometheus-on-ubuntu-16-04>

推荐看板：

- Node Exporter
  - <https://grafana.com/dashboards/405>
  - <https://grafana.com/dashboards/1860>

- Process Exporter
  - <https://grafana.com/dashboards/249>
  - <https://grafana.com/dashboards/8378>
