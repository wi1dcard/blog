---
id: increase-node-js-v8-memory-limit
tags: [Node.js]
date: 2019-11-28 21:27:50
title: Increase Node.js V8 Memory Limit
---

After a few days working on Salesforce integration, I finnally finished a simple CLI edtion of [DataLoader](https://github.com/forcedotcom/dataloader) using prune TypeScript. Within lots of CSV rows loaded into memory, the node engine always crashs around 130k of records. In order to get this job done as quick as possible, I have to increase the max memory of Node.js.

<!--more-->

The error message looks like:

```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory

...

[1]    15759 abort      node ...
```

The quick but not perfect solution is:

```bash
export NODE_OPTIONS="--max_old_space_size=<memory in MB>"
```

Or,

```bash
node --max-old-space-size=<memory in MB> ...
```

See also:

- <https://futurestud.io/tutorials/node-js-increase-the-memory-limit-for-your-process>
