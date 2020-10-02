---
id: convert-openwrt-image-to-esxi-vmdk
tags: [ESXi, OpenWrt]
date: 2020-09-12 09:04:26
title: Convert OpenWrt Image to ESXi VMDK
---

The official doc of [OpenWrt on VMware HowTo](https://openwrt.org/docs/guide-user/virtualization/vmware) seems already outdated, and there's no explaination of how to fix `Unsupported or invalid disk type 2 for 'scsi0:0'. Ensure that the disk has been imported.` on ESXi 6.7. Here after looked into some clues on Chinese router forums, I found an usable method to convert the image into ESXi VMDK format on macOS.

<!--more-->

## Download the Image

You can find the `.img.gz` files on <https://downloads.openwrt.org/>, for example:

https://downloads.openwrt.org/releases/19.07.4/targets/x86/64/openwrt-19.07.4-x86-64-combined-ext4.img.gz

## Install Dependencies

```bash
brew install gzip # To un-gzip .gz files
brew install qemu # To convert images
```

## Convert .img to .vmdk

```bash
gunzip openwrt-19.07.4-x86-64-combined-ext4.img.gz
qemu-img convert -f raw -O vmdk openwrt-19.07.4-x86-64-combined-ext4.img openwrt-19.07.4-x86-64-combined-ext4.vmdk
```

## Upload the VMDK to ESXi

You can either upload the image using `scp` command or via web UI. However, I would suggest enable SSH on your ESXi host and use `scp`, as the next step requires shell prompt on the host.

```
scp openwrt-19.07.4-x86-64-combined-ext4.vmdk root@esxi:/vmfs/volumes/datastore1/
```

## Fix `Unsupported or invalid disk type 2 for 'scsi0:0'`

Before using the `.vmdk` file as an "existing hard disk" on ESXi, there's one more step to convert it into supported disk type.

```bash
ssh root@esxi
cd /vmfs/volumes/datastore1/
vmkfstools -i 'openwrt-19.07.4-x86-64-combined-ext4.vmdk' openwrt-converted.vmdk -d thin
```

Done! Now we can create and boot a VM with adding `openwrt-converted.vmdk` as the primary disk. Enjoy it!
