---
title: "MySQL 批量更新所有字段 Collation"
date: 2017-09-06 19:31:39
id: mysql-update-all-collations
categories: Snippets
---

今天项目部署遇到个坑，之前建数据库的时候，把所有的collation都写成了utf8，在测试服务器上也没怎么注意，部署正式服务器果断用mb4，故需要修改上百个字段的collation。 

根据一次可以，两次能忍，三次绝对不行的懒人原则orz，决定写个脚本实现一键修改，废话不多说先去网上找了个轮子。

referer: <https://my.oschina.net/xuqiang/blog/507629>

经过一番修改和摸索，总结出如下存储过程：

```sql
begin
    declare f_name varchar(100); 
    declare b int default 0;    /*是否达到记录的末尾控制变量*/
		-- 注意修改下面的数据库名称 wsm_aliyun
    declare table_name cursor for SELECT TABLE_NAME FROM information_schema.TABLES where TABLE_SCHEMA = 'construction_online';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET b = 1;

    OPEN table_name;
    REPEAT
    FETCH table_name INTO f_name; /*获取第一条记录*/
				SET @STMT :=CONCAT("ALTER TABLE ",f_name," CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");   
			PREPARE STMT FROM @STMT;   
    EXECUTE STMT;  
-- INSERT into TestTable(name) VALUES (f_name);
       -- ALTER TABLE f_name CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci; 
    UNTIL b = 1
		END REPEAT;
    close table_name;
end
```

其中，construction_online是数据库名，utf8mb4和utf8mb4_unicode_ci修改成你想替换的charset和collation即可。

最后：call ……();

完事。