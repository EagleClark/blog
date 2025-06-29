# JavaScript模块化

> 首发于：2023-05-28

关于 JavaScript 的模块化，我一直有很多疑问，比如：UMD 是什么？AMD 又是什么？那 CommonJS 呢？ES Module 呢？他们都是什么？又有什么关系？有什么用？下面我将一个一个探究。

## 模块化

### 背景

早期的 Web 程序都是很小的，所以基本不需要啥模块化，所有的 JavaScript 文件都可以通过 `<script>` 直接引入，但是随着互联网的发展，Web 应用越来越大，JavaScript 程序也越来越复杂，全局环境污染问题，代码耦合度高问题等，如果不进行功能模块拆分、按需导入等操作，那开发和运行都会受到影响。

### 早期模块化方案

#### 全局 function 模式

其本质就是在不同的 js 文件中定义不同的 function，然后通过 `<script>` 标签各自引入到 html 中，这个方案的缺点很明显，各个 js 之前的依赖关系和先后顺序需要搞得非常清楚才行。

```javascript
function foo1() {
    // ...
}

function foo2() {
    // ...
}
```

#### Namespace 模式

其本质就是利用对象的属性和方法，这样全局的变量确实少了，但是这并不安全，对象里面的所有成员都会被暴露且可以被外部任意修改，覆盖。

```javascript
const obj = {
    msg: 'Hello',
    test() {
        console.log(this.msg);
    },
};
```

#### IIFE 模式

IIFE（Immediately Invoked Function Expression），匿名立即调用函数，也是个闭包。本质也是在 window 变量上挂属性。比起前面两种模式，他的优点是成员是私有的，需要使用方法才能对闭包内部进行修改，不过就是模块与模块之间的通讯不方便。

```javascript
(function(win) {
    let msg = 'Hello';
    function foo() {
        console.log(msg);
    }
    win.myModule = { foo };
})(window)
```

增强型：可以解决模块之间通讯的问题，但是还是需要保证引入顺序。

```javascript
(function(win, $) {
    let msg = 'Hello';
    function foo() {
        console.log(msg);
    }
    win.myModule = { foo };
})(window, JQuery)
```

### 优缺点总结

不使用模块化的缺点：

*   `<script>` 标签过多，导致请求过多，页面加载慢
*   依赖混乱、依赖模糊，代码难以维护

使用模块化的优点：

*   减少命名空间污染的问题，避免命名冲突
*   更好地进行功能拆分，实现按需加载
*   更好地复用代码，提高代码地可维护性

## CommonJS(CJS)

2009年， CommonJS 规范被提出，它是 NodeJS 主要在使用的模块化规范，一般在 server 中使用，如果想在浏览器中使用，那么代码写完之后还需要使用工具（例如：[browserify](https://browserify.org/)）进行打包才能正常使用。

`module`、`exports`、`require`、`global` 是它模块化的核心。

一般来说，一个文件就是一个模块，有自己的作用域，这个文件里面定义的变量、函数、类等都是私有的，其它模块是不可见的，如果要对其它文件可见，就需要改在 `global` 上。

定义一个模块：

```javascript
// test.js
const test = 'hello';

module.exports.test = test;
```

导入一个模块：

```javascript
// app.js
const { test } = require('./test.js');

console.log(test); // hello
```

CommonJS 模块的特点：

*   所有代码都运行在模块作用域，不会污染全局作用域。
*   模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
*   模块加载的顺序按照其在代码中出现的顺序同步加载。
*   模块在导入的时候就会被执行，并会把值拷贝出来，所以模块内部变化不会影响到被导入进去的模块。

## AMD

[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) 即 Asynchronous Module Definition，异步模块定义，于2010年发布，[RequireJS](https://requirejs.org/) 就是遵循这个规范开发的一个工具库。

前面我们了解了 `CommonJS` 的模块是同步加载的，这对服务器端不是一个问题，因为所有的模块都存放在本地硬盘，可以同步加载完成，等待时间就是硬盘的读取时间。但是，对于浏览器，这却是一个大问题，因为模块都放在服务器端，等待时间取决于网速的快慢，可能要等很长时间，浏览器处于"假死"状态。因此，浏览器端的模块，不能采用同步加载，只能采用异步加载。这就是AMD规范诞生的背景。

它是一个专门用于浏览器的模块化规范，采用异步方式加载模块，模块的加载不影响后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

### 基本规范

```javascript
// 定义无依赖的模块
define(function() {
    return module;
});

// 定义有依赖的模块
define(['module1', 'module2'], function(m1, m2) {
    return module;
});

// 引入模块
requirejs(['module1', 'module2'], function(m1, m2) {
    // 使用 m1、m2
})
```

### 使用示例

`index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- 引入 requirejs，并在加载完成后自动加载 main.js -->
  <script data-main="./main.js" src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
  <title>Document</title>
</head>
<body>
  
</body>
</html>
```

创建两个模块 `lib/mod1.js` 和 `lib/mod2.js`

```javascript
// 定义无依赖的模块
define(function() {
  'use strict';
  const name = 'module1';

  function getName() {
    return name;
  }

  return { getName };
});
```

```javascript
// 定义有依赖的模块
define(['module1', 'jquery'], function(module1, $) {
  'use strict';
  
  const msg = 'module2';

  function showMsg() {
    $('body').css('background', 'aliceblue');
    console.log(msg, module1.getName())
  }

  return { showMsg, msg };
});
```

创建 `main.js`

```javascript
requirejs.config({
  // 基本路径
  baseUrl: 'lib',
  // 配置模块的路径
  paths: {
    module1: './mod1',
    module2: './mod2',
    jquery: 'https://code.jquery.com/jquery-1.12.4.min',
  },
});

requirejs(['module2'], function(mod2) {
  mod2.showMsg();
});
```

## CMD

CMD 即 Common Module Definition，通用模块定义规范，是阿里的大牛玉伯在 2011年提出的，与 AMD  也有挺多相似之处，[Sea.js](https://seajs.github.io/seajs/docs/) 就是此规范的一个实现。

Sea.js 遵循 CMD 规范，可以像写 Node.JS 代码一样书写模块代码。

### 使用示例

`index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/seajs/3.0.3/sea.js"></script>
  <title>Document</title>
</head>
<body>
  <script>
    // seajs 的简单配置
    seajs.config({
      base: "./lib",
      alias: {
        myModule: 'module.js',
      }
    })

    // 加载入口模块
    seajs.use("./main")
  </script>
</body>
</html>
```

`lib/test.js`

```javascript
define(function(require, exports) {
  const test = 'test';
  
  exports.test = test;
});
```

`lib/module.js`

```javascript
// 所有模块都通过 define 来定义
define(function(require, exports, module) {

  // 通过 require 引入依赖
  const test = require('test');

  const name = 'myModule';
  
  function getTest() {
    alert(test.test);
  }
  
  // 通过 exports 对外提供接口
  exports.getTest = getTest;

  // 或者通过 module.exports 提供整个接口
  // module.exports = {
  //   name,
  //   getTest,
  // }
});
```

`main.js`

```javascript
define(function(require) {

  // 通过 require 引入依赖
  const myModule = require('myModule');

  myModule.getTest();
});
```

## UMD

UMD 即 Universal Module Definition，是一种 JavaScript 通用模块定义规范，让你的模块能在所有 JavaScript 环境中运行。

如果我们想让我们写的模块既能在浏览器上运行，又能在后端运行，那我们写的模块就需要同时支持前面提到的 `AMD（或CMD）` 和 `CommonJS` 规范，这样的话我们在写一个模块的时候就需要用多种方式来定义和导出这个模块，这样就会让我们的代码变得很奇怪。

为了解决这个问题，我们就需要去实现 UMD 规范，好在 `Github` 上已经有了一些实现，我们可以参考来使用：[GitHub - umdjs/umd: UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.](https://github.com/umdjs/umd)

下面是一个简单的例子：

```javascript
(function(root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        // commonjs模块规范，nodejs环境
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // 如果环境中有define函数，并且define函数具备amd属性，则可以判断当前环境满足AMD规范
        define(factory)
    } else {
        // 没有模块环境，直接挂载在全局对象上
        root.umdModule = factory();
    }
}(this, function() {
    return {
        name: '我是一个umd模块',
    }
}))
```

## ES Module

### 发展历程

前面说了 AMD、CMD、UMD，但是他们都逐渐退出了历史舞台，基本上没人再去使用了，生命周期很短，有点儿悲壮，但是他们已经完成了他们的历史使命，就是倒逼官方制定了我们现在广泛使用的 ES Module 规范，他终将一统江湖。

ES 是 ECMAScript，他是 JavaScript 的官方规范。

1997年，ECMA 发布 262 号标准文件（ECMA-262）的第一版，也就是 ECMAScript 1.0。从 ES1 到 ES5 其实并没有 Module 这个概念，一直到 2015年，官方发布 ES6 才出现模块化这个概念，因此 ES6 也经常被称为 ES2015，因为 ES6 更新的东西实在太多了，所以他是具有里程碑意义的一个版本，至此以后这个规范会在每年6月更新，正式发布一次。

比如：2016年6月发布的新规范也被称作 ES2016， 2017年6月发布的新规范也被称作 ES2017，当然也有把 ES2016 称为 ES7，ES2017 称为 ES8 的 ...... 以此类推

说到 ES6 就不得不顺便再说一下 [Babel](https://babel.docschina.org/)，因为 ES6 的更新确实是太大了，而浏览器对新规范的支持往往是滞后的，而且低版本的浏览器更是完全不支持 ES6+ 的语法。所以 Babel 就诞生了。

Babel 做的事情主要就是：

*   把 ES6+ 的语法转换成 ES5 以前的语法，比如：`const xxx = 1` -> `var xxx = 1`。
*   使用 Polyfill 来支持新 API，比如：`Proxy` 这个 API，ES6 以前的语法是没有的，Polyfill 就会在旧的环境中提供一个方法来支持 `Proxy`。
*   源码转换（这个不是我们这里的重点就不赘述了）

### 代码实例

基础的 `import`、`export` 语法想必大家都很熟悉了，在 React、Vue 等项目中大家肯定都用过，就不在此赘述了，说下在 html 中直接使用和 NodeJS 中的使用。

html 中直接使用：

`test.js`

```javascript
export const MyTest = 'Hello world';
```

`index.html`

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
    <!-- 不加 type="module" 会报错 -->
    <script type="module">
        // 浏览器直接打开这个文件会报跨域错误，建议使用web服务器
        // VSCode的Live Server 插件是个不错的选择
        import { MyTest } from './test.js';

        console.log(MyTest);
    </script>
    <!-- <script type="module" src="./test.js"></script> -->
</body>
</html>
```

NodeJS 中使用：

`index.js`

```javascript
import { MyTest } from './test-module.js';

console.log(MyTest);
```

`test-module.js`

```javascript
export const MyTest = 'Hello world';
```

如果直接使用 `node index` 执行就会报错：`Cannot use import statement outside a module`，我们需要在 `package.json` 中增加一个属性：

```diff
{
   // ...
+  "type": "module",
}
```

再次使用 `node index` 执行就可以正常执行了。

另一种方式就是，直接把所有 `.js` 改成 `.mjs`。

不过值得注意的是用 ESM 方式写 NodeJS 代码的话，像 `__dirname`、`__filename` 等可能就无法使用了。所以在 NodeJS 中使用 ESM 更好的方式还是结合着 `Webpack`、`Babel` 等工具更好。

### 特点

*   ESM 自动采用严格模式
*   import 导入的是一个只读引用，而不像 CommonJS 那样是一个值，所以使用 ESM 规范的模块内部引用发生变化的时候，外部也会跟着改变
*   export/import 必须位于模块顶级，不能位于某个作用域内部
*   ESM 模块是异步加载的，而 CommonJS 模块是同步加载的
*   ESM 模块是静态的，在编译时加载，而 CommonJS 模块是动态的，在运行时加载
*   ESM 模块可以进行 Tree Shaking，而 CommonJS 不能
