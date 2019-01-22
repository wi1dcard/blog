---
title: "由浅入深：Laravel Broadcast 实现 WebSocket B/S 实时通信"
date: 2018-03-02 20:37:32
id: laravel-broadcasting
categories: Tutorials
---

> Laravel 集成众多开包即用的功能, 虽然它真的很"胖", 但这并不影响它是个好框架. 本篇文章将采用 Laravel 5.6 版本由浅入深为大家演示: 如何使用内置的 Broadcast（广播）功能实现与客户端实时通信.

Tips: 此[仓库](https://github.com/wi1dcard/laravel-broadcasting)实现[本文](https://wi1dcard.github.io/tutorials/laravel-broadcasting/)中的 `0x02 广播` 代码。

## 0x00 准备

- [广播系统 - Laravel 5.6 中文文档](https://laravel-china.org/docs/laravel/5.6/broadcasting)
- [用户认证 - Laravel 5.6 中文文档](https://laravel-china.org/docs/laravel/5.6/authentication)
- [事件系统 - Laravel 5.6 中文文档](https://laravel-china.org/docs/laravel/5.6/events)
- [队列系统 - Laravel 5.6 中文文档](https://laravel-china.org/docs/laravel/5.6/queues)
- [前端指南 - Laravel 5.6 中文文档](https://laravel-china.org/docs/laravel/5.6/frontend)
- [tlaverdure/laravel-echo-server](https://github.com/tlaverdure/laravel-echo-server)

没错，这是你需要的知识储备。

> 截止本文发布，Laravel 5.6 中文文档并未翻译完成，亦可参照 5.5 版本文档，类同。

因为 PHP 本身并不支持 WebSocket，所以我们需要一个能够将「服务器」数据发给「客户端」的间接层。也就是说，实现实时通信可以大致分为两个步骤：

1. 「Laravel」 -> 「间接层」
2. 「间接层」->（via WebSocket）->「客户端」

至于间接层我们采用什么实现，后面再讲。

## 0x01 配置

根据如上 `广播系统` 的文档，我们首先需要做如下的配置工作。

#### (1)

首先，修改 `config/broadcasting.php` 或 `.env` 文件。确保 Broadcast Default Driver 是 `log`，以打开此功能，且便于我们调试。

#### (2)

使用 Broadcast 广播，必须了解 Laravel 的 `事件系统`，它们是互相依赖的。接下来我们创建一个可以「被广播」的事件。

修改 `app/Providers/EventServiceProvider.php`，在成员变量 `$listen` 内追加：

```php
'App\Events\OrderShipped' => [
	'App\Listeners\SendShipmentNotification',
],
```

这里我们将此事件命名为 `OrderShipped`（订单已结算）；执行 `php artisan event:generate` 生成事件类及其监听器。

> 若是需要将事件执行（即广播到客户端）修改为异步，请参考如上 `队列系统` 文档。

#### (3)

为了能让事件「被广播」，我们需要让事件类继承 `ShouldBroadcast` 接口。

打开 `app/Events/OrderShipped.php`，修改类定义为：

```php
class OrderShipped implements ShouldBroadcast
```

#### (4)

`ShouldBroadcast` 接口要求实现 `broadcastOn` 方法，用于告知框架：此事件应该被发送到哪个「频道」。

> Laravel 的广播系统允许有多个频道存在，你可以使用用户名区别不同频道，这样不同的用户收听不同频道，即可获得不同消息，也就能实现和不同客户端进行单独通信。
> 
> 当然，你也可以任意命名频道，但最好具有有一定规则。

因为我们刚刚使用 artisan 命令生成的事件代码，所以在文件最下方，你已经能够看到 `broadcastOn` 方法的定义了。我们稍作修改：

```php
public function broadcastOn()
{
	return new Channel('orderStatus');
}
```

这里我们将频道命名为：`orderStatus`，并返回。也就是说此事件被广播时，它将会被广播到名字为 `orderStatus` 的频道。

这是一个「公有频道」，任何人可以监听此频道，并收到广播的消息。Laravel 同时提供了「私有频道」，经过权限验证后才能成功监听。我们后面再讲。

#### (6)

默认情况下，Laravel 会将「事件名」作为广播的「消息名」，且不带任何数据。我们可以在事件类内添加任意成员变量，并修改构造函数，以实现将数据发送给客户端。

```php
//可添加任意成员变量
public $id;

//事件构造函数
public function __construct($id)
{
	$this->id = $id;
}

//自定义广播的消息名
public function broadcastAs()
{
    return 'anyName';
}
```

#### (5)

如上，我们已经基本建立起广播的基本机制。接下来我们需要一个能「触发事件」（即发送广播）的接口。

在`routes/api.php`添加如下代码：

```php
Route::get('/ship', function (Request $request)
{
	$id = $request->input('id');
    event(new OrderShipped($id)); // 触发事件
    return Response::make('Order Shipped!');
});
```

#### (6)

好了！打开 Postman，输入：`http://***/api/ship?id=1000`，发送。

打开`storage/logs/laravel.log`，你会发现多了几行：

```
[2018-03-02 01:41:19] local.INFO: Broadcasting [App\Events\OrderShipped] on channels [orderStatus] with payload:
{
    "id": "1000",
    "socket": null
}
```

恭喜，你已经成功地配置好 Broadcast 的 `log` Driver。

## 0x02 广播

在上一节，我们采用`log`作为 Broadcast Driver，也就是说广播的消息会被记录到日志内，那么如何真正地与客户端进行通信呢？这就需要用到最开始提到的「间接层」了。

#### (1)

首先，将 Driver 由`log`修改为`pusher`。

> 为了节省安装 Redis 的步骤，我们将采用 HTTP 协议直推至兼容的「本地 Pusher 服务器」（即间接层）。

#### (2)

由于 Laravel 内置并没有携带 Broadcast Pusher Driver，因此需要使用 Composer 安装 Pusher PHP SDK：

```bash
composer require pusher/pusher-php-server
```

#### (3)

注册`App\Providers\BroadcastServiceProvider`。

对于Laravel 5.6，只需要取消`config/app.php`内`providers`数组中的对应注释即可。

#### (4)

接下来，需要安装并配置服务器与客户端通信的「间接层」。

我们采用官方文档推荐的：`tlaverdure/laravel-echo-server`。这是一个使用 Node.js + Socket.IO 实现的 WebSocket 服务端。

> 它兼容 Pusher HTTP API，所以如上能够直接将 Driver 修改为 Pusher，而不是 Redis。

```bash
npm install -g laravel-echo-server
```

初始化配置文件，按照提示填写即可。

`laravel-echo-server init`

打开`laravel-echo-server.json`，检查部分关键配置项是否正确：

```json
"authHost": "http://xxx" // 确保能够访问到你的 Laravel 项目
"port": "6001" // 建议不作修改，这是与客户端通信的端口
"protocol": "http" // 与客户端通信的协议，支持 HTTPS
```

复制两个值：`clients.appId`以及`clients.key`，并修改`config/broadcasting.php`。

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => null,
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'host' => 'localhost',
        'port' => 6001,
    ],
],
```

顾名思义，将`appId`和`key`分别填入相应配置项或修改`.env`文件即可。

接下来，我们便可以使用命令`laravel-echo-server start`来启动服务器，监听来自Laravel的「广播」请求、以及来自客户端的「收听」请求，并转发相应广播消息。

#### (5)

从这里开始我们将会配置前端部分。

首先，需要配置 CSRF Token。

如果你使用 Blade 模板引擎，则执行 `php artisan make:auth` 命令即可将 Token 加入 `resources/views/layouts/app.blade.php`。

若没有使用此模板文件，则可以直接在 Blade 模板文件首行直接写入 Meta 值。

为了便于测试，我们在 `resources/views/welcome.blade.php` 内添加：

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

对于前后端分离的项目，可关闭 CSRF Token 验证。

#### (6)

其次，你需要引用 Socket.IO 的客户端 JS 文件，位置同上。

```html
<script src="//{{ Request::getHost() }}:6001/socket.io/socket.io.js"></script>
```

#### (7)

这里我们采用官方的 Laravel Echo 扩展包收听服务端广播。打开`resources/assets/js/bootstrap.js`，修改最后几行即可。

```js
import Echo from 'laravel-echo'

window.Echo = new Echo({
    broadcaster: 'socket.io',
    host: window.location.hostname + ':6001'
});
```

接着编写「收听频道」代码，非常简单：

```js
window.Echo.channel(`orderStatus`) // 广播频道名称
    .listen('OrderShipped', (e) => { // 消息名称
        console.log(e); // 收到消息进行的操作，参数 e 为所携带的数据
    });
```

#### (8)

安装依赖，编译前端文件。执行如下命令：

```bash
npm install
npm install --save laravel-echo
npm run dev
```

最后，在 Blade 模板内引用我们刚刚写好的 JS 脚本。由于`app.js`默认已经引用`bootstrap.js`，所以我们只需要引用`app.js`即可。

我们在第 (5)步的文件内添加：

```html
<script src="{{ asset('/js/app.js') }}"></script>
```

#### (9)

好了！在查看效果前，不要忘记执行第 (4)步的最后一条命令，启动 Laravel Echo Server。

Laravel 默认已经定义首页路由渲染`welcome.blade.php`模板，现在只要使用浏览器访问应用 URL 即可。

如果查看 Chrome 控制台，没有任何错误产生；查看命令行窗口，没有错误输出；则说明客户端与服务器似乎已经正常建立 WebSocket 连接。

这时，你可以重新打开Postman，发送上一节中的请求。

再次查看如上两个窗口，会有惊喜哟。

## 0x03 私有频道

上一节我们成功实现可以被任何人收听的「共有频道」广播，那么如何与部分客户端进行通讯呢？仅仅依靠前端的验证是不够的。我们需要创建带有「认证」功能的「私有频道」。

#### (1)

首先，打开 `app/Providers/BroadcastServiceProvider.php`，在上一节中我们已经注册此服务提供者，现在我们需要取消注释一部分代码。

```php
public function boot()
{
	Broadcast::routes(); // 还记得 laravel-echo-server.json 的 authEndpoint 配置项吗？
	require base_path('routes/channels.php');
}
```

`Broadcast::routes()` 用于注册验证路由（即 `/broadcasting/auth`），当客户端收听频道时，Laravel Echo Server 会访问此路由，以验证客户端是否符合「认证」条件。

#### (2)

Broadcast 认证分为两个部分：

1. 使用 Laravel 内置的 Auth 系统进行认证。
2. 根据自定义规则进行部分频道的认证。

#### (3)

首先，需要配置 Auth 认证系统。

根据情况修改 `.env` 文件的数据库配置项后，只需要执行 `php artisan make:auth` 创建所需文件，再执行 `php artisan migrate` 创建所需数据库结构即可。

> 深入了解，请参考 `用户认证` 文档。

接下来我们在浏览器中打开你的应用，会发现右上角多了登录和注册，我们随意注册一个测试用户以备使用。

#### (4)

接下来，配置频道认证。

还记得第 (1) 步的 `routes/channels.php` 吗，我们打开此文件。并新增一条频道认证规则。

> 注意：虽然此文件位于 `routes` 目录下，但并不是路由文件！在此定义后并不能访问，且无法使用分组、中间件。所有的验证路由都已经在 `Broadcast::routes()` 中定义。

```php
Broadcast::channel('orderStatus', function ($user, $value) {
    return true; // or false
});
```

由于 Broadcast 已经使用 Auth 进行用户登录认证，所以我们只需无条件返回 `true` 即可实现：任何已登录用户都可以收听此频道。

#### (5)

认证部分我们已经配置完成，接下来将共有频道的定义改为私有。

修改广播消息基于的事件类 `app/Events/OrderShipped.php`：

```php
public function broadcastOn()
{
	return new PrivateChannel('orderStatus'); // 私有频道
}
```

修改客户端收听代码 `resources/assets/js/bootstrap.js`。

```js
window.Echo.private(`orderStatus`) // 私有频道
    .listen('OrderShipped', (e) => {
        console.log(e);
    });
```

#### (6)

接下来，再次运行 Laravel Echo Server。使用浏览器打开你的应用首页，在未登录状态，可以看到 Echo Server 输出一个来自 Laravel 的 `AccessDeniedHttpException` 异常，提示用户认证失败，无法收听频道。

登录后，即可获得与上一节相同的预期结果。

#### (7)

如上，我们成功实现所有登录用户均可收听私有频道。那么如何实现某部分用户可以收听，某部分用户不可以收听频道？例如：某个用户均有属于自己的频道，他只能收听自己的频道。请继续往下看。


首先，修改广播消息基于的事件类 `app/Events/OrderShipped.php`。你需要将频道命名修改为动态的值。

```php
public $userId; // 新增成员变量 userId，不要忘记在构造函数内对其进行赋值

public function broadcastOn()
{
	return new PrivateChannel('orderStatus-' . $this->userId); // 动态命名私有频道
}
```

其次，修改第 (4) 步中的 `routes/channels.php` 文件。Broadcast 支持使用通配符匹配「某一类」频道进行验证。

```php
Broadcast::channel('orderStatus-{userId}', function ($user, $value) {
    // $user	Auth认证通过的用户模型实例
    // $value	频道规则匹配到的 userId 值
    return $user->id == $value; // 可使用任意条件验证此用户是否可监听此频道
});
```

最后别忘记修改前端收听的频道名称。

再次打开浏览器测试即可发现：在本例中，若客户端收听的频道不匹配当前用户 ID，则会报错。

#### (8)

如上，我们成功实现对私有频道进行自定义规则的认证；但如果我们没有使用 Auth 认证系统，或采用了自己编写的用户认证中间件，该如何兼容呢？

经过一番源码调试，我发现 Broadcast 在 `vendor/laravel/framework/src/Illuminate/Broadcasting/Broadcasters/` 文件夹下定义的 `Broadcaster` 内调用 `$request->user()` 进行了用户验证。

例如我们采用的 `PusherBroadcaster.php`：

```php
/**
 * Authenticate the incoming request for a given channel.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return mixed
 * @throws \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
 */
public function auth($request)
{
    if (Str::startsWith($request->channel_name, ['private-', 'presence-']) &&
        ! $request->user()) {
        throw new AccessDeniedHttpException;
    }

    $channelName = Str::startsWith($request->channel_name, 'private-')
                        ? Str::replaceFirst('private-', '', $request->channel_name)
                        : Str::replaceFirst('presence-', '', $request->channel_name);

    return parent::verifyUserCanAccessChannel(
        $request, $channelName
    );
}
```

由此可得，我们有两种方式实现。

##### 第一种

直接注释 `throw new AccessDeniedHttpException`，并修改 `app/Providers/BroadcastServiceProvider.php`。

`Broadcast::routes()` 可接收一个参数。在 `vendor/laravel/framework/src/Illuminate/Broadcasting/BroadcastManager.php` 可查看其定义：

```php
/**
 * Register the routes for handling broadcast authentication and sockets.
 *
 * @param  array|null  $attributes
 * @return void
 */
public function routes(array $attributes = null)
{
    if ($this->app->routesAreCached()) {
        return;
    }

    $attributes = $attributes ?: ['middleware' => ['web']];

    $this->app['router']->group($attributes, function ($router) {
        $router->post('/broadcasting/auth', '\\'.BroadcastController::class.'@authenticate');
    });
}
```

通过源码可知：此参数等效于 `Route::group()` 的第一个参数。所以我们只要将其修改为如下形式：

```php
Broadcast::routes(['middleware' => ['yourMiddleware'])
```

并在中间件内进行用户认证；如未登录，照常抛出 `AccessDeniedHttpException` 异常即可。

##### 第二种

在`vendor/laravel/framework/src/Illuminate/Http/Request.php` 可以查看到 `$request->user()` 的定义。

```php
/**
 * Get the user making the request.
 *
 * @param  string|null  $guard
 * @return mixed
 */
public function user($guard = null)
{
    return call_user_func($this->getUserResolver(), $guard);
}
```

如上可知，它使用 `$this->userResolver` 内的匿名函数获取用户模型。所以我们只需要在 `AuthServiceProvider` 注册后，Broadcast 认证前，替换掉其 `userResolver` 即可。

例如：继承 `Illuminate\Auth\AuthServiceProvider`（`vendor/laravel/framework/src/Illuminate/Auth/AuthServiceProvider.php`），并重写 `registerRequestRebindHandler` 方法及构造函数，添加如下代码。

```php
$request->setUserResolver(function ($guard = null) use ($app) {
    // 在此判断用户登录状态
    // 若登录，请返回 App\User 或其它用户模型实例
    // 未登录，请返回 null
});
```

修改 `config/app.php`，使用改造过的 `AuthServiceProvider` 类替换原服务提供者即可。

## 0x04 扩展阅读

- [Laravel Broadcast——广播系统源码剖析](https://laravel-china.org/articles/7137/laravel-broadcast-an-analysis-of-the-source-code-of-the-broadcasting-system)

- [Laravel 中服务端与客户端事件广播实现](http://laravelacademy.org/post/8379.html)

## 0x05 总结

至此，你已经建立对 Laravel Boardcast 的基本认识，成功入门「广播系统」。

另外，Laravel 5.6 新增一条关于 Broadcast 的新特性，避免在 `routes/channels.php` 文件内编写众多闭包导致的难以维护。详情可查看：[Laravel 5.6 新版特性](http://laravelacademy.org/post/8230.html)。

其实，本文只不过抛砖引玉而已。对于部署到生产环境，仍然存在许多问题，例如：

- 与常见 PHP 应用不同，广播基于 WebSocket 长连接；那么如何确保通信稳定性，如何剔除死链？
- 为了确保应用访问速度，广播通常是异步执行的；那么如何配置事件队列？如何将队列配置为异步？
- 如何确保 Laravel Echo Server 进程稳定运行？如何处理异常？是否需要关闭 Debug 模式？
- 如何确保 Laravel Echo 与服务端连接稳定？是否需要定时检查？如何捕捉并完善地处理所有异常？
- 客户端收听私有频道，若被服务器拒绝，是否需要断开连接？如何给予用户友好地提示？
- ……

当然，这些问题本文没有提到，但网络上已经有无数成熟、便捷的解决方案；更多高级用法也可以参照本文最初列出的官方文档。

## 0xFF 感言

“在计算机领域内，没有什么是加一个中间层解决不掉的问题；如果有，再加一层。”