---
id: laravel-recommended-nginx-conf-analysis
tags: [Nginx, Laravel]
date: 2019-03-16 11:18:00
title: 浅析 Laravel 文档推荐的 Nginx 配置
---

以 [Laravel 5.8 文档](https://laravel.com/docs/5.8/deployment#server-configuration) 为准，浅析 Nginx 配置。可作为 [轻松部署 Laravel 应用](https://github.com/wi1dcard/laravel-deployment) 的拓展阅读。

<!--more-->

方便起见，我在注释中使用 `[]` 包裹引用配置中的值。

```nginx
server {
    # 监听 HTTP 协议默认的 [80] 端口。
    listen 80;
    # 绑定主机名 [example.com]。
    server_name example.com;
    # 服务器站点根目录 [/example.com/public]。
    root /example.com/public;

    # 添加几条有关安全的响应头；与 Google+ 的配置类似，详情参见文末。
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # 站点默认页面；可指定多个，将顺序查找。
    # 例如，访问 http://example.com/ Nginx 将首先尝试「站点根目录/index.html」是否存在，不存在则继续尝试「站点根目录/index.htm」，以此类推...
    index index.html index.htm index.php;

    # 指定字符集为 UTF-8
    charset utf-8;

    # Laravel 默认重写规则；删除将导致 Laravel 路由失效且 Nginx 响应 404。
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # 将 [404] 错误交给 [/index.php] 处理，表示由 Laravel 渲染美观的错误页面。
    error_page 404 /index.php;

    # URI 符合正则表达式 [\.php$] 的请求将进入此段配置
    location ~ \.php$ {
        # 配置 FastCGI 服务地址，可以为 IP:端口，也可以为 Unix socket。
        fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
        # 配置 FastCGI 的主页为 index.php。
        fastcgi_index index.php;
        # 配置 FastCGI 参数 SCRIPT_FILENAME 为 $realpath_root$fastcgi_script_name。
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        # 引用更多默认的 FastCGI 参数。
        include fastcgi_params;
    }
    # 通俗地说，以上配置将所有 URI 以 .php 结尾的请求，全部交给 PHP-FPM 处理。

    # 除符合正则表达式 [/\.(?!well-known).*] 之外的 URI，全部拒绝访问
    # 也就是说，拒绝公开以 [.] 开头的目录，[.well-known] 除外
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

关于 `X-Frame-Options`、`X-XSS-Protection` 和 `X-Content-Type-Options` 可参考 [这篇文章](https://imququ.com/post/web-security-and-response-header.html)，自认为作者讲得还不错，通俗易懂并且是中文。

关于 `.well-known` 目录的详细解释，可参考 [这篇问答](https://serverfault.com/questions/795467/for-what-is-the-well-known-folder)（英文）。
