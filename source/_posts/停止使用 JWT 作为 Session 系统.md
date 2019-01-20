---
id: stop-using-jwt-for-sessions
date: 2019-01-20 11:11:22
title: 停止使用 JWT 作为 Session 系统
categories: Translations
---

JSON Web Tokens，又称 `JWT`。本文作者将详解：为何 JWT 不适合存储 Session，以及 JWT 引发的安全隐患。望各位使用前三思。

<!--more-->

> 原文地址：<http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/>

十分不幸，我发现越来越多的人开始推荐使用 JWT 管理网站的用户会话（`Session`）。在本文中，我将说明为何这是个非常非常差劲的想法。

为了避免疑惑和歧义，首先定义一些术语：

- 无状态 JWT（`Stateless JWT`）：包含 Session 数据的 JWT Token。Session 数据将被直接编码进 Token 内。
- 有状态 JWT（`Stateful JWT`）：包含 Session 引用或其 ID 的 JWT Token。Session 数据存储在服务端。
- `Session token`（又称 `Session cookie`）：标准的、可被签名的 Session ID，例如各类 Web 框架（译者注：包括 Laravel）内已经使用了很久的 Session 机制。Session 数据同样存储在服务端。

需要澄清的是：本文并非挑起「永远不要使用 JWT」的争论 —— 只是想说明 JWT 并不适合作为 Session 机制，且十分危险。JWT 在其它方面的确有其用武之地。本文结尾，我将简短地介绍一些合理用途。

## 首先需要说明

很多人错误地尝试比较 `Cookies` 和 `JWT`。这种对比毫无意义，就像对比内存和硬盘一样。Cookies 是一种存储机制，然而 JWT Tokens 是被加密并签名后的令牌。

它们并不对立 —— 相反，他们可以独立或结合使用。正确的对比应当是：`Session` 对比 `JWT`，以及 `Cookies` 对比 `Local Storage`。

在本文中，我将把 JWT Tokens 同 Session 展开对比，并偶尔对比 `Cookie` 和 `Local Storage`。这样的比较才有意义。

## JWT 坊间流传的优势

在人们安利 JWT 时，常常宣扬以下几点好处：

- 易于水平扩展
- 易于使用
- 更加灵活
- 更加安全
- 内置过期时间功能
- 无需询问用户「本网站使用 Cookies」
- 防止 CSRF 攻击
- 更适用于移动端
- 适用于阻止 Cookies 的用户

我将会逐条阐述以上观点为何是错误或误导性的，其中部分解释可能会有些模糊，这主要是因为这些「好处」的表述本身就比较模糊。你可以在文末找到我的联系方式，我将十分乐意对更加具体的「好处」进行分析阐述。

### 易于水平扩展？

这是列表中唯一一条在技术层面部分正确的「好处」，但前提是你使用的是无状态 JWT Tokens。然而事实上，几乎没人需要这种横向扩展能力。有很多更简单的拓展方式，除非你在运维像淘宝这样体量的系统，否则根本不需要无状态的会话（`Stateless sessions`）。

一些扩展有状态会话（`Stateful sessions`）的例子：

1. **在单台服务器上运行多个后端进程**：只需在此服务器上安装 Redis 服务用于存储 Session 即可。
2. **运行多台服务器**：只需一台专用的 Redis 服务器用于存储 Session 即可。
3. **在多集群内运行多台服务器**：会话保持（又称：粘滞会话）。

以上所有场景在现有软件系统内都具备良好的支持，你的应用需要进行特殊处理的可能性基本为零。

或许你在想，应当为你的应用预留更多调整空间，以防未来需要某些特殊操作。但实践告诉我们，以后再替换 Session 机制并不困难，唯一的代价是，在迁移后所有用户将被强制登出一次。我们没必要在前期实现 JWT，尤其是考虑到它所带来的负面影响。我将在后文进行解释。

### 易于使用？

这个真没有。你不得不自行处理 Session 的管理机制，无论是客户端还是服务端。然而标准的 `Session cookies` 则开箱即用，JWT 并没有更简单。

### 更加灵活？

我暂时还没看到有人成功地阐述「JWT 如何更加灵活」。几乎每个主流的 Session 实现，都允许你直接把数据存储进 Session，这跟 JWT 的机制并没有差别。据我所知，这只是个流行语罢了。如果你不同意，可以随时带上示例与我联系。

### 更加安全？

一大批人认为 JWT Tokens「更加安全」，理由是使用了加密技术。实际上，签名后的 Cookies 比未签名的 Cookies 同样更加安全，但这绝不是 JWT 独有的，优秀的 Session 实现均使用签名后的 Cookies（译者注：例如 Laravel）。

「使用加密技术」并不能神奇地使某些东西更加安全，它必须服务于特定目的，并且是针对该目的的有效解决方案。错误地使用加密反而可能会降低安全性。

另一个我听过很多次的对于「更加安全」的论述是「JWT 不使用 Cookies 传输 Tokens」。这实在是太荒谬了，Cookie 只不过是一条 HTTP 头信息，使用 Cookies 并不会造成任何不安全。事实上，Cookies 受到特别良好的保护，用于防止恶意的客户端代码。我将在后文进行阐述。

如果担心有人拦截掉你的 Session cookies，那你应当考虑使用 TLS。如果不使用 TLS，任何类型的 Session 机制都可能被拦截，包括 JWT。

### 内置过期时间功能？

无意义，又没什么卵用的特性。在服务端也能实现过期控制，有不少 Session 实现就是这么做的。实际上，服务端的过期控制更加合理，这样你的应用就可以清除不再需要的 Session 数据；若使用无状态 JWT Tokens 且依赖于它的过期机制，则无法执行此操作。

### 无需询问用户「本网站使用 Cookies」？

完全错误。并没有什么「Cookies 法律」—— 有关 Cookies 的各种法律实际上涵盖了任何类型「对某项服务的正常运行非严格必须的持久性 ID」，任何你能想到的 Session 机制都包括在内。

> 译者注：然鹅中国并没有。

简单来说：

- 若出于系统功能目的使用 Session 或 Token（例如：保持用户的登录态），那么无论怎样存储 Session 均无需征得用户同意。
- 若出于其他目的使用 Session 或 Token（例如：数据分析、追踪），那么无论怎样存储 Session 都需要询问用户是否允许。

### 防止 CSRF 攻击？

这个真·真没有。存储 JWT Tokens 的方式大概有两种：

- **存入 Cookie**：仍然易受 CSRF 攻击，还是需要进行特殊处理，保护其不受攻击。
- **其他地方，例如 Local Storage**：虽然不易受到 CSRF 攻击，但你的网站需要 JavaScript 才能正常访问；并且又引发了另一个完全不同，或许更加严重的漏洞。我将在后文详细说明。

预防 CSRF 攻击唯一的正确方法，就是使用 CSRF Tokens。Session 机制与此无关。

### 更适用于移动端？

毫无根据。目前所有可用的浏览器几乎都支持 Cookies，因此也支持 Session。同样，主流的移动端开发框架以及严谨的 HTTP 客户端库都是如此。这根本不是个问题。

### 适用于阻止 Cookies 的用户？

不太可能。用户通常会阻止任何意义上的持久化数据，而不是只禁止 Cookies。例如，Local Storage 以及任何能够持久化 Session 的存储机制（无论是否使用 JWT）。不管你出于多么简单的目的使用 JWT 都无济于事，这是另一个完全独立的问题了。另外，试图让身份认证过程在没有 Cookies 的情况下正常进行，基本没戏。

最重要的是，禁用掉所有 Cookies 的多数用户都明白这会导致身份认证无法使用，他们会单独解锁那些他们比较关心的站点。这并不是你 —— 一个 Web 开发者应当解决的问题。更好的方案是，向你的用户们详细地解释为何你的网站需要 Cookies 才能使用。

## JWT 的劣势

以上，我已经对常见的误解做了说明，以及为什么它们是错误的。你或许在想：「这好像也没什么大不了的，即便 JWT 无法带来任何好处，但也不会造成什么影响」，那你真是大错特错了。

使用 JWT 作为 Session 机制存在很多缺点，其中一部分会造成严重的安全问题。

### 更费空间

JWT Tokens 实际上并不「小」。尤其是使用无状态 JWT 时，所有的数据将会被直接编码进 Tokens 内，很快将会超过 Cookies 或 URL 的长度限制。你可能在想将它们存储到 Local Storage，然而...

### 更不安全

若将 JWT Tokens 存储到 Cookies 内，那么安全性与其他 Session 机制无异。但如果你将 JWT 存储至其它地方，会导致一个新的漏洞，详见[本文](https://web.archive.org/web/20171020083345/http://blog.prevoty.com:80/does-jwt-put-your-web-app-at-risk)，尤其是「Storing sessions」这一部分。

> 书接上回：Local Storage，一个 HTML5 内很棒的功能，使浏览器支持 Key/Value 存储。所以我们应当将 JWT Tokens 存储到 Local Storage 吗？考虑到这些 Tokens 可能越来越大，或许会很有用。Cookies 通常在 4k 左右的存储时比较占优势，对于较大的 Tokens，Cookies 可能无法胜任，而 Local Storage 或许成了明确的解决方案。然而，Local Storage 并没有提供任何类似 Cookies 的安全措施。
> LocalStorage 与 Cookies 不同，并不会在每次请求时发送存储的数据。获取数据的唯一方法是使用 JavaScript，这意味着任何攻击者注入的 JavaScript 脚本只需通过内容安全策略检查，就能任意访问或泄露数据。不光是这样，JavaScript 并不在意或追踪数据是否通过 HTTPS 发送。就 JavaScript 而言，它就只是个数据而已，浏览器会像操作其它数据一样来处理它。
> 在历代工程师们经历了各种麻烦之后，终于能够确保没有人可以恶意接触到我们的 Cookies，然而我们却试图忽略这些经验。这对我来说似乎是在退步。

简单来说，**使用 Cookies 并不是可选的**，无论你是否采用 JWT。

### 无法单独销毁

还有更多安全问题。不像 Sessions 无论何时都可以单独地在服务端销毁。无状态 JWT Tokens 无法被单独的销毁。根据 JWT 的设计，无论怎样 Tokens 在过期前将会一直保持有效。举个例子，这意味着在检测到攻击时，你却不能销毁攻击者的 Session。同样，在用户修改密码后，也无法销毁旧的 Sessions。

对此，我们几乎无能为力，除非重新构建复杂且有状态（`Stateful`）的基础设施来明确地检测或拒绝特定 Session，否则将无法结束会话。但这完全违背了使用无状态 JWT Tokens 的最初目的。

### 数据延迟

与上文的安全问题类似，还有另一个潜在的安全隐患。就像缓存，在无状态 Tokens 内存储的数据最终会「过时」，不再反映数据库内最新的数据。

这意味着，Tokens 内保留的可能是过期的信息，例如：用户在个人信息页面修改过的旧 URL。更严肃点讲，也可能是个具备 `admin` 权限的 Token，即使你已经废除了 `admin` 权限。因为无法销毁这些 Tokens，所以面对需要移除的管理员权限，除非关闭整个系统，别无他法。

### 实现库缺乏生产环境验证或压根不存在

你或许在想，以上的这些问题都是围绕着「无状态 JWT」展开的，这种说法大部分情况是对的。然而，使用有状态 Tokens 与传统的 Session cookies 基本上是等效的... 但却缺乏生产环境的大量验证。

现存的 Session 实现（例如适用于 Express 的 [express-session](https://github.com/expressjs/session)）已经被用于生产环境很多很多年，它们的安全性也经过了大量的改良。倘若使用 JWT 作为 Session cookies 的临时替代品，你将无法享受到这些好处，并且必须不断改进自己的实现（在此过程中很容易引入漏洞），或使用第三方的实现，尽管还没有在真实世界里大量应用。

> 译者注：实际上，Laravel Passport 便是使用类似「有状态 JWT」的方式来存储 OAuth Access Token。幸运的是，Passport 已经有不少实际应用，且不完全依赖于 JWT。

## 结论

无状态 JWT Tokens 无法被单独地销毁或更新，取决于你如何存储，可能还会导致长度问题、安全隐患。有状态 JWT Tokens 在功能方面与 Session cookies 无异，但缺乏生产环境的验证、经过大量 Review 的实现，以及良好的客户端支持。

除非，你工作在像 BAT 那样规模的公司，否则没什么使用 JWT 作为 Session 机制的理由。还是直接用 Session 吧。

## 所以... JWT 适合做什么？

在本文之初，我就提到 JWT 虽然不适合作为 Session 机制，但在其它方面的确有它的用武之地。该主张依旧成立，JWT 特别有效的使用例子通常是作为一次性的授权令牌。

引用 [JSON Web Token specification](https://tools.ietf.org/html/rfc7519)：

> JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. [...] enabling the claims to be digitally signed or integrity protected with a Message Authentication Code (MAC) and/or encrypted.

在此上下文中，「Claim」可能是一条「命令」，一次性的认证，或是基本上能够用以下句子描述的任何情况：

> 你好，服务器 B，服务器 A 告诉我我可以 < ...Claim... >，这是我的证据：< ...密钥... >。

举个例子，你有个文件服务，用户必须认证后才能下载文件，但文件本身存储在一台完全分离且无状态的「下载服务器」内。在这种情况下，你可能想要「应用服务器（服务器 A）」颁发一次性的「下载 Tokens」，用户能够使用它去「下载服务器（服务器 B）」获取需要的文件。

以这种方式使用 JWT，具备几个明确的特性：

- Tokens 生命期较短。它们只需在几分钟内可用，让客户端能够开始下载。
- Tokens 仅单次使用。应用服务器应当在每次下载时颁发新的 Token。所以任何 Token 只用于一次请求就会被抛弃，不存在任何持久化的状态。
- 应用服务器依旧使用 Sessions。仅仅下载服务器使用 Tokens 来授权每次下载，因为它不需要任何持久化状态。

正如以上你所看到的，结合 Sessions 和 JWT Tokens 有理有据。它们分别拥有各自的目的，有时候你需要两者一起使用。只是不要把 JWT 用作 **持久的、长期的** 数据就好。