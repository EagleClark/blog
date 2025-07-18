# Node.JS 性能调优

> 首发于：2020-10-25

## HTTP服务性能测试

### 压力测试工具

#### ab

由Apache公司开发

首先使用nodejs搭建一个简单的web服务器，node代码 httpserver.js 如下：

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
    respose.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'))
}).listen(3000)
```

html代码 index.html 如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    Hello Geekbang!
</body>
</html>
```

启动服务之后输入如下命令进行测试：

```sh
EagleMacBookPro:~ eagleye$ ab -c200 -n1600 http://127.0.0.1:3000/
This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 160 requests
Completed 320 requests
Completed 480 requests
Completed 640 requests
Completed 800 requests
Completed 960 requests
Completed 1120 requests
Completed 1280 requests
Completed 1440 requests
Completed 1600 requests
Finished 1600 requests


Server Software:        
Server Hostname:        127.0.0.1
Server Port:            3000

Document Path:          /
Document Length:        220 bytes

Concurrency Level:      200
Time taken for tests:   0.239 seconds
Complete requests:      1600
Failed requests:        0
Total transferred:      472000 bytes
HTML transferred:       352000 bytes
Requests per second:    6683.43 [#/sec] (mean)
Time per request:       29.925 [ms] (mean)
Time per request:       0.150 [ms] (mean, across all concurrent requests)
Transfer rate:          1925.40 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    2   1.4      2       7
Processing:     7   27   4.5     26      38
Waiting:        1   18   3.8     18      29
Total:          8   29   4.5     28      39

Percentage of the requests served within a certain time (ms)
  50%     28
  66%     31
  75%     32
  80%     34
  90%     35
  95%     37
  98%     37
  99%     38
 100%     39 (longest request)
```

- -c200 并发数，代表有200个客户端同时在请求我们的网页服务器

- -n1600 代码总共执行1600次
- Request per second 简称 qps 衡量每秒能出来多少个并发量
- Transfer rate 吞吐量，越高性能越好

找到性能瓶颈可能的所在地

- nodejs的运行能力的瓶颈
- top 找到CPU、内存的性能瓶颈
- iostat 找到硬盘的带宽
- 后端的qps

#### webbench

## NodeJS性能分析工具

### profile

运行 node 程序时加上 --prof 参数，执行之后会立马生成一个 .log 文件

```sh
node --prof httpserver
```

然后再进行压测， -t 代表压测的时间，以秒为单位

```sh
EagleMacBookPro:~ eagleye$ ab -c10 -t2 http://127.0.0.1:3000/
This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 5000 requests
Completed 10000 requests
Finished 11385 requests


Server Software:        
Server Hostname:        127.0.0.1
Server Port:            3000

Document Path:          /
Document Length:        220 bytes

Concurrency Level:      10
Time taken for tests:   2.000 seconds
Complete requests:      11385
Failed requests:        0
Total transferred:      3359460 bytes
HTML transferred:       2505360 bytes
Requests per second:    5692.13 [#/sec] (mean)
Time per request:       1.757 [ms] (mean)
Time per request:       0.176 [ms] (mean, across all concurrent requests)
Transfer rate:          1640.25 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     1    2   9.3      1     316
Waiting:        0    1   6.6      1     315
Total:          1    2   9.3      1     316

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      1
  75%      1
  80%      2
  90%      2
  95%      3
  98%      4
  99%      5
 100%    316 (longest request)
```
再输入如下命令对 .log 进行分析，并输出到一个 txt 文件里面，就可以通过 txt 里面的内容进行性能分析了
```sh
node --prof-process isolate-0x10288c000-99482-v8.log > profile.txt
```

### Chrome DevTool

使用 --inspect-brk 参数运行 node 程序，brk代表启动调试的同时会暂停程序运行，等到我们进入到调试工具之后再往下走

```sh
node --inspect-brk httpserver
```

在 Chrome 中输入，让后点击 inspect 进入调试，程序出来是自动暂定的

```
chrome://inspect
```

进入调试界面之后运行程序，让后切换到 profiler页，进行录制，然后进行压测

```sh
EagleMacBookPro:~ eagleye$ ab -c10 -t2 http://127.0.0.1:3000/
This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 5000 requests
Finished 9590 requests


Server Software:        
Server Hostname:        127.0.0.1
Server Port:            3000

Document Path:          /
Document Length:        220 bytes

Concurrency Level:      10
Time taken for tests:   2.000 seconds
Complete requests:      9590
Failed requests:        0
Total transferred:      2829640 bytes
HTML transferred:       2110240 bytes
Requests per second:    4794.86 [#/sec] (mean)
Time per request:       2.086 [ms] (mean)
Time per request:       0.209 [ms] (mean, across all concurrent requests)
Transfer rate:          1381.62 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   2.9      0     286
Processing:     1    2   8.3      1     287
Waiting:        0    1   7.7      1     287
Total:          1    2   8.8      1     288

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      2
  75%      2
  80%      2
  90%      3
  95%      4
  98%      5
  99%      5
 100%    288 (longest request)
```

完成压测之后 点 stop 停止录制，就可以看到分析报告

### Clinic.js

一个 npm 包，大项目可以使用它来进行性能分析

```sh
npm install -g clinic
```

## JavaScript 代码优化

以本文为例，JavaScript 代码开销比较大是在 readFileSync，每次请求都会进行调用，所以可以把它提出来，用空间来换时间，代码修改如下：

```js
const http = require('http')
const fs = require('fs')
const str = fs.readFileSync(__dirname + '/index.html', 'utf-8')
http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    respose.writeHead(200)
    respose.end(str)
}).listen(3000)
```

再次进行 ab 测试，性能有了显著的提高。在实战中我们可以借助上述的分析工具找到性能瓶颈并进行代码优化。

性能优化的准则：

- 减少不必要的计算（小图片合并成大图片，减少图片编码和http请求开销）
- 控件换时间（把需要重复计算的结果缓存起来）
- 提前计算（启动阶段去计算一些内容，而不是在服务阶段）

## 内存管理优化

V8 引擎的垃圾回收机制，实现了准确式GC，GC算法采用了分代式垃圾回收机制。因此，V8将内存（堆）分为新生代和老生代两部分。

### 新生代

容量小，垃圾回收更快，使用 Scavenge GC 算法。内存空间分为 From 空间和 To 空间。在这两个空间中，必定有一个空间是使用的，另一个空间是空闲的。新分配的对象会被放入 From 空间中，当 From 空间被占满时，新生代 GC 就会启动。算法会检查 From 空间中存活的对象并复制到 To 空间中，如果有失活的对象就会销毁。当复制完成后将 From 空间和 To 空间互换，这样 GC 就结束了。

### 老生代

容量大，垃圾回收更慢，使用了`标记清除算法`和`标记压缩算法`。

什么情况下对象会出现在老生代空间中：

- 新生代中的对象是都已经经历过一次 Scavenge 算法，如果经历过的话，会将对象从新生代空间中移到老生代空间中。

- To 空间的对象占比大小超过25%，在这种情况下，为了不影响到内存分配，会将对象从新生代空间移到老生代空间中。

老生代中的空间很复杂，有如下几个空间：

```c++
enum AllocationSpace {
  // TODO(v8:7464): Actually map this space's memory as read-only.
  RO_SPACE,    // 不变的对象空间
  NEW_SPACE,   // 新生代用于 GC 复制算法的空间
  OLD_SPACE,   // 老生代常驻对象空间
  CODE_SPACE,  // 老生代代码对象空间
  MAP_SPACE,   // 老生代 map 对象
  LO_SPACE,    // 老生代大空间对象
  NEW_LO_SPACE,  // 新生代大空间对象

  FIRST_SPACE = RO_SPACE,
  LAST_SPACE = NEW_LO_SPACE,
  FIRST_GROWABLE_PAGED_SPACE = OLD_SPACE,
  LAST_GROWABLE_PAGED_SPACE = MAP_SPACE
};
```

在老生代中，以下情况会先启动`标记清除算法`：

- 某一个空间没有分块的时候
- 空间中被对象超过一定限制
- 空间不能保证新生代中的对象移动到老生代中

在这个阶段中，会遍历堆中所有的对象，然后标记活的对象，在标记完成后，销毁所有没有被标记的对象。在标记大型对内存时，可能需要几百毫秒才能完成一次标记。这就会导致一些性能上的问题。为了解决这个问题，2011 年，V8 从 stop-the-world 标记切换到增量标志。在增量标记期间，GC 将标记工作分解为更小的模块，可以让 JS 应用逻辑在模块间隙执行一会，从而不至于让应用出现停顿情况。但在 2018 年，GC 技术又有了一个重大突破，这项技术名为并发标记。该技术可以让 GC 扫描和标记对象时，同时允许 JS 运行，你可以点击 [该博客](https://v8project.blogspot.com/2018/06/concurrent-marking.html) 详细阅读。

清除对象后会造成堆内存出现碎片的情况，当碎片超过一定限制后会启动`标记压缩算法`。在压缩过程中，将活的对象像一端移动，直到所有对象都移动完成然后清理掉不需要的内存。

综上所述，我们减少内存占用，可以提高服务器的性能。如果有内存泄露，也会导致大量的对象存储到老生代中，服务器性能会大大降低。下面来介绍一下内存管理优化的方法。

### 查看内存情况的方法

使用Chrome Devtool，执行如下命令，与性能分析工具相同

```sh
node --inspect-brk httpserver
```

然后切换到 Memory 页面，点击 Take snapshot 开始记录内存情况

制造一个内存泄露的情况，代码如下

```js
const http = require('http')
const fs = require('fs')
const str = fs.readFileSync(__dirname + '/index.html', 'utf-8')
const leak = []
http.createServer((request, respose) => {
    if (request.url === '/favicon.ico') {
        respose.writeHead(200)
        respose.end('hello')
        return
    }
    for (let i = 0; i < 100; i++) {
        leak.push(str)
    }   
    respose.writeHead(200)
    respose.end(str)    
}).listen(3000)
```

然后进行压力测试

```sh
ab -c100 -n2000 http://127.0.0.1:3000/
```

从内存快照中可以看出，内存增长近200%，将左上角的 summary 切换 到 comparison，可以看到 size delta 最大的就是 (array) 点开之后看到 Alloc Size 最大的就 leak 这个变量，我们就可以找到内存泄漏的地方，进行修改。

节省内存最好的方式就是使用“池”。

## Node.js C++插件

笔者不太会 C++ 不过这的确一种性能调优的方式，毕竟需要达到性能极致还是要用 C++ 这种更底层的语言。

## 多进程优化

### Node.JS子进程与线程

#### 进程

- 操作系统挂载运行程序的单元
- 拥有一些独立的资源，如内存等
- 类比成一个“公司”

#### 线程

- 进行运算调度的单元

- 进程内的线程共享进程内的资源
- 类比成一个公司里面的“职员”

#### Node.js 的事件循环

- 主线程运行 v8 与 JavaScript
- 多个子线程通过事件循环被调度
- 保证主线程不阻塞

master.js

```js
const cp = require('child_process')

const child_process = cp.fork(__dirname +  '/child.js')

child_process.send('lalala')

child_process.on('message', str => {
    console.log('master:' + str)
}) 
```

child.js

```js
process.on('message', str => {
    console.log('child:' + str)
    process.send('huohuohuo')
})
```

V10版本之后提供 worker_threads

### Node.js cluster 模块

集群可以帮助我们更好的利用多核计算机的性能优势，下面代码会把我们的 http 服务建立多个进程以便于它能承担更大的压力、

```js
const cluster = require('cluster')
const os = require('os')

if (cluster.isMaster) {
    // 每一个node进程都有4个子线程是完成事件循环，所有也会利用到其它CPU，所以没有必要每个 CPU 都 fork 一个，对性能提升不会那么理想
    // 所以一般要有个余量，也就是 CPU 核数的一半，全部 CPU fork 满会导致内存的成倍增加但是性能却不会，应每一个进程都是要复制一份资源的，开销很大
    for (let i = 0; i < os.cpus().length / 2; i++) {
        cluster.fork()
    }
} else {
    require('./httpserver')
}
```



### 进程守护与管理

因为在运行之前，很多情况无法预测，为了加强Node程序的稳定性，需要加入进程守护。

```js
const cluster = require('cluster')
const os = require('os')

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length / 2; i++) {
        const worker = cluster.fork()
        let missedPing = 0
        let inter = setInterval(() => {
            // 发送心跳包
            worker.send('ping')
            missedPing++
            if (missedPing >= 3) {
                // miss ping 3 次 说明进程已经死掉了，杀掉僵尸进程
                clearInterval(inter)
                process.kill(worker.process.pid)
            }
        }, 3000)
        worker.on('message', (msg) => {
            if (msg === 'pong') {
                missedPing--
            }
        })  
    }
} else {
    require('./httpserver')

    process.on('message', str => {
        if (str === 'ping') {
            process.send('pong')
        }
    })
    process.on('uncaughtException', err => {
        console.error(err)
        process.exit(1)
    })

    setInterval(() => {
        // 检测可能出现的内存泄露情况
        console.log(process.memoryUsage().rss)
        if (process.memoryUsage().rss > 734003200) {
            console.log('oom')
            process.exit(1)
        }
    }, 5000)
}
```

## 架构优化

### 动静分离

#### 静态内容

- 基本不会变动，也不会因为请求参数不同而变化
- -> CDN分发，HTTP 缓存等。

#### 动态内容

- 各种因为请求参数不同而变动，且变种的数量几乎不可枚举
- -> 用大量的源站机器承载，结合反向代理进行负载均衡，用 Nginx 做反向代理和缓存，Redis 做缓存等。
