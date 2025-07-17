# Webpack基础

> 首发于：2021-03-14

## 为什么需要构建工具

- 转换 ES6 语法
- 转换 JSX、vue 等语法
- CSS 前缀补全/预处理器（less、sass 等）
- 压缩混淆
- 图片压缩

## 前端构建演变之路

- ant + YUI Tool 本地  js 与 css 压缩
- grunt 解析 js、css 等，IO 操作比较多，打包速度比较慢
- gulp 沿用了 grunt 思想，但是速度更快
- fis3 百度推出的，已经不维护了
- rollup、parcel、webpack

webpack 社区生态丰富、配置灵活插件花扩展、官方更新迭代速度快

## 安装

首先需要安装 node.js 然后执行如下指令进行安装

```sh
# 在某个项目下安装
$ npm install webpack webpack-cli -D
# 全局安装
$ npm install webpack webpack-cli -g
# 版本查看
$ webpack -v
```

在 package.json 里面的 scripts 中加入  `build: webpack` 就可以使用 `npm run build` 命令来进行打包了。 

## 配置文件基础

默认配置文件为 webpack.config.js，也可以通过 `webpack --config 文件名` 指定配置文件。

### entry

指定入口文件。

```js
// 单入口
module.exports = {
	entry: './path/to/my/entry/file.js'
}

// 多入口，entry 是一个对象
module.exports = {
	entry: {
        app: './src/app.js',
        adminApp: './src/adminApp.js'
    }
}
```

### output

指定编译后的文件输出到磁盘的位置。

```js
// [name] 是个占位符，会根据 output 对象中配置的 key 来生成打包好文件的名称
module.exports = {
	output: {
        path: path.join(__dirname, 'dist'), // 输出路径
        filename: '[name].js' // 输出文件
    }
}
```

### mode

webpack4 之后才引入的，Mode 用来指定当前构建环境是：production、development 还是 none。设置 mode 可以使用 webpack 内置的函数，默认值为 production。

- development 设置 `process.env.NODE_ENV` 的值为 development，开启 NamedChunksPlugin 和 NamedModulesPlugin
- production 设置 `process.env.NODE_ENV` 的值为 production，开启 FlagDependencyUsagePlugin、FlagIncludedChunksPlugin、ModuleConcatenationPlugin、NoEmitOnErrorsPlugin、OccurrenceOrderPlugin、SideEffectsFlagPlugin 和 TerserPlugin
- none 不开启任何优化选项

```js
module.exports = {
    mode: 'development',
}
```

### loaders

webpack 开箱即用支持 JS 和 JSON 两种类型的文件，通过 Loaders 去支持其它文件类型，并把它们转化成有效的模块，并且可以添加到依赖图中。

本身是一个函数，接受源文件作为参数，返回转换的结果。

常用的 Loaders：

- babel-loader 转换 ES6、ES7 等 JS 新特性语法
- css-loader 支持 .css 文件的加载和解析
- less-loader 将 less 文件转换成 css
- ts-loader 将 TS 转换成 JS
- file-loader 进行图片、字体等的打包
- raw-loader 将文件以字符串形式导入
- thread-loader 多进程打包 JS 和 CSS

```js
// test 指定匹配规则，use 指定使用的 loader 名称
module.exports = {
    module: {
        rules: [
            { test: /\.txt$/, use: 'raw-loader'}
        ]
    }
}
```



### plugins

插件用于 bundle 文件的优化，资源管理和环境变量注入，作用于整个构建过程，loader 做不到的时候都可以通过 plugins 完成。

[Plugin 官方文档](https://webpack.docschina.org/plugins/)

常用的 plugins：

- SplitChunkPlugin 将 chunks 相同的模块代码提取成公共 js
- CleanWebpackPlugin 清理构建目录
- MiniCssExtractPlugin 将 CSS 从 bundle 文件里提取成一个独立的 CSS 文件
- CopyWebpackPlugin 将文件或者文件夹拷贝到构建的输出目录
- HtmlWebpackPlugin 创建 html 文件去承载输出的 bundle
- UglifyjsWebpackPlugin 压缩 JS
- ZipWebpackPlugin 将打包出的资源生成一个 zip 包

```js
// 放到 plugins 数组里面就可以了
module.exports = {
    plugins: [
        new HtmlWebpackPlugin({template: './src/index.html'})
    ]
}
```



## 常用功能

### 解析 ES6

```sh
# 安装 babel 相关的包和 loader
$ npm i @babel/core @babel/preset-env babel-loader -D
```

.babelrc 用于配置 babel 解析 ES6

```json
{
	"presets": [
        "@babel/preset-env"
    ]
}
```

配置 webpack 配置文件

```js
module.exports = {
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader'}
        ]
    }
}
```

### 解析React JSX

```sh
# 安装 React
npm i react react-dom -S
npm i @babel/preset-react -D
```

.babelrc 增加react 配置

```json
{
	"presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

### 解析 CSS

需要 css-loader、style-loader，前者用于加载 .css 文件，并转换成 commonjs 对象，后者将样式通过 `<style>`标签插入到 head 中。

```sh
# 安装
$ npm i style-loader css-loader -D
```

 ```js
module.exports = {
    module: {
        rules: [
            // 顺序不能错，loader 是链式调用，执行顺序从右到左，先执行 css-loader，再执行 style-loader
            { test: /\.css$/, use: ['style-loader', 'css-loader']}
        ]
    }
}
 ```

### 解析 less

```sh
$ npm i less less-loader -D
```

```js
module.exports = {
    module: {
        rules: [
            { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']}
        ]
    }
}
```

### 解析图片、字体

解析图片的时候图片在代码里面 import 导入即可

```sh
$ npm i file-loader -D
```

```js
module.exports = {
    module: {
        rules: [
            { test: /\.(png|jpg|gif|jepg)$/, use: ['file-loader']}
        ]
    }
}
```

解析字体也是用 file-loader，使用的时候以 less 为例：

```less
@font-face {
    font-family: 'fontName';
    src: url('./font/fontName.otf') format('turetype');
}

.some-class {
    font-family: 'fontName';
}
```

```js
module.exports = {
    module: {
        rules: [
            { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader']}
        ]
    }
}
```



字体和图片的解析也可以用 url-loader，其实 url-loader 内部也用了 file-loader，可以设置较小资源自动 base64。

```sh
$ npm i url-loader -D
```

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|svg)$/,
             	use: [{
                	loader: 'url-loader',
                    options: {
                        limit: 10240 // 单位 Byte 此处是 10KB 小于这个大小的资源都会 base64 处理
                    }
                }]
            }
        ]
    }
}
```



### CSS3 属性前缀自动补齐

几种常见的前缀

- IE - Trident(-ms)
- Firefox - Geko(-moz)
- Chrome - Webkit(-webkit)
- Opeara - Presto(-o)

```css
/* 传统写法，比较麻烦 */
.box {
	-moz-border-radius: 10px;
    -webkit-border-radius: 10px;
    -o-border-radius: 10px;
    border-radius: 10px;
}
```

```sh
# 安装两个插件
$ npm i postcss-loader autoprefixer -D
```

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => {
                                require('autoprefixer')({
                                    browsers: ['last 2 version', '>1%', 'ios 7']
                                })
                            }
                        }
                    }
                ]
            }
        ]
    }
}
```



### 移动端CSS px 自动转换成 rem

传统做法是使用 @media 去做媒体查询，需要写多套适配样式的代码，比如：

```css
@media screen and (max-width: 980px) {
    .header {
        width: 900px;
    }
}
@media screen and (max-width: 480px) {
    .header {
        width: 400px;
    }
}
@media screen and (max-width: 350px) {
    .header {
        width: 300px;
    }
}
```

rem 是 font-size of the root element，是一个相对单位，而 px 是一个绝对单位

```sh
$ npm i px2rem-loader -D
# 动态计算 rem
$ npm i lib-flexble -S
```

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'px2rem-loader',
                        options: {
                            remUnit: 75,
                            rePrecision: 8
                        }
                    }
                ]
            }
        ]
    }
}
```

### 代码压缩

#### JS 压缩

webpack4 里面，内置了 uglifyjs-webpack-plugin 一般不需要额外去配置。

#### CSS 压缩

optimize-css-assets-webpack-plugin 与 cssnano

```js
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 需要先安装
module.exports = {
    mode: 'production',
	output: {
        path: path.join(__dirname, 'dist'), // 输出路径
        filename: '[name][chunkhash:8].js' // 输出 js 文件并加入了8位指纹
    },
    plugins: [
        new OptimizeCSSAssetsPlugin({
        	assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano') // npm i cssnano -D
        });
    ]
}
```

#### HTML 压缩

html-webpack-plugin

```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 需要先安装
module.exports = {
    mode: 'production',
    plugins: [
        // 一个html页面得写一个，后面对多页面打包会有优化
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/main.html'),
            filename: 'main.html',
            chunks: ['main'],
            inject: true,
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false
            }
        }),
    ]
}
```



### 自动清理构建目录产物

```sh
$ npm i clean-webpack-plugin -D
```

```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    plugins: [
        new CleanWebpackPlugin()
    ]
}
```



### 文件监听

文件监听是在发现源码发生变化时，自动重新构建出新的输出文件，但是还是每次需要手动刷新浏览器。

原理：轮询判断文件的最后编辑时间是否变化

开启监听的两种方式：

- 启动 webpack 命令时，带上 --watch 参数
- 在配置 webpack.config.js 中设置 watch: true

```js
module.exports = {
    // 默认 false，也就是不开启
	watch: true, 
    // 只有开启监听模式时，watchOptions才有意义
    watchOptions: {
        // 默认为空，不监听的文件或文件夹，支持正则匹配
        ignored: /node_modules/,
        // 监听到变化发生后会等300ms再去执行，默认300ms
        aggregateTimeout: 300,
        // 判断文件是否发生变化时通过不停询问系统指定文件有没有变化实现的，默认1000ms询问1次
        poll: 1000
    },
}
```

### 热更新

`webpack-dev-server `简称 WDS，不刷新浏览器，不输出文件，而是放在内存中，所以速度也是有优势的。

在 package.json 的 script 中加入 `dev: webpack-dev-server --open`，就可以使用 `npm run dev` 来打开项目了。

```sh
# 安装
$ npm i webpack-dev-server -D
```

配置一下插件：

```js
module.exports = {
    mode: 'development',
    plugins: [
        new webpack.HotModuleReplacementPlugin(), // 可以不加
    ],
    devServer: {
        hot: true
    }
}
```

热更新也可以使用 `webpack-dev-middleware`，简称 WDM，可以将 webpack 输出的文件传给服务器，适用于灵活的定制场景，通常需要配合 express 或者 koa 一起使用。

热更新的原理：

Webpack Dev Sever 提供：

1. Webpack Compile 将 JS 编译成 bundle.js

2. HMR Server 将热更新的文件输出给 HMR Runtime

3. Bundle Server 提供文件最终浏览器的访问

浏览器端会收到构建输出的文件 bundle.js，bundle.js 本身是不具备热更新的能力的，HotModuleReplacementPlugin 的作用就是将 HMR runtime 注入到 bundle.js，使得 bundle.js 可以和 HMR server 建立 websocket 的通信连接。

### 文件指纹

指打包后输出的文件名的后缀

- Hash 和整个项目构建相关，只要项目文件有修改，整个项目构建的 hash 值就会更改
- ChuckHash 和 webpack 打包的 chunk 有关，不同的 entry 会生成不同的 chunkhash 值（不能和热更新一起使用，一般在生成环境上使用）
- Contenthash 根据文件内容来定义 hash，文件内容不变，contenthash 不变

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 需要先安装
module.exports = {
    mode: 'production',
	output: {
        path: path.join(__dirname, 'dist'), // 输出路径
        filename: '[name][chunkhash:8].js' // 输出 js 文件并加入了8位指纹
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ MiniCssExtractPlugin.loader, 'css-loader'] // 与 style-loader 功能互斥
            },
            {
                test: /\.(png|jpg|gif|jepg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name][hash:8].[ext]'
                    }
             	}]
             }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
        	filename: '[name][contenthash:8].css' // 给 css 加指纹
        })
    ]
}
```

常用占位符名称及含义：

- [ext] 资源后缀名
- [name] 文件名称
- [path] 文件的相对路径
- [folder] 文件所在的文件夹
- [contenthash] 文件的内容 hash，默认是 md5 生成
- [hash] 文件内容的 Hash，默认是 md5 生成
- [emoji] 一个随机的指代文件内容的 emoji

### 静态资源内联

代码层面：

-  页面框架的初始化脚本
-  上报相关打点
-  css 内联避免页面闪动

请求层面：减少 HTTP 网络请求数（小图片或者字体 url-loader）

raw-loader 内联 html（比如 meta 信息）

```html
<head>
    ${require('raw-loader!./meta.html')}
</head>
```

CSS 内联

- style-loader
- Html-inline-css-webpack-plugin

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            insertAt: 'top', // 样式插入到 <head>
                            singleton: true, // 将所有的 style 标签合并成一个
                        }
                    }
                    ,
                    'css-loader',
                ]
            }
        ]
    }
}
```

### source map

通过 source map 定位到源代码，开发环境开启，线上环境关闭。线上排查问题的时候可以将 source map 上传到错误监控系统。

关键字

- eval 使用 eval 包裹模块代码
- source map 产生 .map 文件
- cheap 不包含列信息
- inline 将 .map 作为 DataURI 嵌入，不单独 生成 .map 文件
- module 包含 loader 的 sourcemap

排列组合关键字：

| devtool                        | 首次构建 | 二次构建 | 是否适合生产环境 | 可以定位的代码                         |
| ------------------------------ | -------- | -------- | ---------------- | -------------------------------------- |
| (none)                         | +++      | +++      | yes              | 最终输出的代码                         |
| eval                           | +++      | +++      | no               | Webpack  生成的代码 （一个个的模块）   |
| cheap-eval-source-map          | +        | ++       | no               | 经过 loader 转换后的代码（只能看到行） |
| cheap-module-eval-source-map   | o        | ++       | no               | 源代码（只能看到行）                   |
| eval-source-map                | --       | +        | no               | 源代码                                 |
| cheap-source-map               | +        | o        | yes              | 经过 loader 装换后的代码（只能看到行） |
| cheap-module-source-map        | o        | -        | yes              | 源代码（只能看到行）                   |
| inline-cheap-source-map        | +        | o        | no               | 经过 loader 装换后的代码（只能看到行） |
| inline-cheap-module-source-map | o        | -        | no               | 源代码（只能看到行）                   |
| source-map                     | --       | --       | yes              | 源代码                                 |
| inline-source-map              | --       | --       | no               | 源代码                                 |
| hidden-source-map              | --       | --       | yes              | 源代码                                 |

```js
module.exports = {
    devtool: 'source-map'
}
```

### 提取页面公共资源

比如在 react 开发中，react、react-dom 基础包打包的时候速度是比较慢的，所以我们可以把基础包忽略掉通过 cdn 的方式引入进来，不打包到 bundle 中。

html-webpack-externals-plugin

```sh
$ npm i html-webpack-externals-plugin -D
```

```js
const HtmlWebpackExternalesPlugin = require('html-webpack-externals-plugin')
module.exports = {
    plugins: [
        new HtmlWebpackExternalesPlugin({
            externals: [
                {
                    module: 'react',
                    // 在 html 文件中需要以 script 方式引入
                    entry: 'https://cdn.bootcdn.net/ajax/libs/react/17.0.1/cjs/react.development.min.js',
                    global: 'React'
                },
                {
                    module: 'react-dom',
                    // 在 html 文件中需要以 script 方式引入
                    entry: 'https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.1/cjs/react-dom.development.js',
                    global: 'ReactDOM'
                }
            ]
        })
    ]
}
```



webpack4 内置的 split-chunks-plugin，替代 commons-chunks-plugin，分离基础包

```js
module.exports = {
    optimization: {
        splitChunks: {
            // 默认 async 异步引入的库进行分离，initial 同步引入的库进行分离，all 所有引入的库进行分离(推荐)
            chunks: 'async',
            minSize: 30000,
            maxiSize: 0,
            minChunks: 1, // 最小引用次数
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                commons: {
                    name: 'common',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        }
    }
}
```

### Tree Shaking

uglify 阶段删除无用代码， production 模式下默认开启，代码必须是 ES6 语法，不支持 CJS。

### Scope Hoisting

不开启，构建后的代码存在大量闭包代码，会导致打包出来的体积增大，作用域变多，内存开销也会增大。

开启之后，将所有模块的代码按照引用顺序放在一个函数作用域里面，然后适当重命名一些变量以防止变量名冲突，可以减少函数声明代码和内存开销。

Webpack4 的 production 模式是默认开启的。代码必须是 ES6 语法，不支持 CJS。

### 代码分割

对于大的 web 应用来讲，将所有的代码都放在一个文件中显然是不够有效的，特别是当你的某些代码块是在某些特殊的时候才会被使用到。webpack 有一个功能就是将你的代码分割成 chunks（语块），当代码运行到需要它们的时候再进行加载。

适用场景：

- 抽离相同代码到一个共享块
- 脚本懒加载，使得初始下载的代码体积更小

使用动态 import

```sh
$ npm i @babel/plugin-syntax-dynamic-import -D
```

.babelrc 加入

```json
{
	"plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```

### Webpack 中使用 ESLint

eslint-config-airbnb

```sh
$ npm i eslint eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-ally -D
$ npm i eslint eslint-config-airbnb -D
$ npm i eslint-loader -D
$ npm i babel-eslint -D
```

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    'babel-loader',
                    'eslint-loader',
                ]
            }
        ]
    }
}
```

.eslintrc.js

```js
module.exports = {
	"parser": "babel-eslint",
    "extends": "airbnb",
    "rules": {
        "semi": "error"
    },
    "env": {
        "browser": true,
        "node": true
    }
}
```

### 构建日志显示

统计信息 stats

默认是全部打印的。

| Preset        | Alternative | Description                    |
| ------------- | ----------- | ------------------------------ |
| "errors-only" | none        | 只在发生错误时输出             |
| "minimal"     | none        | 只在发生错误或有新的编译时输出 |
| "none"        | fasle       | 没有输出                       |
| "normal"      | fasle       | 标准输出                       |
| "verbose"     | none        | 全部输出                       |

```js
module.exports = {
    mode: 'production',
    stats: 'errors-only'
}

module.exports = {
    mode: 'develoment',
    devServer: {
        stats: 'errors-only',
    }
}
```

使用 friendly-errors-webpack-plugin 优化

```sh
$ npm i friendly-errors-webpack-plugin -D
```

```js
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
module.exports = {
    plugins: [
        new FriendlyErrorsPlugin()
    ]
}
```

### webpack 配置文件设计

使用 webpack-merge 库，可以将配置文件分成三部分：开发、生产和基础配置。

webpack.config.js

```js
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const devConfig = require('./webpack.dev.config')
const proConfig = require('./webpack.pro.config')

module.exports = (env, argv) => {
  const config = argv.mode === 'development' ? devConfig : proConfig
  return merge(baseConfig, config)
}
```

- webpack.base.config.js 里面对一些通用的配置项进行配置
- webpack.dev.config.js 里面对开发模式下的一些配置项进行配置
- webpack.prod.config.js 里面对生成模式下的一些配置项进行配置

## webpack 构建速度和体积优化

### 初步分析

使用 webpack 内置的 stats 

package.json 中使用 stats，构建之后会生成一个 json 文件，不过颗粒度比较粗

```json
"script": {
    "build:stats": "webpack --config webpack.prod.js --json > stats.json"
}
```

### 使用 speed-measure-webpack-plugin 分析构建速度

speed-measure-webpack-plugin 可以看到每个 loader 和插件执行耗时。

```sh
$ npm i speed-measure-webpack-plugin -D
```



```js
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()
const webpackConfig = smp.wrap({
    plugin: [
        new MyPlugin(),
        new MyOtherPlugin()
    ]
})
```

### 使用 webpack-bundle-analyzer 分析体积

构建完成后会在 8888 端口展示大小

```sh
$ npm i webpack-bundle-analyzer -D
```



```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

modu.exports = {
    plugins: {
        new BundleAnalyzerPlugin()
    }
}
```

### 构建速度提升

首先采用高版本的 webpack 和 Node.js，比如 webpack3 升级到 webpack4，性能可以提升40% 以上。

多进程多实例构建的两种方案：

- thread-loader 每次解析一个模块，thread-loader 会将它及它的依赖分配给 worker线程中

- HappyPack 每次解析一个模块，HappyPack 会将它及它的依赖分配给 worker线程中

下面重点说一下 thread-loader 的使用

```sh
$ npm i thread-loader -D
```

```js
modu.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                    	loader: 'thread-loader',
                    	options: {
                    		workers: 3
                    	}
                    },
                    'babel-loader'
                ]
            }
        ]
    }
}
```

terser-webpack-plugin 多进程并行压缩代码

```js
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
    optimization: {
        minimizer: [
        	new TerserPlugin({
            	parallel: true
        	})
    	]
    }
}
```

进一步分包：预编译资源模块，使用 DLLPlugin

使用 DllReferencePlugin 引用 manifest.json

缓存：提升二次构建速度

- Babel-loader 开启缓存 
- terser-webpack-loader 开启缓存
- 使用 cache-loader 或者 hard-source-webpack-plugin 

```js
const HardSourcePlugin = require('hard-source-webpack-plugin')
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    'babel-loader?cacheDirectory=true'
                ]
            }
        ]
    },
    plugins: [
        new HardSourcePlugin()
    ],
     optimization: {
        minimizer: [
        	new TerserPlugin({
            	parallel: true,
                cache: true
        	})
    	]
    }
}
```

### 缩小构建目标

尽可能的少构建模块，比如 babel-loader 不解析 node_modules。

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('src'),
                use: [
                    'babel-loader'
                ]
            }
        ]
    },
	resolve: {
        alias: {
            'react': path.resolve(__dirname, ''),
            'react-dom': path.resolve(__dirname, '')
        },
        extension: ['.js'],
        mainFields: ['main']
    }
}
```
