---
title: "树莓派折腾随手记 - Time Machine"
date: 2018-06-21 10:05:47
id: raspberry-pi-time-machine
tags: [RaspberryPi]
---

> 群晖太贵！若是不介意 USB 2.0 和 100 Mbps 带宽的话，用树莓派 + 移动硬盘做个低功耗小型 NAS 也是不错的选择；搭建 Samba 的教程到处都是，本篇将介绍以正确的姿势搭建 AFP 共享 + Time Machine。

-------

The following step are the ones that enable Time Machine backups with Raspberry Pi plus a bit of polishing to my taste.

## 0x00 Prepare

### Format the hard drive

I had a hard-drive serving as Time Machine disk. However, I couldn't mount the disk due to Apple Core Storage:

```
Disk /dev/sda: 931.5 GiB, 1000204886016 bytes, 1953525168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: DE07BD84-C4E1-4229-81CD-E146E04D46C6

Device         Start        End   Sectors   Size Type
/dev/sda1         40     409639    409600   200M EFI System
/dev/sda2     409640  975539735 975130096   465G Apple Core storage
/dev/sda3  975539736  975801879    262144   128M Apple boot
/dev/sda4  975802368 1953523711 977721344 466.2G Microsoft basic data
```

Since the backups on that disk were a bit outdated I decided to format the partition and give it a go. Another alternative would be to use Disk Utility to get rid of Apple Core Storage but in my case not worth the effort.

So, format the HD on your Mac using Disk Utility. Settings used:

- Name: `Time Machine`
- Format: `Mac OS Extended (Journaled)`
- Scheme: `GUID Partition Map`

### Ensure Pi has permissions to control the drive

Go to the Finder, then right-click the drive in the sidebar. Click `Get Info`.

Click the lock at bottom right, then enter your password. Next, check `Ignore ownership on this volume.` and give `Read & Write` permissions to `everyone`. And do not forget to click `Apply to enclosed items`.

Linux cannot write data into `journaled` hfs+ file system, so you also need to disable that:

```
diskutil list
```

Find your drive and partition identifier (like: `disk2s2`), then run:

```
diskutil disableJournal /dev/disk2s2

...

Journaling has been disabled for volume *** on disk2s2
```

### Install tools for Apple-formatted drives

Go to Pi (ssh'ed it!) and run:
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get --assume-yes install hfsprogs hfsplus
```

### Mount the drive

- Find the drive:

  ```
  sudo fdisk -l

  ...

  Disk /dev/sda: 931.5 GiB, 1000204886016 bytes, 1953525168 sectors
  Units: sectors of 1 * 512 = 512 bytes
  Sector size (logical/physical): 512 bytes / 512 bytes
  I/O size (minimum/optimal): 512 bytes / 512 bytes
  Disklabel type: gpt
  Disk identifier: DE07BD84-C4E1-4229-81CD-E146E04D46C6

  Device         Start        End   Sectors   Size Type
  /dev/sda1         40     409639    409600   200M EFI System
  /dev/sda2     409640  975539735 975130096   465G Apple HFS/HFS+
  /dev/sda3  975802368 1953523711 977721344 466.2G Microsoft basic data
  ```

  In my case my HD is connected to USB and the device is `/dev/sda2`. A good hint is the fs type `Apple HFS/HFS+` or on other tools `hfsx`.

- Create your mounting point:

  ```
  sudo mkdir -p /media/time_machine
  ```

- Check if Pi already auto-mounted your drive:

  ```
  sudo mount
  ```

  If it's mounted, you need to un-mount it or give it write permissions. In my case I didn't want to have it mounted on `/media/pi/Time Machine` so I un-mounted it:

  ```
  sudo umount /dev/sda2
  ```

- Mount drive using your editor of choice:

  ```
  sudo nano /etc/fstab
  ```

  Add to the end of the file:

  ```
  /dev/sda2 /media/time_machine hfsplus force,rw,user,noauto,x-systemd.automount 0 0
  ```

  Mount the drive:

  ```
  sudo mount -a
  ```

  Check if it's mounted by finding the line like the bellow:

  ```
  sudo mount

  ...

  /dev/sda2 on /media/time_machine type hfsplus (rw,nosuid,nodev,noexec,relatime,umask=22,uid=0,gid=0,nls=utf8,user)
  ```

## 0x01 Netatalk

Netatalk simulates AFP, the network protocol Apple currently users for Time Machine backups.

### Install

Install required packages:

```
sudo apt-get install build-essential libevent-dev libssl-dev libgcrypt-dev libkrb5-dev libpam0g-dev libwrap0-dev libdb-dev libtdb-dev default-libmysqlclient-dev avahi-daemon libavahi-client-dev libacl1-dev libldap2-dev libcrack2-dev systemtap-sdt-dev libdbus-1-dev libdbus-glib-1-dev libglib2.0-dev libio-socket-inet6-perl tracker libtracker-sparql-1.0-dev libtracker-miner-1.0-dev
```

Get the tarball from [Netatalk Web Site](http://netatalk.sourceforge.net/), download and extract it.

```
tar xvf netatalk-3.1.11.tar.bz2
cd netatalk-3.1.11
```

Do configure, then make and install.

```
./configure \
        --with-init-style=debian-systemd \
        --without-libevent \
        --without-tdb \
        --with-cracklib \
        --enable-krbV-uam \
        --with-pam-confdir=/etc/pam.d \
        --with-dbus-daemon=/usr/bin/dbus-daemon \
        --with-dbus-sysconf-dir=/etc/dbus-1/system.d \
        --with-tracker-pkgconfig-version=1.0
```

```
sudo make
sudo make install
```

Alternatively, you can check features and paths using "netatalk -V" and "afpd -V".

### Configure

Edit `afp.conf`.

```
sudo nano /usr/local/etc/afp.conf
```

Add to the end:

```
[Global]
  mimic model = TimeCapsule6,106

[RPi-TimeMachine]
  path = /media/time_machine
  time machine = yes
```

## 0x02 Launch Services

```
sudo service avahi-daemon start
sudo service netatalk start
```

```
sudo systemctl enable avahi-daemon
sudo systemctl enable netatalk
```

## 0x03 Finish

### Give your Pi a static IP

Go to your router and assign a static IP to your Pi.

### Connect to Time Machine

Go to your Mac Finder you should see your Raspberry Pi there.
Click on `Connect as` and insert your credentials (user: timemachine). If doesn't work, connect to your Pi through its static IP. Open Finder, then hit Command+K on your keyboard and insert:

```
afp://{YOUR_PI_IP}
```

### Configure your Mac Time Machine

Go to `System Preferences > Time Machine` and clik on `Select Disk...`. Your Pi should show on the list. Select and use the settings that work best.

## 0x04 References

- <https://github.com/mr-bt/raspberrypi-timemachine>
- <http://netatalk.sourceforge.net/wiki/index.php/Install_Netatalk_3.1.11_on_Ubuntu_16.04_Xenial>
- <https://wiki.archlinux.org/index.php/Netatalk>
- <https://support.apple.com/zh-cn/HT202944>
- <https://wiki.archlinux.org/index.php/Fstab>
