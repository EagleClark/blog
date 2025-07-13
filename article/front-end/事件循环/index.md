# 事件循环（浏览器+NodeJS）

> 首发于：2021-05-04

## 事件循环的作用

众所周知，JavaScript 的执行是单线程的，在单线程运行的情况下如果我们不采取任何措施，那么我们的浏览器就很容易卡顿，比如获取远程数据，I/O 操作等，都很是很耗时的，任务之间要一个等一个效率就非常低。所以为了这个问题，事件循环机制就应运而生了。

## 浏览器的事件循环

### 事件循环的原理

![](./image/pic1.awebp)

上图大致描述了事件循环的过程：

1. 当我们在浏览器打开一个界面的时候，我们首先会运行主线程（Main Thread），主线程运行的时候，会产生堆（Heap）和栈（Stack），其中堆为内存、栈为函数调用栈（Call Stack）。主线程中的各种代码、Function 将会放入调用栈中执行，如果是同步代码就会直接执行下去，如果执行的过程中函数 a，调用了函数 b，b 函数就会被压入 Call Stack 中去执行，b 函数又可能会调用 c 函数，c 函数也会被压入 Call Stack 中去执行 ... 直到主程序需要的函数全部压入调用栈中执行完，函数执行完毕就会出栈；
2. 在上述 Function 执行的过程中，这些 Function 里面如果有异步逻辑，当异步逻辑执行完毕后，其预设的回调函数就会被放入到回调队列（Callback Queue，又叫任务队列） 中，诸如用户交互事件，计时器等任务会被放入宏任务（Macro Task）队列中，HTTP 请求等任务会被放入微任务（Micro Task）队列中；
3. 异步任务执行有了结果之后其回调函数就会被放入调用栈中，等待执行；
4. 调用栈中的任务执行完毕之后，此时主线程处于空闲状态，会从回调队列中获取任务进行处理。

上述过程会不断重复，这就是 JavaScript 的运行机制，称为事件循环机制（Event Loop）。

Event Loop 的设计会带来一些问题，比如 setTimeout、setInterval 的时间精确性。这两个方法会设置一个计时器，当计时器计时完成，需要执行回调函数，此时才把回调函数放入回调队列中。

如果当回调函数放入队列时，假设队列中还有大量的回调函数在等待执行，此时就会造成任务执行时间不精确。

要优化这个问题，可以使用系统时钟来补偿计时器的不准确性，从而提升精确度。举个例子，如果你的计时器会在回调时触发二次计时，可以在每次回调任务结束的时候，根据最初的系统时间和该任务的执行时间进行差值比较，来修正后续的计时器时间。

### 宏任务和微任务

浏览器中的宏任务：script 全部代码、setTimeout、setInterval、requestAnimationFrame、I/O 操作、UI 渲染、UI 交互事件、postMessage、MessageChannel。

浏览器中的微任务：Promise、MutationObserver。

为什么要将异步任务分为宏任务和微任务呢？这是为了避免回调队列中等待执行的异步任务（宏任务）过多，导致某些异步任务（微任务）的等待时间过长。在每个宏任务执行完成之后，会先将微任务队列中的任务执行完毕，再执行下一个宏任务。

在浏览器的异步回调队列中，宏任务和微任务的执行过程如下：

1. 宏任务队列一次只从队列中取一个任务执行，执行完后就去执行微任务队列中的任务
2. 微任务队列中所有的任务都会被依次取出来执行，直到微任务队列为空
3. 在执行完所有的微任务之后，执行下一个宏任务之前，浏览器会执行 UI 渲染操作、更新界面

### 实例

```js
console.log("script start");
setTimeout(() => {
  console.log("setTimeout");
}, 1000);
Promise.resolve()
  .then(function () {
    console.log("promise1");
  })
  .then(function () {
    console.log("promise2");
  });
async function errorFunc() {
  try {
    await Promise.reject("error!!!");
  } catch (e) {
    console.log("error caught");
  }
  console.log("errorFunc");
  return Promise.resolve("errorFunc success");
}
errorFunc().then((res) => console.log("errorFunc then res"));
console.log("script end");

// 分析
// 1. 执行主线程输出 script start
// 2. setTimeout 放入宏任务队列
// 3. Promise.resolve 会生成微任务，放入微任务队列
// 4. 执行主线程中的 errorFunc 是个 async 函数，所以它会生成微任务，放入微任务队列
// 5. 执行主线程，输出 script end，主线程执行完毕空闲
// 6. 取出微任务依次执行，输出 promise1，随后又触发一个微任务，放入微任务队列
// 7. 取出下一个微任务 errorFunc 执行，因为有 await 所以会阻塞主线程，不把 Promise.reject 放入微任务队列
// 8. 直接执行 Promise.reject，捕捉到错误，输出 error caugh，再输出 errorFunc，随后又触发一个微任务，放入微任务队列
// 9. 取出下一个微任务执行，输出 promise2
// 10. 取出下一个微任务执行，输出 errorFunc then res
// 11. 执行宏任务，输出 setTimeout

// 结果
// script start
// script end
// promise1
// error caught
// errorFunc
// promise2
// errorFunc then res
// setTimeout
```

```js
// p1
Promise.resolve().then(() => {
  console.log(0); // p1-1
  return Promise.resolve(4); // p1-2 resolve, p1-3 return 暗含 then 操作
}).then(res => {
  console.log(res); // p1-4
});
// p2
Promise.resolve().then(() => {
  console.log(1); // p2-1
}).then(() => {
  console.log(2); // p2-2
}).then(() => {
  console.log(3); // p2-3
}).then(() => {
  console.log(5); // p2-3
}).then(() => {
  console.log(6); // p2-4
});

// 微任务队列    输出
// p1-1, p2-1
// p2-1, p1-2  0
// p1-2, p2-2  1
// p2-2, p1-3
// p1-3, p2-3  2
// p2-3, p1-4
// p1-4, p2-3  3
// p2-3, p2-4  4
// p2-4        5
//             6
```


## Node.js 中的事件循环

### 事件循环的原理

Node.js 中的事件循环和浏览器中是不一样的。

![](./image/pic2.awebp)

Node.js 官方给了一个事件循环的图解：

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, |
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

可以看到，这一流程包含 6 个阶段，每个阶段代表的含义如下所示：

1. timers：本阶段执行已经被 setTimeout() 和 setInterval() 调度的回调函数，简单理解就是由这两个函数启动的回调函数
2. pending callbacks：也叫 I/O callbacks 执行推迟到下一个循环迭代的 I/O 回调
3. idle, prepare：仅系统内部使用
4. poll：检索新的 I/O 事件，执行与 I/O 相关的回调，其他情况 Node.js 将在适当的时候在此阻塞。这也是最复杂的一个阶段，所有的事件循环以及回调处理都在这个阶段执行
5. check：setImmediate() 回调函数在这里执行，setImmediate 并不是立马执行，而是当事件循环 poll 中没有新的事件处理时就执行该部分
6. close callbacks：执行一些关闭的回调函数，如 socket.on('close', ...)

日常开发中的绝大部分异步任务都是在 timers、poll、check 3个阶段处理的：

**timers**

`timers`阶段会执行`setTimeout`和`setInterval`回调，并且是由`poll`阶段控制的。 同样，在`Node`中定时器指定的时间也不是准确时间，只能是尽快执行

**poll**

`poll`是一个至关重要的阶段，这一阶段中，系统会做两件事情

- 回到`timers`阶段执行回调
- 执行`I/O`回调 并且在进入该阶段时如果没有设定了`timer`的话，会发生以下两件事情
- 如果`poll`队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
- 如果`poll`队列为空时，会有两件事发生
  - 如果有`setImmediate`回调需要执行，`poll`阶段会停止并且进入到`check`阶段执行回调
  - 如果没有`setImmediate`回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去

当然设定了`timer`的话且`poll`队列为空，则会判断是否有`timer`超时，如果有的话会回到 timer 阶段执行回调。

**check**

`setImmediate`的回调会被加入`check`队列中，从`event loop`的阶段图可以知道，`check`阶段的执行顺序在`poll`阶段之后。

可以看到我们在有关`setImmediate`的知识点很复杂，而且一般在生产环境我们是不推荐使用`setImmediate`。

### 宏任务和微任务

Node.js 中的宏任务：setTimeout、setInterval、setImmediate、I/O 操作。

Node.js 中的微任务：process.nextTick、Promise。

在 Node.js 中，事件循环分为 6 个阶段（其实这 6 个阶段基本都属于宏任务），微任务会在事件循环的各个阶段之间执行。也就是说，每当一个阶段执行完毕，就会去执行微任务队列的任务。

![](./image/pic3.awebp)

### process.nextTick

这个函数其实是独立于`Event Loop`之外的，它有一个自己的队列，当每个阶段完成后，如果存在`nextTick`队列，就会清空队列中的所有回调函数，并且优先于其他`microtask`执行。

- 执行机制：`process.nextTick`是用于在事件循环的下一次循环中调用回调函数的，将一个函数推迟到代码执行的下一个同步方法执行完毕，或异步事件回调函数开始执行时再执行
- 执行原理：`Node`每一次循环都是一个`tick`，每次`tick`，`Chrome V8`都会从时间队列当中取所有事件依次处理。遇到`nextTick`事件，将其加入事件队尾，等待下一次`tick`到来的时候执行

```js
console.log(1)
Promise.resolve().then(() => {
  console.log('promise one'))
})
process.nextTick(() => {
  console.log('nextTick one')
})

setTimeout(() => {
  process.nextTick(() => {
    console.log('nextTick two')
  })
  console.log(3)
  Promise.resolve().then(()=> {
    console.log('promise two')
  })
  console.log(4)
}, 3);

// 输出 1
// promise one 进入微任务队列
// nextTick one 进入 nextTick 队列
// setTimeout 进入宏任务队列
// 执行 nextTick 队列任务，输出 nextTick one
// 执行微任务，输出 promise one
// 执行宏任务队列任务
// nextTick two 进入 nextTick 队列
// 输出 3
// promise two 进入微任务队列
// 输出 4
// 执行 nextTick 队列任务，输出 nextTick two
// 执行微任务，输出 promise two
// 1 -> nextTick one -> promise one -> 3 -> 4 -> nextTick two -> promise two
```

### 与浏览器事件循环的一些差异

```js
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```

浏览器中的执行过程：

1. 执行主线程，把两个 setTimeout 都放入宏任务队列
2. 执行第一个宏任务，输出 timer1
3. 把 promise1 放入微任务队列
4. 执行微任务 输出 promise1
5. 执行第二个宏任务，输出 timer2
6. 把 promise2 放入微任务队列
7. 执行微任务，输出 promise2

输出 timer1 -> promise1 -> timer2 -> promise2

node 中的执行过程：

如果是`node11`版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行微任务队列，这就跟浏览器端运行一致，最后的结果为: timer1 => promise1 => timer2 => promise2

如果是`node10`及其之前版本：要看第一个定时器执行完，第二个定时器是否在完成队列中: 如果是第二个定时器还未在完成队列中，最后的结果为: timer1 => promise1 => timer2 => promise2

如果是第二个定时器已经在完成队列中，则最后的结果为:

timer1 => timer2 => promise1 => promise2

新版本 node11 及以后，在只执行浏览器和 Node 共有的宏任务的时候虽然过程不一样，但结果一样。

node11 及以后执行过程：

1. 执行主线程，把两个 setTimeout 依次放入 timers 队列，栈空，执行任务队列
2. 首先进入 timers 阶段，执行第一个 setTimeout
3. 输出 timer1，把 promise1 放入微任务队列
4. 执行微任务，输出 promise1
5. 执行第二个 setTimeout
6. 输出 timer2，把 promise2 放入微任务队列
7. 执行微任务，输出 promise2

输出 timer1 -> promise1 -> timer2 -> promise2

### 实例

```js
const fs = require('fs')
console.log('start')

fs.writeFile('text.txt', '我写的数据', (err) => {
  if (err) throw err;
  console.log('text1');
});

setTimeout(() => {
  console.log('setTimeout 1')
  Promise.resolve()
  .then(()=> {
    console.log('promise 3')
  })
})

setTimeout(() => {
  console.log('setTimeout 2')
  Promise.resolve()
  .then(()=> {
    console.log('promise 4')
    Promise.resolve()
    .then(()=> {
      console.log('promise 5')
    })
  })
  .then(()=> {
    console.log('promise 6')
  })
  .then(()=> {
    fs.writeFile('text1.txt', '我写的数据', (err) => {
      if (err) throw err;
      console.log('text2');
    });
    setTimeout(()=>{
      console.log('setTimeout 3')
      Promise.resolve()
      .then(()=> {
        console.log('promise 7')
      })
      .then(()=> {
        console.log('promise 8')
      })
    }, 1000)
  })
}, 0);


Promise.resolve()
.then(()=> {
  console.log('promise 1')
})
.then(()=> {
  console.log('promise 2')
})
console.log('end')
```

分析：

1. 第一次事件循环，把整个主线程作为一个宏任务开始执行，输出 start
2. setTimeout1 放入 timers 队列
3. setTimeout 2 放入 timers 队列
4. fs.writeFile 放入 I/O callbacks 队列
5. promise 1 放入微任务队列
6. 输出 end，主线程栈空
7. 第二次事件循环，清空微任务队列
8. 执行 promise 1，输出 promise 1 并 把 promise 2 放入微任务队列
9. 执行 promise 2，输出 promise 2
10. 执行 timers 阶段，执行 setTimeout1，输出 setTimeout 1，promise 3 进入 微任务队列
11. 执行 promise 3，输出 promise 3
12. 回到 times 阶段，执行 setTimeout2，输出 setTimeout 2，promise 4 进入微任务队列
13. 执行 promise 4，输出 promise 4，将 promise 5、promise 6 放入微任务队列
14. 执行 promise 5，输出 promise 5，执行 promise 6，输出 promise 6
15. promise 6 后面的 then 又会生成微任务，并加入微任务队列，执行此微任务
16. setTimeout3 延时 1000 ms 暂不放入（这里如果 setTimeout 延时较低，还是会先执行 setTimeout） timers 队列，fs.writeFile 放入 I/O callbacks 队列
17. 执行 I/O callbacks 阶段的任务
18. 依次执行两个 fs.writeFile，输出 text1、text2
19. 跳过 idle prepare 阶段，因为没有这个阶段干的事，进入 poll 阶段就很复杂了，因为此时会回到 timers 阶段，但是我们当前不能完全确定 setTimeout 3 是否在 timers 队列当中，如果经过前面的 timers 和 I/O callback 阶段后，一秒早过去了，那么此时 setTimeout 3 就在 timers 队列当中，如果还没有到一秒，好了，直接到下一个事件循环当中
20. 这里大概率是一秒还没到，开始第三次事件循环，等 setTimeout3 时间达到，执行 setTimeout3，输出 setTimeout 3
21. 再依次执行其内部的两个微任务，输出 promise 7 和 promise 8

输出：

start -> end -> promise 1 -> promise 2 -> setTimeout 1 -> promise 3 -> setTimeout2 -> promise 4 -> promise 5 -> promise 6 -> text1 -> text2 -> setTimeout 3 -> promise 7 -> promise 8
