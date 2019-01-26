---
id: laravel-logging-with-mongodb
date: 2018-08-15 12:36:19
title: Laravel 5.6 使用 MongoDB 存储框架日志
categories: Tutorials
tags: [Laravel]
---

网上的文章普遍是 Laravel 5.5 版本，而日志系统在 5.6 版本升级时进行了部分改动，原有方法基本都失效了。本文根据 Laravel 5.6 文档的指引，实现使用 MongoDB 存储框架日志。

## 0x00 准备

### MongoDB Engine

首先，安装 `MongoDB`，参见 [官方文档](https://docs.mongodb.com/manual/administration/install-community/)。

### MongoDB Driver（PHP Extension）

其次，安装 PHP `mongodb` 扩展，参见 [官方文档](http://php.net/manual/zh/mongodb.setup.php)。

GitHub：<https://github.com/mongodb/mongo-php-driver>。

### MongoDB Library（Wrapper Package）

最后，通常情况下，你还需要一个高度封装的包装库；使用 MongoDB 官方提供即可，参见 [官方文档](https://docs.mongodb.com/php-library/current/tutorial/install-php-library/)。

GitHub：<https://github.com/mongodb/mongo-php-library>。

## 0x01 配置

打开 `config/logging.php`，修改其 `channels`。

```php
return [
    // ...

    'channels' => [
        // ...

        'mongodb' => [ // 此处可以根据需求调整
            'driver' => 'custom', // 此处必须为 `custom`
            'via' => CreateCustomLogger::class, // 当 `driver` 设置为 custom 时，使用 `via` 配置项所指向的工厂类创建 logger

            // 以下 env 配置名可以根据需求调整
            'server' => env('LOG_MONGO_SERVER', 'mongodb://localhost:27017'),
            'database' => env('LOG_MONGO_DB', 'logs'),
            'collection' => env('LOG_MONGO_COLLECTION', 'logs'),
            'level' => env('LOG_MONGO_LEVEL', 'debug'), // 日志级别
        ],
    ],
];
```

接着你需要将 `default` 修改为 `mongodb`，也可以修改 `.env`。

```php
return [
    'default' => env('LOG_CHANNEL', 'mongodb'), // 我直接将默认值修改为 mongodb，也就是 channels 内新增的配置项。

    // ...
]
```

## 0x02 实现

找个合适的位置（我使用 `app/Logging`）创建 `CreateCustomLogger.php`。

```php
use Monolog\Logger;
use Monolog\Handler\MongoDBHandler;
use Monolog\Processor\WebProcessor;

class CreateCustomLogger
{
    /**
     * Create a custom Monolog instance.
     *
     * @param  array  $config
     * @return \Monolog\Logger
     */
    public function __invoke(array $config)
    {
        $logger = new Logger(''); // 创建 Logger

        $handler = new MongoDBHandler( // 创建 Handler
            new \MongoDB\Client($config['server']), // 创建 MongoDB 客户端（依赖 mongodb/mongodb）
            $config['database'],
            $config['collection']
        );

        $handler->setLevel($config['level']);

        $logger->pushHandler($handler); // 挂载 Handler
        $logger->pushProcessor(new WebProcessor($_SERVER)); // 记录额外的请求信息

        return $logger;
    }
}
```

## 0x03 完成

好了，接下来可以执行 `php artisan tinker`，输入 `Log::warning(...)` 测试你的成果了。

别忘记把 MongoDB 服务启动。
