# Nginx——正向代理、反向代理

> 首发于：2020-11-15

## Nginx 的安装配置和使用（Mac）

```sh
# 更新 brew 的镜像地址
$ cd "$(brew --repo)"
$ git remote set-url origin https://mirrors.ustc.edu.cn/brew.git
$ cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
$ git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git

# 输入之后 cmd 窗的标题会一直闪，持续几分钟直到更新完毕
$ brew update

# 搜索一下自己是否安装过 nginx
$ brew search nginx

# 如果安装过，那么就升级
$ brew upgrade nginx

# 查看 nginx 的一些信息
$ brew info nginx

# 如果没有安装过，那么就安装
$ brew install nginx

# 安装完成后会有一些 nginx 的信息，一般来说，下面命令可以打开 nginx 的目录
# 此目录下的 nginx.conf 文件就是 nginx 的配置文件
$ open /usr/local/etc/nginx/

# 下面命令可以打开 nginx 安装的真正目录
$ open /usr/local/Cellar/nginx

# 下面是放网页文件的目录
$ open /usr/local/var/www

# 运行 nginx
$ nginx

# 停止运行 nginx
$ nginx -s stop

# 退出
$ nginx -s quit

# 测试配置文件有无错误
$ nginx -t

# 重新加载配置
$ nginx -s reload

# 重启 nginx
$ nginx -s reopen
```
## 配置文件的基本指令

### worker_processes

工作进程数，默认为 1，最好按照 CPU 核心数进行配置，可以最大化的利用好系统资源。进程数配置每增加一个，进程里面每次就会多启一个进程。

比如：当前服务器是 8 核心的CPU，那么就可以配置：

```sh
work_processes 8;
```

### worker_connections

每个工作进程允许的最大连接数。默认为 1024。

```sh
events {
    worker_connections  1024;
}
```

### server_name

用于设置虚拟主机服务名称。实际应用中会根据 server_name 的配置来确定给前端返回什么，比如下面这个配置的例子：

```sh
server {
    listen       8080;
    server_name  127.0.0.1;

    location / {
        root   html;
        index  index.html index.htm;
    }
}

server {
    listen       8080;
    server_name  localhost;

    location / {
        default_type text/plain;
        return 200;
    }
}
```

如果访问 `http://127.0.0.1:8080` 那么会返回一个 nginx 标志性的 index 界面。

如果访问 `http://localhost:8080` 那么只会返回一个空白界面，状态码为 200。

server_name 的匹配方式有三种：

#### 精确匹配

server_name 精确匹配可以配置一个或多个，多个用空格隔开即可。

```sh
server {
   server_name www.abc.com www.bcd.com;
}
```

#### 通配符

\* 可以指代任意字符。

```sh
server {
    server_name *.abc.com www.bcd.*;
}
# 错误示例
server {
    server_name www.*.com www.bcd.c* w*.abc.com;
}
```

#### 正则匹配

关于正则是什么不在此赘述了，下面是一个配置的例子：

```sh
server {
    server_name ~^www\.\w+\.com;
}
```

注：“~” 用于标识这是一个正则表达式。

#### 匹配执行顺序

精确匹配成功 > 通配符在开始时匹配成功 > 通配符在结束时匹配成功 > 正则表达式匹配成功 > 被 default_server 匹配成功

### location

设置请求的 URI，支持多种方式匹配，`location [ = | ~ | ~* | ^~ | @]uri{...}`。

如果配置 `/abc` 那么 `/abc` 、`/abc/`、`/abcd` 等以其开头的 URI 都可以匹配。

如果配置 `=/abc`，那么就只能匹配 `/abc` 了。

`~`、`~*` 都是正则表达式的标识，不过 `~` 大小写敏感，`~*` 大小写不敏感。

`^~` 是用在非正则表达式前面的，与不加 `^~` 所以代表的 URI 一致，但是如果在此匹配到了 URI 之后就不会向后继续匹配了。

`@`，命名 location，可用来做内部重定向。

### root 与 alias

root 与 alias 都是设置请求资源的目录。

```sh
location / {
    root path
}
location / {
    alias path
}
```

不同的是：

root 生成的路径是：root 路径 + location 路径

alias 生成的路径是：用 alias 路径替换 location路径

### index

设置网站的默认首页。下面是一个默认配置，从左向右依次匹配，匹配到就结束匹配直接返回。

````sh
location / {
    root   html;
    index  index.html index.htm;
}
````

### error_page

用于指定错误时应该跳转的界面，语法 `error_page code[ =response] path`，code 可以是多个。

```sh
error_page   500 502 503 504  /50x.html;
# 把 404 状态码修改为 200，注意前后的空格
error_page   404 =200  /50x.html;
```

@ location 方式指定跳转位置

```sh
error_page 404 @jump_to_errorpage;
location @jump_to_errorpage {
    default_type text/plain;
    return 404 "Not Found";
}
```

## 正向代理

### 什么是正向代理

正向代理就是在我们想访问某个服务器资源的时候（但是客户端表面上看是直接访问的服务端）不直接访问，而是通过一个代理服务器帮你访问这个服务器的资源，然后返回给你。

在这个过程中，客户端其实是知道服务端 IP、域名等信息的，但是服务端无法直接知道是哪个客户端访问了他，服务端能直接知道的就是代理服务器访问了他。

![](./image/pic1.png)

### 正向代理的典型应用

正向代理最常见的三个典型应用：

1. 科学上网，比如：由于众所周知的缘故，我们无法直接访问到谷歌，但是我们有这样一台服务器，他既能访问谷歌，我们又能够访问到他，这样他就可以做一个正向代理，借助他我们就可以科学上网了。
2. 游戏加速器。
3. 对我们的访问进行校验，比如：公司内网无法直接访问外面，但是开个代理就可以了，不过这个代理在帮我们转发请求之前也会校验我们要访问的内容是否是公司允许的。

![](./image/pic3.png)

### Nginx 配置正向代理实例

#### Step 1 用 Node 搭建一个简单的 Web 服务器

Node 搭建的简单 Web 服务器如下：

```js
const http = require('http');

http.createServer((request, respose) => {
  const realIP = request.headers['x-real-ip'];
  if (realIP) {
    respose.writeHead(200);
    respose.end(`Request from nginx and real IP is: ${realIP}.`);
  } else {
    respose.writeHead(200);
    respose.end('Direct request from the browser.');
  }
}).listen(3000);
```

可以使用 `http://192.168.31.39:3000` （192.168.31.39 是本机局域网 IP 地址，localhost 可能会导致后面不走代理）来访问直接这个服务，页面就会显示 `Direct request from the browser.`。在使用代理访问的时候我们会给他设置一个头字段 `x-real-ip` 以区分是通过代理进行的访问。

![](./image/pic5.webp)

#### Step 2 配置 Nginx

在 `nginx.conf` 中增加如下配置：

```sh
server {
    listen       82;
    resolver 8.8.8.8;
    proxy_set_header X-Real-IP $remote_addr;
    
    location / {    
        proxy_pass http://$http_host$request_uri;
    }
}
```

配置完记得 reload。

解释一下上面的配置：

- `listen` 指正向代理服务器监听的端口，我们一会配置浏览器代理的时候就是用这个端口，82 这个端口也可以其他可用端口
- `resolver` 是设置 DNS 的 IP，用来解析 proxy_pass 中的域名
- `proxy_set_header` 是为所有经过此服务的请求的头都加一个 `x-real-ip` 字段，这里是为了方便看效果，实际应用中不一定需要
- `proxy_pass` 是指被代理到什么地址去，`$http_host` 是请求的域名和端口，如果端口是默认的 80 端口也可以使用 `$host`，`$host` 是请求信息中的 Host 值，`$request_uri` 是请求的 URI，带参数，不包含主机名

如果把 `proxy_pass` 配置为一个固定的地址，比如：`http://www.baidu.com` ，那么所有经过这个代理的请求都将会变成访问百度。

#### Step 3 配置浏览器代理

在 Mac 中，打开”系统偏好设置 -> 网络“，选择当前使用的网络，然后点”高级“，选择 ”代理“ 页签，配置”网页代理(HTTP)“为 `127.0.0.1:82`（根据自己的实际情况配置）。

![](./image/pic6.webp)

**注意**：把”忽略这些主机与域的代理设置“清空。

再次访问效果图如下：

![](./image/pic7.webp)

## 反向代理

### 什么是反向代理


反向代理与正向代理相反，在我们想让客户端访问我们自己的某个服务器资源的时候，让客户端并不能直接访问到我们服务器上的资源，而是让客户端访问到代理服务器，然后代理服务器再决定给客户端返回哪个服务器上的资源。

在这个过程中，客户端根本不知道自己访问的资源到底放在哪个服务器上，但是代理服务器可以告诉服务器哪个客户端在访问他。

![](./image/pic2.png)

### 反向代理的典型应用

反向代理最常见的两个典型应用：

1. 根据客户端发送的不同请求，来协调具体由哪个服务器来响应这个服务，此时各个服务器可能是不一样的。
2. 做负载均衡，根据各个服务器配置的权重来决定现在应该访问哪个服务器，这样就可以降低单个服务器的负载压力。

![](./image/pic4.png)

### Nginx 配置反向代理

#### Step 1 用 Node 搭建多个 Web 服务器

Node 搭建三个 Web 服务器如下：

```js
// createMyServer.js
const http = require('http');

function createMyServer(port) {
  http.createServer((request, respose) => {
    if (request.headers.origin === '192.168.31.39:8080') {
      respose.writeHead(200);
      respose.end(`This is ${port}.`);
    } else {
      respose.writeHead(401);
      respose.end('Direct access is not allowed.');
    }
  }).listen(port);
}
module.exports = createMyServer;
```

```js
// server1.js
const createMyServer = require('./createMyServer');

createMyServer(3000);
```

```js
// server2.js
const createMyServer = require('./createMyServer');

createMyServer(3001);
```

```js
// server3.js
const createMyServer = require('./createMyServer');

createMyServer(3002);
```

这里为了模拟一个 Web 服务器无法直接访问的效果，所以我们简单处理了一下，无法使用如果我们直接访问，只能通过我们后面配置的 Nginx 进行跳转，直接访问效果如下：

![](./image/pic8.webp)

#### Step 2 配置 Nginx

##### 场景一：根据业务选择对应服务器进行响应

在 `nginx.conf` 中增加如下配置：

```sh
server {
    listen       8080;
    server_name  localhost;
    proxy_set_header Origin $http_host;

    location /server1 {
        proxy_pass http://192.168.31.39:3000;
    }
    location /server2 {
        proxy_pass http://192.168.31.39:3001;
    }
    location /server3 {
        proxy_pass http://192.168.31.39:3002;
    }
}
```

这样配置之后经过 Nginx 代理之后 header 上将被加入 `origin` 字段，访问不同的 URI 将会得到不同的服务器的响应。

访问效果如下图所示：

![](./image/pic9.webp)

##### 场景二：负载均衡

负载均衡算法有多种：

- 轮询，挨个轮流访问每个服务器
- 权重，每个服务器都会被加一个权重（weight），默认为1，值越大权重就越重
- ip_hash，每个客户端分配一个固定的服务器进行处理
- url_hash，相同的 URL 会被分配到相同的服务器去进行处理
- least_conn，客户端会连接当前连接数最少的服务器
- fair，一个第三方提供的智能负载均衡模块，需要另外安装

下面来说一下轮询，轮询其实是一种特殊的加权轮询负载均衡，相当于其每个服务器权重都为1。

在 `nginx.conf` 中增加如下配置：

```sh
upstream myServers {
    server 192.168.31.39:3000;
    server 192.168.31.39:3001;
    server 192.168.31.39:3002;
}
server {
    listen       8080;
    server_name  localhost;
    proxy_set_header Origin $http_host;

    location /server {
        proxy_pass http://myServers;
    }
}
```

这样配置之后的效果就是每次访问都会依次切换服务器。

再来看一下加权轮询：

```sh
upstream myServers {
    server 192.168.31.39:3000 weight=10;
    server 192.168.31.39:3001 weight=5;
    server 192.168.31.39:3002 weight=1;
}
server {
    listen       8080;
    server_name  localhost;
    proxy_set_header Origin $http_host;

    location /server {
        proxy_pass http://myServers;
    }
}
```

这样配置之后的效果就是 3000 端口这个服务会被最多访问，其次是 3001，而 3002 出现得最少。

解释一下配置项：

- upstream 是固定写法，代表一个服务器的集合
- myServers 则是我自己随便起的一个名字，为某一个服务器集合命名，以方便后面使用
- weight 是权重

##### 场景三：关于重定向的一些处理

有时候我们的服务器可能会做一些重定向的操作，比如：登录、注销或者出现一些错误，但是重定向之后可能整个路径都变了，这就直接把我们的服务器的地址暴露给客户端了，我们很可能不期望这个情况发送，因为反向代理有一个作用就是要**隔离客户端与真实的服务端**。

下面举个例子演示一下：

首先，创建一个服务器，返回之后直接重定向，模拟登录、注销或者出现一些错误重定向的情况。

```js
// server4.js
const http = require('http');

http.createServer((request, respose) => {
  respose.writeHead(302, { Location: 'http://192.168.31.39:3005/' });
  respose.end();
}).listen(3004);
```

创建我们重定向的服务器。

```js
// server5.js
const http = require('http');

http.createServer((request, respose) => {
  respose.writeHead(200);
  respose.end('I am 3005');
}).listen(3005);
```

如果，我们什么也不做，那么 `http://192.168.31.39:3005/` 这个服务器的地址就会直接暴露。

下面我们使用 `proxy_redirect` 来对上面这种情况进行一些处理。

在 `nginx.conf` 中增加如下配置：

```sh
server {
    listen       8081;
    server_name  localhost;

    location / {
        proxy_pass http://192.168.31.39:3004;
        proxy_redirect http://192.168.31.39:3005 http://192.168.31.39:8081/redirect;
    }

    location /redirect {
        proxy_pass http://192.168.31.39:3005;
    }
}
```

访问 `http://192.168.31.39:8081/` 可以看到效果如下图：

![](./image/pic10.webp)

`proxy_redirect` 的第一个参数是 `redirect` 也就是我们要重定向的真实位置，第二个参数是 `replacement` 是用来替换真实位置的地址。这个地址把真实地址代理一下就可以了。
