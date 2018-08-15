---
id: mysql-replace-text-in-all-fields
date: 2018-06-12 17:12:28
title: MySQL 在所有字段内搜索替换文本
categories: snippets
---

又是项目所需，继续造轮子。替换指定数据库的「所有表」内「所有记录」的「所有字段」的值，以下为 SQL 语句。

## 0x00 创建存储过程

```sql
CREATE PROCEDURE `replace_table` (IN `orig_str` VARCHAR(100), IN `new_str` VARCHAR(100), IN `db_name` VARCHAR(100), IN `t_name` VARCHAR(100))
BEGIN
    DECLARE cul_name VARCHAR(100);
    DECLARE done int default 0;
    DECLARE cur CURSOR FOR SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=db_name and TABLE_NAME=t_name;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    OPEN cur;
    FETCH cur INTO cul_name;
    WHILE (done<>1) DO
        # MySQL 8.0 亦可使用 REGEXP_REPLACE 函数支持正则替换
        SET @update_sql = CONCAT("UPDATE `", t_name, "` SET `", cul_name, "` = REPLACE(`", cul_name, "`, '", orig_str, "', '", new_str, "')", " WHERE `", cul_name, "` REGEXP '" , ".*" , "';");
        # 输出替换 SQL
        -- SELECT @update_sql;
        # 执行替换 SQL
        PREPARE stmt FROM @update_sql;
        EXECUTE stmt;
        FETCH cur INTO cul_name;
    END WHILE;
    CLOSE cur;
END;

CREATE PROCEDURE `replace_db` (IN orig_str VARCHAR(100), IN new_str VARCHAR(100), IN db_name VARCHAR(100), IN tbl_name VARCHAR(100))
BEGIN
    DECLARE t_name VARCHAR(100);
    DECLARE done INT DEFAULT 0;
    DECLARE cur CURSOR FOR SELECT DISTINCT table_name AS name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema=db_name AND table_name LIKE tbl_name;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    OPEN cur;
    FETCH cur INTO t_name;
    WHILE (done<>1) DO
        CALL replace_table(orig_str, new_str, db_name, t_name);
        FETCH cur INTO t_name;
    END WHILE;
END;
```

## 0x01 调用

```sql
CALL replace_db('<KEYWORD>', '<REPLACE_TO>', '<DB_NAME>', '<TBL_NAME>');
```

- `<KEYWORD>`：被替换的字符串，如：`xkedou.cn`
- `<REPLACE_TO>`：替换值，如：`zjhejiang.com`
- `<DB_NAME>`：数据库名，如：`zjhj_mall`
- `<TBL_NAME>`：表名，如：`hjmall_%` 指定表前缀。

以上示例参数可实现：将 `zjhj_mall` 数据库内所有前缀为 `hjmall_` 的表内任何字段出现的 `xkedou.cn` 全部替换为 `zjhejiang.com`。

另附正则替换图片域名实例：

```sql
SELECT REGEXP_REPLACE (
    'http://foo.bar.com/addons/zjhj_mall/core/web/uploads/example.png',
    '^(http|https)://foo.bar.com/(.*)(\.png|\.jpg|\.gif|\.jpeg)$',
    '$1://bar.foo.com/$2$3'
);
```