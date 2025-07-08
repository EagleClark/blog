# 缓存

> 首发于：2021-04-28

## 在浏览器出入一个网址

![](./image/pic1.webp)

## DNS 缓存

DNS 就是 Domain Name System，即域名系统。

通常我们在上网的时候都是输入的域名，然而我们建立 TCP 连接需要的却是 IP，所以我们就需要 DNS 解析，将域名解析成 IP。

DNS 解析过程会进行递归查询，分别依次尝试以下途径，按顺序获取域名对应的 IP 地址：

- 浏览器缓存
- 系统缓存（用户操作系统 Hosts 文件 DNS 缓存）
- 路由器缓存
- 互联网服务提供商 DNS 缓存（联通、移动、电信等互联网服务提供商的 DNS 缓存服务器）
- 根域名服务器
- 顶级域名服务器
- 主域名服务器

DNS 解析过程会根据上述步骤进行递归查询，如果当前步骤没有查到，则自动跳转到下一步骤，通过下一个 DNS 服务器进行查找。如果最终依然没有找到，浏览器就会显示页面打开失败。

## CDN 缓存

CDN 是 Content Delivery Network，即内容分发网络。

CDN 会在 DNS 解析的过程中“插上一脚”，DNS 解析可能会给出 CDN 服务器的 IP 地址，这样你拿到的就会是 CDN 服务器而不是目标网站的实际地址。

因为 CDN 会缓存网站的大部分资源，比如图片、CSS 样式表，所以有的 HTTP 请求就不需要再发到目标网站，CDN 就可以直接响应你的请求，把数据发给你。由 PHP、Java 等后台服务动态生成的页面属于“动态资源”，CDN 无法缓存，只能从目标网站获取。于是你发出的 HTTP 请求就要开始在互联网上的“漫长跋涉”，经过无数的路由器、网关、代理，最后到达目的地。

## 前端缓存

本文所说的 HTTP 缓存主要是指 HTTP 请求时用到的缓存，服务端和客户端都可以控制，不过主要是服务端控制，浏览器缓存则是由前端开发的时候去设置的些缓存。

### HTTP 缓存

#### 缓存资源去向

##### Memory Cache

Memory Cache 是内存缓存，就是将资源缓存到内存中，等待下次访问时不需要重新下载资源，而直接从内存中获取。Webkit 早已支持 memory cache。
目前 Webkit 资源分成两类，一类是主资源，比如HTML页面，或者下载项，一类是派生资源，比如HTML页面中内嵌的图片或者脚本链接，分别对应代码中两个类：MainResourceLoader 和 SubresourceLoader。虽然Webkit支持memory cache，但是也只是针对派生资源，它对应的类为 CachedResource，用于保存原始数据（比如CSS，JS等），以及解码过的图片数据。

##### Disk Cache

Disk Cache 顾名思义，就是将资源缓存到磁盘中，等待下次访问时不需要重新下载资源，而直接从磁盘中获取，它的直接操作对象为 CurlCacheManager。

|          | Memory Cache                       | Disk Cache                        |
| -------- | ---------------------------------- | --------------------------------- |
| 相同点   | 只能存储一些派生类资源文件         | 只能存储一些派生类资源文件        |
| 不同点   | 退出进程时数据会被清除             | 退出进程时数据不会被清除          |
| 存储资源 | 一般脚本、字体、图片会存在内存当中 | 一般非脚本会存在内存当中，如css等 |

因为 CSS 文件加载一次就可渲染出来，我们不会频繁读取它，所以它不适合缓存到内存中，但是 js 之类的脚本却随时可能会执行，如果脚本在磁盘当中，我们在执行脚本的时候需要从磁盘取到内存中来，这样 IO 开销就很大了，有可能导致浏览器失去响应。

![](./image/pic2.awebp)

#### HTTP 缓存使用流程

![](./image/pic3.awebp)

#### 强缓存

浏览器在加载资源时，判断是否命中强缓存，强缓存主要就是指的 Cache-Control 和 Expires。

##### Cache-Control

Headers 中的 Cache-Control 字段有很多取值：

- max-age=n 是最常用的，标记资源有效期，响应报文创建时间（非客户端收到报文时间）起，n 秒内有效。max-age=0 和 no-cache 基本可以等同。
- no-store 不允许缓存，用于某些变化非常频繁的数据，例如秒杀页面
- no-cache 它的字面含义容易与 no-store 混淆，实际意思并不是不允许缓存，而是可以缓存，但是在使用之前必须要去服务器验证是否过期，是否有最新版本
- must-revalidate 又是一个和 no-cache 相似的词，它的意思是如果缓存不过期就可以继续使用，但是过期了如果还想使用就必须去服务器验证。
- public：可以被所有的用户缓存，包括终端用户和 CDN 等中间代理服务器。
- private：只能被终端用户的浏览器缓存，不允许 CDN 等中继缓存服务器对其缓存。

Nginx 配置

```shell
location / {
	root   html;
	index  index.html index.htm;
	add_header Cache-Control no-store;
	# add_header Cache-Control no-cache;
	# add_header Cache-Control max-age=31536000;
}
```

##### Expires

该字段是 HTTP1.0 时代的规范，它的值为一个绝对时间的 GMT 格式的时间字符串，比如：

```
Expires: Mon, 26 Apr 2021 16:57:55 GMT
```

这个时间代表这个资源失效的时间，在此时间之前，即命中缓存。这种方式有一个明显的缺点，由于失效时间是一个绝对时间，所以当服务器与客户端时间偏差较大时，就会导致缓存混乱。现在的浏览器均默认使用 HTTP1.1，所以它的作用基本忽略。而且 Cache-Control 的优先级也会更高。

#### 协商缓存

当强缓存没有命中的时候，浏览器会发送一个请求到服务器，服务器根据 header 中的信息来判断是否命中缓存，如果命中，则返回304 Not Modified，告诉浏览器资源未更新，可以使用本地缓存。

请求头一共有5种字段：If-Modified-Since、If-None-Match、If-Unmodified-Since、If-Match、If-Range。

最常用的字段是 Last-Modified / If-Modified-Since、Etag / If-None-Match，且后者优先级更高。

##### Last-Modified / If-Modified-Since

Last-Modified 即文件的最后修改时间。是服务器响应请求时返回给客户端的，在 Response Headers 中。

If-Modified-Since 则是客户端再次发起该请求时携带的（在 Request Headers 中）上次请求返回的 Last-Modified 值，通过此字段值告诉服务器该资源上次请求返回的最后修改时间。服务器收到该请求后发现含有 If-Modified-Since 字段，则会根据 If-Modified-Since 的字段值与该资源在服务器的最后被修改时间做对比，若服务器的资源最后修改时间大于 If-Modified-Since 字段的值，则重新返回资源，状态码200，否则返回304，代表资源未更新，可继续使用缓存。

Last-Modified 的缺点：

1. 如果服务器的资源是周期性变化的，如果这个资源在一个周期内修改回原来的样子了，我们认为还是可以使用缓存的，但是 Last-Modified 已经发生了变化，因此就需要 Etag 进行进一步优化。
2. 如果一个文件在一秒内被修改了多次，但是 Last-Modified 时秒级的，所以这一秒内的新版本无法区分。

##### Etag / If-None-Match

Etag 是 Entity Tag（实体标签）的缩写，是由服务器生成的资源的一个唯一标识，主要用来解决修改时间无法准确区分文件变化的问题，使用 Etag 就可以精确地识别资源的变动情况，让浏览器能够更有效地利用缓存。

Etag 是服务器响应请求时返回的，在 Response Header 中。If-None-Match 是客户端再次发起该请求时，携带上次请求返回的 Etag 值，通过此字段值告诉服务器该资源上次请求返回的 Etag 值。服务器收到后，发现该请求头中含有 If-None-Match，则会根据 If-None-Match 的字段值与该资源在服务器的 Etag 值做对比，一致则返回304，代表资源无更新，继续使用缓存文件；不一致则重新返回资源文件，状态码为200。

Etag 还需要分强 Etag 和弱 Etag。强 Etag 要求资源在字节级别必须完全相符，弱 Etag 在值前面有个 "W/" 标记，只要求资源在语义上没有变化，但内部可能会有部分发生了改变（例如 HTML 里的标签顺序调整，或者多了几个空格）。

### 浏览器缓存

#### Cookie

Cookie主要用于用户信息的存储，Cookie 的内容可以自动在同源请求的时候被传递给服务器，容量为 4 KB。同一个网站同一浏览器共享此数据，不同页签之间访问的是同一份数据。

```js
document.cookie // 可以读取当前网页的 cookie 的 JSON 字符串
document.cookie = "key=value;path=path;domain=domain" // 可以追加一条 cookie 信息，一次只能对一条信息进行设置或者更新
```

#### LocalStorage

Web Storage 的 一种，LocalStorage 的数据将一直保存在浏览器内，直到用户清除浏览器缓存数据为止，容量为 5 MB。同一个网站同一浏览器共享此数据，不同页签之间访问的是同一份数据。

```js
localStorage.setItem(key, value);
localStorage.getItem(key);
localStorage.removeItem(key);
localStorage.clear();
```

#### SessionStorage

Web Storage 的 一种，SessionStorage 的其他属性同 LocalStorage，只不过它的生命周期同标签页的生命周期，当标签页被关闭时，SessionStorage 也会被清除，容量为 5 MB。同一个网站同一浏览器并不共享此数据，不同页签之间访问的不是同一份数据。

```js
SessionStorage.setItem(key, value);
SessionStorage.getItem(key);
SessionStorage.removeItem(key);
SessionStorage.clear();
```

#### Web SQL

Web SQL 数据库 API 并不是 HTML5 规范的一部分，但是它是一个独立的规范，引入了一组使用 SQL 操作客户端数据库的 APIs。

Web SQL 数据库可以在最新版的 Safari, Chrome 和 Opera 浏览器中工作，基本都是通过嵌入 SQLite 数据库实现的。

openDatabase() 方法打开/创建数据库

```js
// 参数：数据库名称、版本号、描述文本、数据库大小、创建回调
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
```

transaction() 方法控制一个事务执行

executeSql() 方法执行 SQL 查询

```js
db.transaction(function (tx) {  
   tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)');
});
```

#### IndexedDB

IndexedDB 是一种底层 API，用于在客户端存储大量的结构化数据（也包括文件/二进制大型对象（blobs））。该 API 使用索引实现对数据的高性能搜索。虽然 Web Storage 在存储较少量的数据很有用，但对于存储更大量的结构化数据来说力不从心。而 IndexedDB 提供了这种场景的解决方案。

通俗地说，IndexedDB 就是浏览器提供的本地数据库，它可以被网页脚本创建和操作。IndexedDB 允许储存大量数据，提供查找接口，还能建立索引。这些都是 LocalStorage 所不具备的。就数据库类型而言，IndexedDB 不属于关系型数据库（不支持 SQL 查询语句），更接近 NoSQL 数据库。

IndexedDB 具有以下特点。

1. 键值对储存。 IndexedDB 内部采用对象仓库（object store）存放数据。所有类型的数据都可以直接存入，包括 JavaScript 对象。对象仓库中，数据以"键值对"的形式保存，每一个数据记录都有对应的主键，主键是独一无二的，不能有重复，否则会抛出一个错误。
2. 异步。 IndexedDB 操作时不会锁死浏览器，用户依然可以进行其他操作，这与 LocalStorage 形成对比，后者的操作是同步的。异步设计是为了防止大量数据的读写，拖慢网页的表现。
3. 支持事务。 IndexedDB 支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，数据库回滚到事务发生之前的状态，不存在只改写一部分数据的情况。
4. 同源限制 IndexedDB 受到同源限制，每一个数据库对应创建它的域名。网页只能访问自身域名下的数据库，而不能访问跨域的数据库。
5. 储存空间大 IndexedDB 的储存空间比 LocalStorage 大得多，一般来说不少于 250 MB，甚至没有上限。
6. 支持二进制储存。 IndexedDB 不仅可以储存字符串，还可以储存二进制数据（ArrayBuffer 对象和 Blob 对象）。

具体 API 可以参考 [IndexedDB - Web API 接口参考 | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)

#### Application Cache

Application Cache 是应用程序缓存，在 HTML5 之前，我们需要接入网络才能访问，这毫无疑问是网站多次请求服务器，造成速度变慢，对于 PC 用户，网络相对比较稳定，载入速度也不会差太多。但是移动端呢？移动端依赖无线信号、依赖信号塔、位置不固定、受附近建筑影响等。一系列导致网络的不稳定，我们不能改变用户，也不能放弃网络较慢的用户。
还有，在混合app领域，经常使用内置 webview 加载 html 页面，如果网速太慢，依然会造成上述问题。

实际开发中，主要是使用Application Cache和LocalStorage技术，它们来自HTML5技术。

- Application Cache：通常用于静态资源（静态页面）的缓存。
- LocalStorage：通常用于AJAX请求缓存，存储非关键性AJAX数据。

#### PWA(Progressive Web App）

PWA（Progressive Web App），渐进式网页应用，Cache API 是一套搭配 PWA service worker 赋能的存储机制，来实现请求数据离线功能。与 application Cache 相似，提供了力度极细的存储控制能力，内容完全由脚本控制。常在 service worker 中搭配 Fetch 使用，且同一个 URL 不同 header 可以存储多个 Response。不提供跨域共享，且与HTTP缓存完全隔离。

#### BFCache

往返缓存，Back-Forward Cache，是浏览器在前进后退按钮上为了提升历史页面的渲染速度的一种策略。该策略具体表现为，当用户前往新页面时，将当前页面的浏览器DOM状态保存到 BFCache中；当用户点击后退按钮的时候，将页面直接从 BFCache中加载，节省了网络请求的时间。
