---
id: php-fastest-create-tree-from-list
date: 2018-08-06 11:40:06
title: PHP 快速扫描列表创建无限极分类树
categories: WTF
tags: [PHP]
---

书接上回。上文结尾，讲解了引用的妙用。刚好，在我现在所处公司的业务里有一处用递归实现的「省市区」分级列表；本文将这一用途搬进生产环境，通过优化此省市区列表，试试真正的效果如何。

废话不多说，上代码。

### 省市区列表结构

```php
array(
    1 => array(
            'id' => 1,
            'name' => '中华人民共和国',
            'parent_id' => 0,
            'level' => 'country',
        ),
    2 => array(
            'id' => 2,
            'name' => '北京市',
            'parent_id' => 1,
            'level' => 'province',
        ),
    20 => array(
            'id' => 20,
            'name' => '天津市',
            'parent_id' => 1,
            'level' => 'province',
        ),
    38 => array(
            'id' => 38,
            'name' => '河北省',
            'parent_id' => 1,
            'level' => 'province',
        ),
    218 => array(
            'id' => 218,
            'name' => '山西省',
            'parent_id' => 1,
            'level' => 'province',
        ),
    349 => array(
            'id' => 349,
            'name' => '内蒙古自治区',
            'parent_id' => 1,
            'level' => 'province',
        ),
    465 => array(
            'id' => 465,
            'name' => '辽宁省',
            'parent_id' => 1,
            'level' => 'province',
        ),
    ...
);
```

### 优化前

```php
/**
* 获取以父级 ID 为 $parent_id 为根节点的树型结构数组
*
* @param array $arr
* @param int $level 树型当前层
* @param int $parent_id 父级id
* @param int $floor 树型总层数
* @return array
*/
public static function getList(&$arr, $level = 0, $parent_id = 1, $floor = 3)
{
    if ($level != 0) {
        $empty = $arr[$parent_id];
        $empty['list'] = [];
        $emptyPointer = &$empty['list'];
    } else {
        $empty = [];
        $emptyPointer = &$empty;
    }
    if ($level < $floor) {
        $ok = false;
        foreach ($arr as $index => &$item) {
            if ($item['parent_id'] == $parent_id) {
                $data = self::getList($arr, $level + 1, $index);
                array_push($emptyPointer, $data);
                $ok = true;
            }
            if ($ok && $item['parent_id'] != $parent_id) {
                break;
            }
        }
    }

    return $empty;
}
```

### 优化后

```php
public static function getList($catList)
{
    $treeData = [];
    foreach ($catList as &$item) {
        $parent_id = $item['parent_id'];
        if (isset($catList[$parent_id]) && !empty($catList[$parent_id])) {
            $catList[$parent_id]['list'][] = &$catList[$item['id']];
        } else {
            $treeData[] = &$catList[$item['id']];
        }
    }
    unset($item);
    return $treeData[0]['list']; // 根节点只有中华人民共和国，所以直接返回中国的所有子节点
}
```

### 效果

以下为此函数执行 1000 次取平均值。

|        | 函数运行时间 (ms) | memory_get_peak_usage() | 峰值内存 (MB) |
| ------ | ----------------- | ----------------------- | ------------- |
| 优化前 | 157.65            | 2516192                 | 2.39          |
| 优化后 | 2.01              | 987872                  | 0.94          |

仅供参考，不同环境生成的具体数值可能差异较大，只关注优化前后的对比就好。
