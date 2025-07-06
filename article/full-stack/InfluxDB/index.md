# InfluxDB基础

> 首发于：2021-12-30

## 概述

### 什么是 InfluxDB

`InfluxDB` 是一个由 `InfluxData` 公司开发的开源时序数据库。它由 `Go` 语音写成，着力于高性能地查询与存储时序型数据。`InfluxDB` 被广泛应用于存储系统的监控数据，`IoT` 行业的实时数据等场景。

同为时序数据库的还有 `OpenTSDB（基于 HBase）`、`TimeScaleDB（基于 PostgreSQL）`、`KairosDB（基于 Cassandra）` 等。不过目前 `InfluxDB` 还是 `No.1`。

[官网链接](https://www.influxdata.com/)

**注意：我学习用的是 Mac 版本的 `influxdb2-2.1.1-darwin-amd64` 2.x 版本和 1.x 版本有一些不一样。**

### 主要特性

- 高性能读、高性能写
- 压缩存储
- 实时计算能力强
- 2.x 版本的语法使用的是类似 JavaScript（1.x 则使用的是类 SQL 查询语句的操作接口）
- 支持基于 HTTP 的数据插入与查询
- 无需任何外部依赖即可独立部署

### InfluxDB 数据模型

学过 `MySQL` 等关系型数据库的小伙伴肯定都知道数据库有：表（Table）、记录（Record）、字段（Field）等概念，而 InfluxDB 的数据模型则有一些不同。

#### Organization

`Organization` 意为组织，简写为 `Org`，是一个比 Database 更上层的一个层级。

#### Buckets

`Buckets` 意为桶，类似于关系型数据库的数据库（Database）的概念。

#### Measurement

`Measurement` 意为度量，类似于关系型数据中的表（Table）的概念。其主键索引总是时间戳

#### Point

`Point` 意为点，类似于关系型数据库中的记录（Record）的概念，一个 `Measurement` 中可以有很多个 `Point`

#### Tags

`Tags` 意为标签，是维度列、索引列，类似于关系型数据中加了索引的列。

#### Field

`Field` 是数据列、普通列，类似于关系型数据库中的普通字段，未设置任何索引。

## 安装

### 安装包获取

直接去[官网](https://portal.influxdata.com/downloads/)获取安装包，按照官方给的指引就可以下载并安装了：

![](./image/pic1.webp)

### 运行

按照官方文档解压之后，进入到解压目录，输入下面命令运行：

```sh
./influxd
```

然后直接访问 [http//:localhost:8086](http//:localhost:8086)，打开网页，第一次可能需要进行一些配置，比如：用户名、密码、组织名、公司名等，配置完后就可以进入数据库了，如下图所示：

![](./image/pic2.webp)

Data 页签的 Client Libraries 里面点击去可以看到各种语言，如何与 InfluxDB 交互。

Explore 页签可以选择数据库，然后进行数据的可视化查询。

### 安装 CLI 客户端

参考[官方文档](https://docs.influxdata.com/influxdb/v2.1/tools/influx-cli/)

这里我直接根据官网指引，下载了安装包，然后执行下面命令解压：

```sh
tar zxvf ~/Downloads/influxdb2-client-2.2.0-darwin-amd64.tar.gz
```

然后再执行下面命令运行（你将会看到更多的命令，再去查官方文档如何使用）：

```sh
./influx 
```

## 基本操作简介（以 Node.JS 为例）

因为我是搞前端的，所以代码上使用 Node.JS 来与 InfluxDB 进行交互。

### 安装依赖库

```sh
npm i @influxdata/influxdb-client
```

### 写数据

```js
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// 可以在 "API Tokens" 页签中找到或者生成你的 token
const token = 'TDZMX_ahKfH5wpfsIcYcXQz36B92uc1yDb4Jwc6cVCSI9VSptEiclhzgN-3rBkPqd7JlixEHBgntBf0z7mRtKg==';
// 组织名称，与第一次运行的时候配置的保持一致
const org = 'InfluxData';
// 桶名，也就是数据库名
const bucket = 'telegraf';
// 初始化客户端
const client = new InfluxDB({ url: 'http://localhost:8086', token: token });
// 获取写数据的 API 
const writeApi = client.getWriteApi(org, bucket);
// 配置索引，以 key-value 的形式，可以是多个
writeApi.useDefaultTags({ key1: 'value1', key2: 'value2' });
// 创建一条记录，mem 是度量名称，如果没有会被自动创建
// 存什么类型的数据就用什么 API 比如 stringField intField uintField booleanField 等
// used_percent 是字段名称
const point = new Point('mem1').floatField('used_percent', 25.43234543);
// 写入
writeApi.writePoint(point);

writeApi
  .close()
  .then(() => {
    console.log('FINISHED')
  })
  .catch(e => {
    console.error(e)
    console.log('Finished ERROR')
  });
```

多写入几个数据之后可用使用 UI 查询一下：

![](./image/pic3.webp)

### 查数据

```js
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// 可以在 "API Tokens" 页签中找到或者生成你的 token
const token = 'TDZMX_ahKfH5wpfsIcYcXQz36B92uc1yDb4Jwc6cVCSI9VSptEiclhzgN-3rBkPqd7JlixEHBgntBf0z7mRtKg==';
// 组织名称，与第一次运行的时候配置的保持一致
const org = 'InfluxData';
// 桶名，也就是数据库名
const bucket = 'telegraf';
// 初始化客户端
const client = new InfluxDB({ url: 'http://localhost:8086', token: token });
// 获取查询 API
const queryApi = client.getQueryApi(org);
// 创建查询字符串，查询语法是 InfluxDB 特有的
const query = `from(bucket: "telegraf")
|> range(start: -3h)
|> filter(fn: (r) => r["_measurement"] == "mem")
|> filter(fn: (r) => r["_field"] == "used_percent")
|> filter(fn: (r) => r["key1"] == "value1")
|> filter(fn: (r) => r["key2"] == "value2")
|> yield(name: "mean")`;

queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row);
    console.log(`${o._time} ${o._measurement}: ${o._field}=${o._value}`);
  },
  error(error) {
    console.error(error);
    console.log('Finished ERROR');
  },
  complete() {
    console.log('Finished SUCCESS');
  },
});
```

打印内容：

```
2021-12-29T12:37:33.618778898Z mem: used_percent=27.43234543
2021-12-29T12:38:50.842820272Z mem: used_percent=25.43234543
2021-12-29T14:31:33.595348081Z mem: used_percent=27.43234543
```

上述查询语法如果不清楚，可用借助 UI 查询，然后再切换到 `Script Editor` 辅助生成。

![](./image/pic4.webp)


![](./image/pic5.webp)

### 删除数据

官方没有直接提供 Node API 进行数据删除，不过可以使用 HTTP API 进行删除：

```
curl --location --request POST 'http://localhost:8086/api/v2/delete?org=InfluxData&bucket=telegraf' \
--header 'Authorization: Token TDZMX_ahKfH5wpfsIcYcXQz36B92uc1yDb4Jwc6cVCSI9VSptEiclhzgN-3rBkPqd7JlixEHBgntBf0z7mRtKg==' \
--header 'Content-type: application/json' \
--header 'Cookie: csrfToken=zDBwa0_FxHN4Q409nDwoVYX5' \
--data-raw '{
  "predicate": "key1=\"value1\" and key2=\"value2\"",
  "start": "2021-12-28T14:15:22Z",
  "stop": "2021-12-29T14:15:22Z"
}'
```


### 修改数据

不能修改数据

### 数据保留策略

数据保留策略（Retention Policies），简称 RP，因为 InfluxDB 每秒可以处理成千上万条数据，要将这些数据全部保存下来会占用大量的存储空间，有时我们可能并不需要将所有历史数据进行存储，因此我们就需要使用 RP，用来让我们自定义数据保留的时间。

RP 默认都是 `Forcever`，也就是不删除任何数据。可以在 UI 上进行配置：

![](./image/pic6.webp)

## 更多文档

[InfluxDB v2.1 API documentation (influxdata.com)](https://docs.influxdata.com/influxdb/v2.1/api/)

[influxdb-client-js | InfluxDB 2.0 JavaScript client (JS Client 的 API)](https://influxdata.github.io/influxdb-client-js/influxdb-client.html)

[Query InfluxDB with Flux | InfluxDB Cloud Documentation (InfluxDB 的查询语法)](https://docs.influxdata.com/influxdb/cloud/query-data/get-started/query-influxdb/)
