# Babel

> 首发于：2021-03-19

## Babel 是什么？

[官方网站](https://www.babeljs.cn)

Babel 是一个工具链，主要将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。

## 语法转换

举一个简单的例子，这是一个官方的例子，现在在本地来实现一下这个转换：

```js
// Babel 输入： ES2015 箭头函数
[1, 2, 3].map((n) => n + 1);

// Babel 输出： ES5 语法实现的同等功能
[1, 2, 3].map(function(n) {
  return n + 1;
});
```

```sh
# 安装 babel 核心模块 命令行集成工具 以及 预设的一些配置
$ npm install -D @babel/core @babel/cli @babel/preset-env
```

编写配置文件 babel.config.json（需要 `v7.8.0` 或更高版本） 或者 .babelrc 都可以

```json
{
	"presets": [
        "@babel/preset-env"
    ]
}
```

然后创建一个 src 目录，并编辑一个 test.js 文件：

```js
[1, 2, 3].map((n) => n + 1);
```

运行命令将 src 目录下的代码进行编译到 lib 目录下：

```sh
$ ./node_modules/.bin/babel src --out-dir lib
```

输出同名 js 文件：

```js
"use strict";

[1, 2, 3].map(function (n) {
  return n + 1;
});
```

## @babel/preset-env

@babel/preset-env 是一个智能预设的环境，它允许你使用最新的 JavaScript，而不需要管目标环境能兼容哪些语法。一般来说这个预设环境包含了我们常用的 es2015+ 的语法，允许我们使用比如 let、const、箭头函数等新语法，但是不包含 stage-x 阶段（一种新语法从提案到变成标准的0 - 4，5个阶段 ）的插件。

```sh
$ npm i -D @babel/preset-env
```

配置项（仅列举几个常用的，剩下的可以查看 [官方文档](https://www.babeljs.cn/docs/babel-preset-env)）：

- targets 支持的环境列表
- useBuiltIns
- modules 模块类型
- include
- exclude



## @babel/polyfill

Babel 默认只转换 JS 语法（比如解构赋值、箭头函数等），而不转换 API（Promise、Maps、Proxy 等），而 polyfill 就是为了支持这些 API 而生的。

从 Babel 7.4.0 版本开始，这个软件包已经不建议使用了，建议直接包含 `core-js/stable` （用于模拟 ECMAScript 的功能）和 `regenerator-runtime/runtime` （需要使用转译后的生成器函数）

```js
// 要不要 import 也视情况认定
import "core-js/stable";
import "regenerator-runtime/runtime";
```

@babel/polyfill 模块包含 core-js 和一个自定义的 regenerator runtime 来模拟完整的 ES2015+ 环境。

这意味着你可以使用诸如 `Promise` 和 `WeakMap` 之类的新的内置组件、 `Array.from` 或 `Object.assign` 之类的静态方法、 `Array.prototype.includes` 之类的实例方法以及生成器函数（generator functions）（前提是你使用了 regenerator 插件）。为了添加这些功能，polyfill 将添加到全局范围（global scope）和类似 `String` 这样的原生原型（native prototypes）中。

对于软件库/工具的作者来说，这可能太多了。如果你不需要类似 `Array.prototype.includes` 的实例方法，可以使用 transform runtime 插件而不是对全局范围（global scope）造成污染的 `@babel/polyfill`。

举个例子，如果不加 polyfill 那么在打包带 promise 的代码的时候就会出现下面的情况，实际上 promise 没有做任何转变，在某些环境下仍然无法运行：

```js
// 转换前
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1)
    }, 1000)
})

p.then(data => {
    console.log(data)
})

// 转换后
var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 1000);
});
p.then(function (data) {
  console.log(data);
});
```

为了解决这个问题我们就要使用 polyfill：

```sh
# 老用法，已经不推荐使用
$ npm install -S @babel/polyfill
# 新用法
$ npm install -S core-js
```

如果使用 @babel/polyfill，那么我们需要在使用的 env 上配置一下 useBuiltIns 参数为 usage，就会加载你所需要的 polyfill，是按需加载的，修改 .babelrc 配置如下：

```json
{
  "presets": [
    [
      "@babel/env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1",
          "ie": "11"
        },
        "useBuiltIns": "usage"
      }
    ]
  ]
}
```

再次打包出来的文件如下所示：

```js
"use strict";

require("core-js/modules/es6.object.to-string.js");

require("core-js/modules/es6.promise.js");

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 1000);
});
p.then(function (data) {
  console.log(data);
});
```

如果我们在配置 .babelrc 的时候把 useBuiltIns 属性去掉，也就是默认 false，那么我们就需要在代码中导入 polyfill：

```js
import '@babel/polyfill'

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
      resolve(1)
  }, 1000)
})

p.then(data => {
  console.log(data)
})
```

打包出来的文件如下：

```js
"use strict";

require("@babel/polyfill");

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 1000);
});
p.then(function (data) {
  console.log(data);
});
```

如果我们在配置 .babelrc 的时候把 useBuiltIns 属性配置成 entry，那么就会将导入的 polyfill 结合 target 配置，转换为我们环境需要的 polyfill 模块，不管代码有没有用到。

配置文件和原文件都与上一个例子一样，打包出来的文件如下：

```js
"use strict";

require("core-js/modules/es7.array.flat-map.js");

// ... 中间省略一百多行

require("core-js/modules/web.dom.iterable.js");

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
p.then(data => {
  console.log(data);
});
```

如果使用 core-js，useBuiltIns 配置为 entry，再加入 `"corejs": "3"`，原文件修改为：

```js
import "core-js/stable";
import "regenerator-runtime/runtime";

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
      resolve(1)
  }, 1000)
})

p.then(data => {
  console.log(data)
})
```

打包之后的文件为：

```js
"use strict";

require("core-js/modules/es.symbol.description.js");

// ... 中间省略几百行

require("core-js/modules/web.url-search-params.js");

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
p.then(data => {
  console.log(data);
});
```

如果将 useBuiltIns 配置为 usage，import 去掉，那么打包出来的文件如下：

```js
"use strict";

require("core-js/modules/es.promise.js");

require("core-js/modules/es.object.to-string.js");

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 1000);
});
p.then(function (data) {
  console.log(data);
});
```

## Plugin

Babel 是一个编译器（输入源码 => 输出编译后的代码）。就像其他编译器一样，编译过程分为三个阶段：解析、转换和打印输出。

现在，Babel 虽然开箱即用，但是什么动作都不做。它基本上类似于 `const babel = code => code;` ，将代码解析之后再输出同样的代码。如果想要 Babel 做一些实际的工作，就需要为其添加插件。

除了一个一个的添加插件，还可以以 preset 的形式，就是前面说到的预设，它会帮你启用一组插件。

### @babel/plugin-transform-runtime

这是一个 Babel 中比较常用的插件，可以帮助我们减少打包出来的文件的大小，下面举个例子：

原文件 js 如下所示：

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
      resolve(1)
  }, 1000)
})

(async function() {
  console.log(await p); 
})()
```

在不使用插件的情况下进行打包生成文件如下：

```js
"use strict";

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.object.to-string.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { /* 此处省略一段很长的代码 */ }

function _asyncToGenerator(fn) { return function () { /* 此处省略一段很长的代码 */ }

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 1000);
})( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.t0 = console;
          _context.next = 3;
          return p;

        case 3:
          _context.t1 = _context.sent;

          _context.t0.log.call(_context.t0, _context.t1);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})))();
```

_asyncToGenerator 在当前文件被定义，被使用，如果在别的文件中也用到了 await 那么这个函数还会被这样定义，导致重复和浪费空间。

修改一下配置文件：

```json
{
    "presets": [
      [
        "@babel/env",
        {
          "targets": {
            "edge": "17",
            "firefox": "60",
            "chrome": "67",
            "safari": "11.1",
            "ie": "11"
          },
          "useBuiltIns": "usage",
          "corejs": "3"
        }
      ]
    ],
    "plugins": [
        "@babel/plugin-transform-runtime"
    ]
}
```

安装插件：

```sh
$ npm i @babel/plugin-transform-runtime -S
```

重新打包，生成文件如下：

```js
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("core-js/modules/es.promise.js");

require("core-js/modules/es.object.to-string.js");

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1);
  }, 1000);
})( /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.t0 = console;
          _context.next = 3;
          return p;

        case 3:
          _context.t1 = _context.sent;

          _context.t0.log.call(_context.t0, _context.t1);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})))();
```

可以看到很长的那段定义 _asyncToGenerator 的代码变成了 require 一个模块。

### plugin 开发

[https://babeljs.io/docs/plugins#plugin-development](https://babeljs.io/docs/plugins#plugin-development)
