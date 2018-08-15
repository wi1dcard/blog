---
title: "树莓派折腾随手记 - 使用apt-get安装Nginx+PHP"
date: 2018-02-28 19:40:01
id: raspberry-pi-installing-nginx-php-via-apt
categories: tutorials
---

> 百度来的教程都是源码编译安装，对于我这种强迫症人群来说简直是不得已才会采用的方案，于是果断自己尝试使用apt-get安装 Nginx + PHP 运行环境。

## 0x00

Update apt.

```
sudo apt-get update
sudo apt-get upgrade
```

## 0x01

Install Nginx, PHP7.0, and PHP-FPM.

```
sudo apt-get install nginx
sudo apt-get install php7.0 php7.0-fpm
```

Alternatively, you may also install PHP-CGI.

```
sudo apt-get install php7.0-cgi
```

## 0x02

Configure Nginx.

```
sudo nano /etc/nginx/sites-available/default
```

> Note: /etc/nginx/nginx.conf has already included all files in sites-enabled folder, so create another config file if you wanna setup a new vhost.

Here we use PHP-FPM, so uncomment those lines:

```
location ~ \.php$ {
	include snippets/fastcgi-php.conf;
	# With php-fpm (or other unix sockets):
	fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
	# With php-cgi (or other tcp sockets):
	#fastcgi_pass 127.0.0.1:9000;
}
```

And do NOT forget to reload Nginx.

```
sudo nginx -s reload
```

## 0x03

Write some PHP codes to `/var/www/html`

```
echo "<?php phpinfo(); ?>" > /var/www/html/phpinfo.php
```

And test it. Open your browser and type: `http://<YOUR_PI_IP>/phpinfo.php`

It should return a response like this:

![](https://jootu.org/zb_users/upload/2018/02/847ab964316cd2a90bc68e5db35a0812.png)

Enjoy PHP in your Raspberry Pi!

## 0x04

Here are some PHP projects that I found useful for your Pi. Hope  you like it.

[KODExplorer](https://github.com/kalcaddle/KodExplorer)

![](https://jootu.org/zb_users/upload/2018/02/d1911cb6f89ec5f44eed1f0bcd9ab432.png)

[Pi Dashboard](https://github.com/spoonysonny/pi-dashboard)

![](https://jootu.org/zb_users/upload/2018/02/ba92b40ce792181b63ad86ba85a6a8ac.png)

## 0x05

辣鸡百度.