# 跨域

> 首发于：2021-04-26

跨域CORS全称是"跨域资源共享"（Cross-origin resource sharing）是指一个域下的文档或脚本试图去请求另一个域下的资源。与跨域相对的就是同源，同源策略（SOP，Same Origin Policy）是指“协议+域名+端口”三者相同。如果没有同源策略，浏览器很容易受到 XSS、CSFR等攻击。

跨域需要浏览器和服务器同时支持，目前所有浏览器都支持该功能，IE浏览器不能低于IE10。

整个跨域的通信过程，都是浏览器自动完成的，不需要用户参与。对于开发者来说跨域通信与同源的AJAX通信没有区别，代码完全一样。浏览器一旦发现AJAX请求跨域，就会自动添加一些附加的头信息，有时还会多出一次附加请求，但用户不会有感觉。

因此，实现跨域通信的关键是服务器，只要服务器实现了跨域，就可以跨域通信。

## 实现跨域的几种方案

### JSONP

JSONP 就是利用 `<script>` 标签没有跨域限制的“漏洞”（这是历史遗留问题）来达到与第三方通讯的目的。JSONP的缺点就是只能实现 get 一种请求。

Nodejs 代码

```js
const http = require('http');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  const params = querystring.parse(req.url.split('?')[1]);
  const cb = params.callback;
  res.writeHead(200, { 'Content-Type': 'text/javascript' });
  res.write(cb + '(' + JSON.stringify(params) + ')');
  res.end();
});

server.listen(8888);
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  
</head>
<body>
  <script>
    function handleCb(res) {
      console.log(res); // {param1: "123", param2: "456", callback: "handleCb"}
    }
  </script>
  <script src="http://localhost:8888/test?param1=123&param2=456&callback=handleCb"></script>
</body>
</html>
```

### document.domain + iframe 跨域

此方案仅限主域相同，子域不同的跨域应用场景，为了在本地模拟一下这个场景，需要先使用 nginx 做一些配置：

```shell
# 先 配置一下系统（Mac）的 hosts
$ cd /etc
$ sudo vim host

# 给 hosts 中添加以下配置
127.0.0.1 www.domain.com
127.0.0.1 child.domain.com
```

```shell
# 修改 nginx 配置，配置好好记得重载
server {
	listen       80;
	server_name  www.domain.com;

	location / {
		root   html;
		index  index.html index.htm;
	}

	error_page   500 502 503 504  /50x.html;
	location = /50x.html {
		root   html;
	}
}
server {
	listen       80;
	server_name  child.domain.com;

	location / {
		root   html;
		index  index.html index.htm;
	}

	error_page   500 502 503 504  /50x.html;
	location = /50x.html {
		root   html;
	}
}
```

如果使用这个软件会更方便一些 SwitchHosts，下载地址 [https://swh.app](https://swh.app) ，另外还要管理好一些代理，比如Mac下，网络->高级->代理->忽略这些主机与域的代理设置。除此之外，记得重启浏览器，最好使用无痕模式。

创建一个 child.html，放到 nginx 的 www 目录下

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  
</head>
<body>
  child.com
  <script>
    console.log(window.parent.user)
  </script>
</body>
</html>
```

创建一个 parent.html，放到 nginx 的 www 目录下，然后访问 [http://www.domain.com/parent.html](http://www.domain.com/parent.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  
</head>
<body>
  <script>
    var user = 'admin';
  </script>
  <iframe src="http://child.domain.com/child.html"></iframe>
</body>
</html>
```

此时，打开控制台，你会发现是会有报错的

![](./image/pic1.awebp)

然后我们进行一下修改，强制把两个页面的 document.domain 改成一样的

```js
// 在两个 html 的 script 中都添加下面代码，就可以访问到数据了
// 如果不强制修改俩网址的 document.domain 分别为 www.domain.com child.domain.com
document.domain = 'domain.com';
```

![](./image/pic2.awebp)

### location.hash + iframe 跨域

a 网站与 b网站跨域，a 网站与 c 网站同域，三个页面之间利用 iframe 的 location.hash 传值，相同域之间直接使用 js 来通信。

a 网站嵌入 b 网站，b 网站嵌入 c 网站，c 网站与 a 网站同域，所以可以使用 window.parent.parent 获取到 a 网站的对象。这样 a 网站通过 hash 值的变化把数据传给了 b 网站，b 网站通过 hash 值变化把数据传给c 网站， c 网站可以把数据传给 a 网站，这就完成了两个跨域网站数据的双向传递。

hosts 配置

```shell
127.0.0.1 www.domain1.com
127.0.0.1 www.domain2.com
```

nginx.conf 配置

```shell
...
server_name  www.domain1.com;
...
server_name  www.domain2.com;
```

a 网站 a.html [http://www.domain1.com/a.html](http://www.domain1.com/a.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

</head>

<body>
  <iframe id="iframe" src="http://www.domain2.com/b.html" style="display:none;"></iframe>
  <script>
    var iframe = document.getElementById('iframe');

    // 向b.html传hash值
    setTimeout(function () {
      iframe.src = iframe.src + '#user=admin';
    }, 1000);

    // 开放给同域c.html的回调方法
    function onCallback(res) {
      alert('data from c.html ---> ' + res);
    }
  </script>
</body>

</html>
```

b 网站 b.html [http://www.domain2.com/b.html](http://www.domain2.com/b.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <iframe id="iframe" src="http://www.domain1.com/c.html" style="display:none;"></iframe>
  <script>
    var iframe = document.getElementById('iframe');

    // 监听a.html传来的hash值，再传给c.html
    window.onhashchange = function () {
      iframe.src = iframe.src + location.hash;
    };
  </script>
</body>

</html>
```

c 网站 c.html [http://www.domain1.com/c.html](http://www.domain1.com/c.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <script>
    // 监听b.html传来的hash值
    window.onhashchange = function () {
      // 再通过操作同域a.html的js回调，将结果传回
      window.parent.parent.onCallback('hello: ' + location.hash.replace('#user=', ''));
    };
  </script>
</body>

</html>
```

效果如下所示：

![](./image/pic3.awebp)


### window.name + iframe 跨域

Window.name 属性就是一个窗口的名称，name 值在不同页面甚至不同域名加载后依旧存在，并且可以支持最大 2MB 的大小。

首先加载跨域的 iframe b 页面，b 页面会对自身 window.name 进行设置，然后就该执行该 iframe 的 onlaod 事件了，第一次执行的时候，立马将 iframe 跳转到了 同域的代理网页上，这个代理网页加载完成后会第二次执行 iframe 的 onload 事件，因为此时的 iframe 里面是同域的代理网页，所以我们可以拿到 window.name， 拿到数据之后，把 iframe 进行销毁。

注意：如果 iframe 不是同域的，其 window.name 是拿不到的，会报错。

hosts 与 nginx.conf 的配置与前一章节相同。

a 网站 a.html [http://www.domain1.com/a.html](http://www.domain1.com/a.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>

</head>

<body>
  <script>
    var proxy = function (url, callback) {
      var state = 0;
      var iframe = document.createElement('iframe');

      // 加载跨域页面
      iframe.src = url;

      // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
      iframe.onload = function () {
        if (state === 1) {
          // 第2次onload(同域proxy页)成功后，读取同域window.name中数据
          callback(iframe.contentWindow.name);
          destoryFrame();

        } else if (state === 0) {
          // 第1次onload(跨域页)成功后，切换到同域代理页面
          iframe.contentWindow.location = 'http://www.domain1.com/proxy.html';
          state = 1;
        }
      };

      document.body.appendChild(iframe);

      // 获取数据以后销毁这个iframe，释放内存；这也保证了安全（不被其他域frame js访问）
      function destoryFrame() {
        iframe.contentWindow.document.write('');
        iframe.contentWindow.close();
        document.body.removeChild(iframe);
      }
    };

    // 请求跨域b页面数据
    proxy('http://www.domain2.com/b.html', function (data) {
      alert(data);
    });
  </script>
</body>

</html>
```

同域的代理网页面 proxy.html [http://www.domain1.com/proxy.html](http://www.domain1.com/proxy.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
</body>

</html>
```

b 网站 b.html [http://www.domain2.com/b.html](http://www.domain2.com/b.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <script>
    window.name = 'This is domain2 data!';
  </script>
</body>

</html>
```

效果如下图所示：

![](./image/pic4.awebp)

### window.postMessage 跨域

window.postMessage() 方法可以安全地实现跨源通信。window.postMessage() 方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全。

从广义上讲，一个窗口可以获得对另一个窗口的引用（比如 `targetWindow = window.opener`），然后在窗口上调用 `targetWindow.postMessage()` 方法分发一个  `MessageEvent` 消息。接收消息的窗口可以根据需要自由处理此事件。传递给 window.postMessage() 的参数（比如 message ）将通过消息事件对象暴露给接收消息的窗口。

window.postMessage() 方法一般来说跨域解决以下问题：

- 页面和其打开的新窗口的数据传递
- 多窗口之间消息传递
- 页面与嵌套的 iframe 消息传递
- 上面三个场景的跨域数据传递

window.postMessage(data, origin)方法接受两个参数：

- data： html5规范支持任意基本类型或可复制的对象，但部分浏览器只支持字符串，所以传参时最好用JSON.stringify()序列化。
- origin： 协议+主机+端口号，也可以设置为"*"，表示可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"。

a 网站 a.html [http://www.domain1.com/a.html](http://www.domain1.com/a.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <iframe id="iframe" src="http://www.domain2.com/b.html" style="display:none;"></iframe>
  <script>
    var iframe = document.getElementById('iframe');
    iframe.onload = function () {
      var data = {
        name: 'aym'
      };
      // 向domain2传送跨域数据
      iframe.contentWindow.postMessage(JSON.stringify(data), 'http://www.domain2.com');
    };

    // 接受domain2返回数据
    window.addEventListener('message', function (e) {
      alert('data from domain2 ---> ' + e.data);
    }, false);
  </script>
</body>

</html>
```

b 网站 b.html [http://www.domain2.com/b.html](http://www.domain2.com/b.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <script>
    // 接收domain1的数据
    window.addEventListener('message', function (e) {
      alert('data from domain1 ---> ' + e.data);

      var data = JSON.parse(e.data);
      if (data) {
        data.number = 16;

        // 处理后再发回domain1
        window.parent.postMessage(JSON.stringify(data), 'http://www.domain1.com');
      }
    }, false);
  </script>
</head>

<body>
  domain2
</body>

</html>
```

### 跨域资源共享（CORS）

普通跨域请求：只服务端设置Access-Control-Allow-Origin即可，前端无须设置，若要带cookie请求：前后端都需要设置。

需注意的是：由于同源策略的限制，所读取的cookie为跨域请求接口所在域的cookie，而非当前页。如果想实现当前页cookie的写入，请看后面章节。

前端代码 a 网站 a.html [http://www.domain1.com/a.html](http://www.domain1.com/a.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <script>
    const xhr = new XMLHttpRequest(); // IE8/9需用window.XDomainRequest兼容

    // 前端设置是否带cookie
    xhr.withCredentials = true;

    xhr.open('post', 'http://www.domain2.com:8888', false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('user=admin');

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        alert(xhr.responseText);
      }
    };
  </script>
</body>

</html>
```

后端 nodejs 代码

```js
const http = require('http');
const server = http.createServer();
const qs = require('querystring');

server.on('request', function (req, res) {
  let postData = '';
  
  // 数据块接收中
  req.addListener('data', function (chunk) {
    postData += chunk;
  });

  // 数据接收完毕
  req.addListener('end', function () {
    postData = qs.parse(postData);
    // 跨域后台设置
    res.writeHead(200, {
      'Access-Control-Allow-Credentials': 'true', // 后端允许发送Cookie
      // 允许访问的域（协议+域名+端口），如果此项为 * 那么前端设置xhr.withCredentials = true 请求将失败
      'Access-Control-Allow-Origin': 'http://www.domain1.com', 
      /* 
       * 此处设置的cookie还是domain2:8888的而非domain1，因为后端也不能跨域写cookie(nginx反向代理可以实现)，
       * 但只要domain2:8888中写入一次cookie认证，后面的跨域接口都能从domain2:8888中获取cookie，从而实现所有的接口都能跨域访问
       */
      'Set-Cookie': 'l=a123456;Path=/;Domain=www.domain2.com:8888;HttpOnly', // HttpOnly的作用是让js无法读取cookie
    });

    res.write(JSON.stringify(postData));
    res.end();
  });
});

server.listen(8888);
```

### 代理跨域

代理跨域使用 Nginx 来代理，也可以使用 nodejs 来代理，其原理是相同的。推荐使用 nginx 代理，简单高效。

#### nginx 配置解决 iconfont 跨域

浏览器跨域访问js、css、img等常规静态资源被同源策略许可，但iconfont字体文件(eot|otf|ttf|woff|svg)例外，此时可在nginx的静态资源服务器中加入以下配置。

```shell
location / {
  add_header Access-Control-Allow-Origin *;
}
```

#### nginx 反向代理接口跨域

```shell
server {
	listen       81;
	server_name  www.domain1.com;

	location / {
		proxy_pass   http://www.domain2.com:8888; #反向代理
		proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
		root   html;
		index  index.html index.htm;
		# 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
		add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
		add_header Access-Control-Allow-Credentials true;
}

	error_page   500 502 503 504  /50x.html;
	location = /50x.html {
		root   html;
	}
}
```

nodejs 代码

```js
const http = require('http');
const server = http.createServer();
const qs = require('querystring');

server.on('request', function (req, res) {
  let postData = '';
  
  // 数据块接收中
  req.addListener('data', function (chunk) {
    postData += chunk;
  });

  // 数据接收完毕
  req.addListener('end', function () {
    postData = qs.parse(postData);
    // 跨域后台设置
    res.writeHead(200, {
      'Set-Cookie': 'l=a123456;Path=/;Domain=www.domain2.com;HttpOnly', // HttpOnly的作用是让js无法读取cookie
    });

    res.write(JSON.stringify(postData));
    res.end();
  });
});

server.listen(8888);
```

前端代码

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <script>
    const xhr = new XMLHttpRequest(); // IE8/9需用window.XDomainRequest兼容

    // 前端设置是否带cookie
    xhr.withCredentials = true;

    xhr.open('post', 'http://www.domain1.com:81', false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('user=admin');

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        alert(xhr.responseText);
      }
    };
  </script>
</body>

</html>
```

### WebSocket 协议跨域

WebSocket protocol 是 HTML5 一种新的协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，是 server push 技术的一种很好的实现。

Nodejs 代码

```js
// npm i ws -S 安装
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('ws on 8080');

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    ws.send('server response: ' + message);
    console.log('received: %s', message);
  });
});
```

前端代码 a 网站 a.html [http://www.domain1.com/a.html](http://www.domain1.com/a.html)

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <script>
    var ws = new WebSocket('ws://127.0.0.1:8080');
    ws.addEventListener('open', function (event) {
      ws.send('Hello Server!');
    });
    ws.onmessage = function (evt) {
      console.log("Received Message: " + evt.data);
      ws.close();
    };

    ws.onclose = function (evt) {
      console.log("Connection closed.");
    };
  </script>
</body>

</html>
```
