---
title: PHP 相对路径转绝对路径
date: 2018-06-08 14:11:22
id: php-true-realpath
categories: Snippets
tags: [PHP, Reprinted]
---

PHP has a very handy function to convert relative pathnames to absolute paths: `realpath()`. However, it’s limited in at least two aspects which both make it inconvenient (and sometimes impossible) to use:

1. It’s limited to current directory – you cannot specify an arbitrary path for «.». This is inconvenient because we don’t want to change CWD before each call to `realpath()` and restore it afterwards.
2. It works on already existing paths and files – this is because `realpath()` also resolves symlinks to real paths. However, this is much more annoying – what if we’re try to get a path for a new file we’re going to create? `realpath()` does a good job by resolving symlinks but it shouldn’t fail once it finds there’s no path below.

After struggling for some time with `realpath()` I decided to write my own function to expand relative paths to absolute – and here it is :)

1. It doesn’t depend on CWD, you can pass an arbitrary value for it.
2. Two functions: Expand which works exactly like `realpath()` but without its downsides; and ExpandLeaveLinks which does the same but doesn’t resolve symlinks.
3. It works regardless if file/directory exists or not. If yes (and you’re not calling ExpandLeaveLinks but Expand), it will resolve symlinks until path exists. If no, it will skip the remaining path and leave it as is.

```PHP
/*
  RealPath() alternative - converts absolute path into relative.
  No license (pubilc domain). Written by Proger_XP, http://proger.i-forge.net/Real_realpath
*/

// path w/o trailing slash unless it's just "/" or "c:/"; converts \ to / removing
// successive / and \; resolves '.' and '..' relative to $cwd.
function Expand($path, $cwd = null) {
  $path = self::ExpandLeaveLinks($path, $cwd);

    if (function_exists('readlink')) {  // prior to PHP 5.3 it only works for *nix.
      while (is_link($path) and ($target = readlink($path)) !== false) { $path = $target; }
    }

  return $path;
}

function ExpandLeaveLinks($path, $cwd = null) {
  if (!is_scalar($path) and $path !== null) { return; }

  $cwd === null and $cwd = getcwd();
  $cwd = static::pathize($cwd);

  $path = strtr($path, DS === '\\' ? '/' : '\\', DS);
  $firstIsSlash = (isset($path[0]) and strpbrk($path[0], '\\/'));

  if ($path === '' or (!$firstIsSlash and isset($path[1]) and $path[1] !== ':')) {
    $path = $cwd.DS.$path;
  } elseif ($firstIsSlash and isset($cwd[1]) and $cwd[1] === ':') {
    // when a drive is specified in CWD then \ or / refers to that drive's root.
    $path = substr($cwd, 0, 2).$path;
  }

  if ($path !== '' and ($path[0] === DS or (isset($path[1]) and $path[1] === ':'))) {
    list($prefix, $path) = explode(DS, $path, 2);
    $prefix .= DS;
  } else {
    $prefix = '';
  }

  $expanded = array();
  foreach (explode(DS, $path) as $dir) {
    if ($dir === '..') {
      array_pop($expanded);
    } elseif ($dir !== '' and $dir !== '.') {
      $expanded[] = $dir;
    }
  }

  return $prefix.join(DS, $expanded);
}
```

原文地址：<http://proger.i-forge.net/Real_realpath>
