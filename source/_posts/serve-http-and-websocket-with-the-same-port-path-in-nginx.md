---
id: serve-http-and-websocket-with-the-same-port-location-in-nginx
tags: [Nginx, Darwinia]
date: 2021-02-19 16:00:22
title: Serve HTTP and WebSocket with the Same Port and Path in Nginx
---

Polkadot and other Substrate-based chain nodes supports JSON RPC **over HTTP** and **over WebSocket** on ports 9933 and 9944 individually.

However, according to the [WebSocket handshake](https://en.wikipedia.org/wiki/WebSocket#Protocol_handshake), we can determine if the client is requesting WebSocket or other HTTP resource by the header `Upgrade: websocket`.

Here's a little trick in Nginx to reverse proxy both 9933 (HTTP) and 9944 (WebSocket) with the same host, same port, and same path / location.

<!--more-->

```conf
map $http_upgrade $upstream_backend {
    # proxy to 9944 if the client wanted to upgrade to a websocket conn
    websocket http://127.0.0.1:9944;
    # proxy to 9333 otherwise
    default http://127.0.0.1:9933;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass $upstream_backend;
    }
}
```
