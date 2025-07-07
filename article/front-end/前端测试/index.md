# 前端测试

> 首发于：2021-06-28

## 概念

- 单元测试，Unit Testing，简称 UT，是指对软件中的最小可测试单元进行检查和验证，这是最低级别的测试活动，前端开发中单元可以是一个 function 也可以是一个 class，也可以是一个组件。对他们的输出做断言检查，是一个白盒测试，一般由开发者进行编写，开发者可以通过编写执行 UT 来判断自己的逻辑是否正确。
- 集成测试，Integration Testing，其实集成测试就是根据业务功能需要把多个单元整合起来进行测试。引用 React 官网上的说法：“单元测试”和“集成测试”之间的差别可能会很模糊。如果你在测试一个表单，用例是否应该也测试表单里的按钮呢？一个按钮组件又需不需要有他自己的测试套件？重构按钮组件是否应该影响表单的测试用例？不同的团队或产品可能会得出不同的答案。
- 端到端测试，end-to-end，简称 e2e，也被称作功能测试（Functional Testing）或者浏览器测试或者冒烟测试，是指从使用者的角度出发，对真实系统进行测试，e2e 测试本质上是一种黑盒测试，相当于模拟用户访问应用程序，主要检查界面或功能是否正确，自动化测试不完善的时候通常是由人工来完成这项测试工作。
- 界面测试，User Interface Testing，简称 UI 测试，与 e2e 测试存在大量重叠，通常在做 e2e 的时候就能够覆盖 UI 测试。
- TDD（Test Drive Development）即测试驱动开发。简单的说就是先根据需求写测试用例，再代码实现，接着测试，循环此过程直到产品的实现。可以看出来，TDD 的基本思路就是通过测试来推动整个开发的进行，但测试驱动开发并不只是单纯的测试工作，而是把需求分析，设计，质量控制量化的过程。
- BDD（Behavior Drive Development）即行为驱动开发，BDD 可以看作是对 TDD 的一种补充，或者说是 TDD 的一个分支。在 TDD 中，我们并不能完全保证根据设计所编写的测试就是用户所期望的功能。BDD 将这一部分简单和自然化，用自然语言来描述，让开发、测试、BA 以及客户都能在这个基础上达成一致。BDD 更加依赖于需求行为和文档来驱动开发，这些文档的描述跟测试代码很相似。e2e 测试更多是和 BDD 的开发模式进行结合。

综上所述，后文主要会针对单元测试和端到端测试常用的工具进行使用说明和对比。

## 前端测试工具

前端测试工具有很多，可以分为几类：

- 断言库
- 测试覆盖率工具
- 测试框架

### 断言库

测试的时候我们需要使用断言来判断代码是否到达目的，如果没有断言，我们的测试也将失去意义。

#### assert

assert 是 Node.JS 内置的断言库，下面是一个简单的例子：

```js
const assert = require('assert');
assert(1 === 2);

const test = 'hello world';
assert.strictEqual('hello world', test);
```

#### chai

这个断言库很全很强大，提供了常用的 assert、should、expect 断言关键字。

![](./image/pic1.awebp)

#### power-assert

如果你在使用 assert 的话，无需使用 `require('power-assert')`来引入 power-assert，它的 API 与 assert 一样，而且拥有强大的提示信息，如下图所示。

![](./image/pic2.awebp)

安装

```sh
npm i power-assert
```

### 测试覆盖率工具

#### Istanbul

这个软件以土耳其最大城市伊斯坦布尔命名，因为土耳其地毯世界闻名，而地毯是用来覆盖的。

安装

```sh
npm install -g istanbul
```

运行

```sh
istanbul cover path
```

### 测试框架

测试框架的作用是提供一些方便的语法来描述测试用例，比如可以对一组用例进预处理和后处理（`beforeAll`、`beforeEach`、`afterAll`、`afterEach`等）；使用 `describe`函数表示一组用例。下面将会列举一些常见的测试框架，并做简单的分析。

#### Jest

[Jest](https://jestjs.io/) 是 Facebook 出品的一个测试框架，算是一个大而全的测试框架，内置断言、测试覆盖率工具、Mock工具，开箱即用，支持浏览器和 NodeJS，支持 BDD 写法（也就是 expect 语法）是 React 官方推荐使用的测试框架。Jest 既可以用来做单元测试，也可以用来做端到端测试，在做端到端测试的时候可以使用`jsdom`，网络请求使用本地 mock 数据，这样可以确保毫秒级完成单元测试，如果需要使用真实 DOM，还是需要配合其它测试工具。

#### Mocha

[Macha](https://mochajs.cn/) 也是一个功能丰富的 JS 测试框架，支持浏览器和 NodeJS，不过没有内置断言库、测试覆盖率工具和Mock工具，需要和其他三方库配合使用，比如配合 chai 使用 就可以支持 TDD 写法（也就是 assert.equal 语法），当然 BDD 写法也是支持的。Mocha 既可以用来做单元测试，也可以用来做端到端测试，做端到端测试的时候需要配合其它测试工具。

#### Jasmine

[Jasmine](https://jasmine.github.io/) 是一个BDD 测试框架，支持浏览器和 NodeJS，内置断言库，mock 工具等，经常配合 Karam 使用，但是随着 Jest 这种大而全的框架的崛起，Jasmine 显得比较老派，现在热度逐年下降，使用的人也越来越少。

### e2e 测试工具

#### Cypress

[Cypress](https://github.com/cypress-io/cypress) 一个 e2e 测试框架，测试界面和文档做到极致的一个产品。

#### PhantomJS

[PhantomJS](https://github.com/ariya/phantomjs)，一个基于 webkit 内核的无头浏览器，没有 UI 界面。用 js 代码模拟一些 web 界面上的操作，用起来比较不方便，不太推荐使用。

#### NightmareJS

[NightmareJS](https://github.com/segmentio/nightmare)，一个轻量级浏览器自动化测试库。基于Electron，和 PhantomJS 类似，但是快了大约2倍且更现代。nightmare 还有个优点——它提供了一个 Chrome 插件 daydream，该插件可以通过录制屏幕，自动化生成测试代码，不过最近一次更新是在2019年，也不太推荐使用。

#### Playwright

[Playwright](https://playwright.dev/) 为现代 web 应用程序提供可靠的端到端测试。支持使用 NodeJS、python、Java、.net 四种编程语言的 API，同时支持Google Chrome 和 Microsoft Edge（带有[Chromium](https://www.chromium.org/)）、Apple Safari（带有[WebKit](https://webkit.org/)）和 Mozilla Firefox。Playwright 支持所有浏览器和所有平台的无头（无浏览器 UI）和有头（带浏览器 UI）模式。Headed 非常适合调试，而 Headless 速度更快，适合 CI/云执行。

#### Storybook

[Storybook](https://storybook.js.org/) 是一个开源工具，用于独立构建 UI 组件和页面。它简化了 UI 开发、测试和文档编制。

#### Selenium

[Selenium](https://github.com/SeleniumHQ/selenium) 是 e2e 测试鼻祖级的框架，有多种编程语言的版本，它是基于 webdriver 而不是 webkit 内核实现的，所以，Selenium 的浏览器兼容性相对于其他浏览器要好很多。

#### Nightwatch

[Nightwatch](https://github.com/nightwatchjs/nightwatch) 原 Selenium，是一个用于 web 网站或应用的自动化测试框架，使用 node.js 和 W3C WebDriver API。他也是一个完整和集成的解决方案，使用 BDD 方式，用于网络应用程序和网站的端到端测试。它还可用于Node.js 单元和集成测试。

Nightwatch 的兼容性比较好，Firefox、Chrome、Safari、edge 都可以测。

#### Protractor

[Protractor](http://www.protractortest.org/#/) 是一个针对 Angular 的 e2e 测试框架。

### 测试框架运行环境

#### Karam

[Karam](https://karma-runner.github.io/) 官网介绍是一个可以在多个浏览器中执行 js 代码的简单工具。它不是一个完整的测试框架，没有断言库，只是启动了一个 http 服务器，然后生成测试 html 文件，执行测试用例的 js。严格来讲 Karam 其实不算是一个测试框架，而是一个运行测试框架的环境。

#### Puppeteer

[Puppeteer](https://github.com/puppeteer/puppeteer) 是一个node库，他提供了一组用来操纵 Chrome 的API, 通俗来说就是一个 headless chrome 浏览器 (当然你也可以配置成有UI的，默认是没有的)。既然是浏览器，那么我们手工可以在浏览器上做的事情 Puppeteer 都能胜任, 另外，Puppeteer 翻译成中文是”木偶”意思，所以听名字就知道，操纵起来很方便。

配合 [headless-recorder](https://github.com/checkly/headless-recorder)，一个 Chrome 插件，可以对操作进行录制，录制的操作有 puppeteer 和 playwright 两个版本。

### 其它测试工具

#### AVA

[AVA](https://github.com/avajs/ava) 是 Node.JS 的测试工具，具有简洁的 API、详细的错误输出、支持新语法以及流程隔离。
