---
id: list-connections-group-by-ip
tags: [Linux, Shell]
date: 2019-11-13 21:20:16
title: List All IP Addresses and the Number of Connections to a Port
categories: Snippets
---

It's been a while maintaining the proxy services for my work friends who are in Beijing office. These days I tried to collect some basic metrics like online IP addresses and its connections. And I found a very simple way to do it with only `netstat` and several text process tools.

<!--more-->

For instance, I would like to get the clients info connected to port `443`:

```bash
netstat -ntu \                    # Collect network statistics and very detailed information
    | grep -v LISTEN \            # Remove lines that the status is LISTEN
    | awk '{print $4, $5}' \      # Remove other columns but retain the 4th and 5th ones
    | grep -E '^[0-9\.]+:443' \   # Filter connections to port 443 by a regex expression
    | cut -d' ' -f2 \             # Remove the first column which is server's address
    | cut -d: -f1 \               # Strip the port part from IP addresses
    | sort \                      # Sort results for pipelining to uniq command
    | uniq -c                     # Group the IP addresses and calculate their appearing times (which is the number of connections)
```

The final shell script looks like:

```bash
netstat -ntu | grep -v LISTEN | awk '{print $4, $5}' | grep -E '^[0-9\.]+:443' | cut -d' ' -f2 | cut -d: -f1 | sort | uniq -c
```

And also the results:

```
      8 180.xx.xx.74
      1 183.xx.xx.53
     12 218.xx.xx.198
     20 221.xx.xx.37
     32 222.xx.xx.252
```
