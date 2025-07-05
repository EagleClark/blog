# Redis基础

> 首发于：2021-12-28

## NoSQL概述

意为Not Only SQL

### 为什么需要NoSQL

- High performance - 高并发读写
- Huge Storage - 海量数据的高效率存储和访问
- High Scallability && High Availablility - 高可扩展性和高可用性

### 主流NoSQL产品

- Redis
- MongoDB
- CouchDB
- Cassandra
- membase
- riak

### NoSQL数据的四大分类

- 键值(Key-Value)存储
- 列存储
- 文档数据库
- 图形数据库

![](./image/pic1.awebp)

### NoSQL的特点

- 易扩展
- 灵活的数据模型
- 大数据量，搞性能
- 高可用

## Redis概述

高性能键值对数据库，2009年开发，新浪微博，知乎网，GitHub，Stack Overflow，VMware等都在使用。C语言编写。

### 支持的数据类型

- 字符串(String)
- 列表(List)
- 有序集合(sorted  set)
- 集合(set)
- 散列(hash)

### 应用场景

- 缓存
- 任务队列
- 网站访问统计
- 数据过期处理
- 分布式集群架构中的session分离

## Redis的安装

上官网 [https://redis.io/download](https://redis.io/download) 

[Windows版下载链接(官网上没有)](https://github.com/microsoftarchive/redis/tags)

一般来说 Redis 都是在 Linux 下环境下运行，在 Windows 环境下性能会差很多，所以这里我使用的是 Ubuntu 系统来进行安装。

按照要求执行下载和制作操作，例如：

```sh
$ wget http://download.redis.io/releases/redis-5.0.5.tar.gz
$ tar xzf redis-5.0.5.tar.gz
$ cd redis-5.0.5
$ make
```

安装完成之后可以，测试一下

```sh
$ make test
```

输入下面命令来启动redis服务（前端启动）

```sh
$ src/redis-server
```

前端启动方式对于我们测试是否安装成功，或者临时使用是没有问题的，但是对于生产环境就最好是使用后端启动了，下面我们先 Ctrl + c 退出前端启动，输入下面命令来修改一下配置文件

```sh
$ vim redis.conf
```

按 `i` 进入编辑模式

找到 `daemonzie no` ，将其改为 `daemonize yes`

按 `Esc`，然后输入 `:wq` ，再回车保存

输入下面命令，加载配置文件运行

```sh
$ src/redis-server ./redis.conf
```

这时不出意外redis就已经启动起来了，可以执行下面的命令查找redis进程

```sh
$ ps -ef | grep -i redis
```

另一种后台启动的方式是

```sh
$ src/redis-server &
```

执行下面命令可以停止redis服务

```sh
$ src/redis-cli shutdown
```

开启redis之后，输入下面命令就可以连接redis服务了

```sh
$ src/redis-cli
```

避免中文乱码方法

```sh
$ src/redis-cli --raw
```

开启远程访问方法

```sh
$ vim redis.conf
```

行首添加“#” 注释掉 bind 内容

修改 `protect-mode yes` 为 `protect-mode no`

如果需要添加密码 将 `# requirepass` 前面的 “#” 删除

连接远程redis库，命令

```sh
$ redis-cli -h host -p port -a password
```

### Mac 安装

```sh
# 更新 brew 的镜像地址
$ cd "$(brew --repo)"
$ git remote set-url origin https://mirrors.ustc.edu.cn/brew.git
$ cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
$ git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git

# 输入之后 cmd 窗的标题会一直闪，持续几分钟直到更新完毕
$ brew update

# 安装
$ brew install redis

# 启动服务的一种方法
$ brew services start redis

# 配置文件位置 /usr/local/etc/redis.conf

# 启动服务并使用配置文件
# 首先进入安装目录
$ cd /usr/local/bin/
# 启动服务，之后会出现一个经典的 redis 图标
$ redis-server /usr/local/etc/redis.conf

# 其实下面命令也能直接启动redis服务
$ redis-server

# 启动 redis 客户端
$ redis-cli
# 代参数的连接
$ redis-cli -h 127.0.0.1 -p 6379 -n 0 -a pwd
# 可以用下面命令查看
$ redis-cli --help
```


## Redis数据结构

### 字符串(String)

Key-Value结构，注意：key定义不要过长，尽量不要超过1024 byte 否则会降低查询效率、消耗内存；也不要过短，会降低可读性；最好有统一的命名规范。

String类型是按照二进制存储的，Value最大长度为512MB

```sh
# 赋值
set key value

# 取值
get key 

# 取值赋值，先获取值再设置值
getset key value

# 删除值
del key

# incr 给一个值加1，如果不能转为整型就报错，如果没有这个key就先置为0，再加1，其它的直接加1
incr key

# decr 给一个值减1，如果不能转为整型就报错，如果没有这个key就先置为0，再减1，其它的直接减1
decr key

# incrby 给指定key加一个数(num)
incrby key num

# decrby 给指定key减一个数(num)
decrby key num

# append 在原值上追加一个字符串，并返回value的长度
append key string
```

### 哈希(Hash)

String Key与String Value的Map容器；每一个哈希可以存储4294967295个键值对；

```sh
# 赋值
hset key value-field value-value

hset myhash username Jack
hset myhash age 20

# 赋值多个键值对
hmset key value-field1 value-value1 value-field2 value-value2 ...

hmset myhash2 username Rose age 18

# 取值
hget key value-field

hget myhash username

# 获取多个属性的值
hmget key value-field1 value-field2

hmget myhash2 username age

# 获取所有属性值
hgetall key

hgetall myhash

# 删除一个或多个字段
hdel key value-field1 value-field2 ...

hdel myhash2 username age

# 删除键
del key

# 增加数字
hincrby key value-field num

hincrby myhash age 5

# 判断一个属性是否存在
hexists key value-field

hexists myhash username

# 获取字段长度
hlen key

hlen myhash

# 获取所有字段名称
hkeys key

hkeys myhash

# 获取所有的值
hvals key

hvals myhash
```

### 列表(List)

按照插入顺序排列的链表，两端插入数据效率高，中间插入数据效率最低。

`ArrayList` 使用数组方式存储数据

`LinkedList` 使用双向链接方式存储数据

```C
# 左端添加
lpush key value... 

lpush mylist a b c

# 右端添加
rpush key value... 

# 查看链表数据，0为开端，-1为结尾
lrange key start end

lrange mylist 0 3

# 左端弹出
lpop key

lpop mylist

# 右端弹出
rpop key

rpop mylist2

# 获取list长度
llen key

llen mylist

# 左端添加(仅存在key时添加)
lpushx key value...

lpushx mylist c d
lpushx mylist3 c d

# 右端添加(仅存在key时添加)
rpushx key value...

rpushx mylist2 c d
rpushx mylist3 c d

# 左端移除key中count个值为value的元素，count为正从左开始count个，count为负右端开始count个，为0则全部移除
lrem key count value

lrem mylist 0 a

# 在指定位置设置值
lset key index value

lset mylist 0 x

# 插入数据
linsert key before value newValue
linsert key after value newValue

linsert mylist before x xbefore
linsert mylist after x xafter

# 从key1一个弹出并添加到key2中，常用于消息队列
rpoplpush key1 key2

rpoplpush mylist mylist2
```

### Set(集合)

和List类型有相似的结构，但是和List不同的是Set中不能出现重复的元素。

可包含的最大元素数量为4294967295

```sh
# 添加元素
sadd key value...

sadd myset a b c

# 删除元素
srem key value...

srem myset a b

# 查看值
smembers key

smembers myset

# 判断一个值是否存在，返回1存在，0则不存在
sismember key value

sismenber myset a

# 集合的差集运算
sdiff key1 key2

sadd a1 a b c
sadd b1 a c 1 2
sdiff a1 b1 // 返回b

# 集合的交集运算
sinter key1 key2

sadd a2 a b c
sadd b2 a c 1 2
sinter a2 b2 // 返回a c

# 集合的并集运算
sunion key1 key2

sadd a3 a b c
sadd b3 a c 1 2
sunion a3 b3 // 返回a c 2 b 1

# 获取一个key中值的数量
scard key

scard a1

# 随机返回一个key中的元素
srandmember key

srandmember a1

# 把key2 key3的差集存到key1中
sdiffstore key1 key2 key3

sdiffstore mys a1 b1

# 把key2 key3的交集存到key1中
sinterstore key1 key2 key3

sinterstore mys2 a2 b2

# 把key2 key3的并集存到key1中
sunionstore key1 key2 key3

sunionstore mys3 a3 b3
```

### Sorted-Set(有序集合)

与Set类似，但是是有序的，每个元素都有一个分数，元素在各个位置的查找、删除等操作都很快速。

```sh
# 添加元素
zadd key score value

zadd mysort 70 zs 80 ls 90 ww 

# 获取分数
zscore key value

zscore mysort zs

# 获取成员数量
zcard key

zcard mysort

# 删除指定元素
zrem key value...

zrem mysort ww

# 范围查找
zrange key start end [withscores]

zrange mysort 0 -1
zrange mysort 0 -1 withscores

# 从大到小排序的范围查找
zrevrange key start end [withscores]

zrevrange mysort 0 -1
zrevrange mysort 0 -1 withscores

# 按照范围删除
zremrangebyrank key start end

zremrangebyrank mysort 0 3

# 按照分数范围删除
zremrangebyscore key start end

zadd mysort 70 zs 80 ls 90 ww
zremrangebyscore mysort 70 80

# 按照分数范围进行查询
zrangebyscore key start end [withscores] [limit start count]

zrangebyscore mysort 70 100
zrangebyscore mysort 70 100 withscores limit 0 1

# 给指定成员增加分数
zincrby key score value

zincrby mysort 3 ls

# 获取某个分数范围内成员的数量
zcount key start end

zcount mysort 70 90
```

## key的通用操作

```sh
# 查询所有key
keys *

# 查看某个key，？为通配符
keys my?
keys my????

# 删除key 
del key...

del my1 my2 my3

# 判断一个key是否存在，0不存在，1存在
exists key

exists my1

# 重命名key
rename oldkey newkey

rename a b

# 设置key的过期时间，以秒为单位，过期之后该key就不存在了
expire key seconds

expire b 1000

# 查看key剩余的超时时间
ttl key

ttl b

# 获得key的类型
type key

type mylist
type myhash
```

## Redis的特性

### 多数据库

最多可以提供16个数据库，默认连接0号数据库。

```sh
# 选择数据库
select dbIndex

select 1
select 0

# 把一个key从一个数据库移动到另一个数据库
move key dbIndex

move mys 1
```

### 事务

与SQL中的事务类似

- multi 开启事务
- exec 提交事务
- discard 回滚事务

```sh
# 设置一个num，值为1
set num 1
# 开启事务
multi
# 给num加1，此时去get num ，num还为1
incr num 
# 执行事务，此时去get num ，num为2
exec
```

```sh
# 设置一个user，值为Jack
set user Jack
# 开启事务
multi
# 把Jack，改为Tom
set user Tom
# 回滚事务，此时还为Jack
discard
```

## Redis的持久化

把内存中的数据存储到硬盘上，保证数据不丢失，这就是持久化操作。

### RDB

默认支持，不需要配置。在指定的时间间隔内，将内存中的数据集快照写入到磁盘。

#### 优势

- 只有一个文件，对于文件备份比较方便
- 性能高

#### 劣势

- 高可用性不好，比如每30秒写一次数据，那么就有可能丢掉一部分数据
- 才用fork方式，由子进程存储数据，如果数据集过大可能会导致整个服务停止几百毫秒甚至是1秒

#### 配置

```sh
# 打开配置文件
$ vim redis.conf

# 配置持久化频率
save 900 1 # 每900秒至少有1个key发生变化就持久化1次
save 300 10 # 每300秒至少有10个key发生变化就持久化1次
save 60 10000 # 每60秒至少有10000个key发生变化就持久化1次

# 配置存储文件名
dbfilename dump.rdb

# 配置保存的路径
dir ./
```

### AOF

以日志的形式记录服务器的每一个操作。

#### 优势

- 更高的数据安全性，可以配置修改就同步
- 拥有记录了所有操作的日志文件

#### 劣势

- 文件大
- 同步效率低

#### 配置

```sh
# 打开配置文件
$ vim redis.conf

# 开启
appendonly no 改为 appendonly yes

# 配置存储文件名
appendfilename "appendonly.aof"

# 配置同步策略
# appendfsync always 修改就同步
appendfsync everysec 每秒同步
# appendfsync no 不同步
```

```sh
# 清空数据库
flushall

# 查看数据库大小
dbsize
```

## redis-benchmark
Redis自带的性能测试工具

```sh
$ src/redis-benchmark

$ src/redis-benchmark [-h <host>] [-p <port>] [-c <clients>] [-n <requests>] [-k <boolean>]

-h <hostname>      Server hostname (default 127.0.0.1)
-p <port>          Server port (default 6379)
-s <socket>        Server socket (overrides host and port)
-a <password>      Password for Redis Auth
-c <clients>       Number of parallel connections (default 50)
-n <requests>      Total number of requests (default 100000)
-d <size>          Data size of SET/GET value in bytes (default 3)
--dbnum <db>       SELECT the specified db number (default 0)
-k <boolean>       1=keep alive 0=reconnect (default 1)
-r <keyspacelen>   Use random keys for SET/GET/INCR, random values 
                   for SADD Using this option the benchmark will 
                   expand the string __rand_int__ inside an argument 
                   with a 12 digits number in the specified range from
                   0 to keyspacelen-1. The substitution changes every 
                   time a command is executed. Default tests use this 
                   to hit random keys in the specified range.
-P <numreq>        Pipeline <numreq> requests. Default 1 (no pipeline).
-e                 If server replies with errors, show them on stdout.
                    (no more than 1 error per second is displayed)
-q                 Quiet. Just show query/sec values
--csv              Output in CSV format
-l                 Loop. Run the tests forever
-t <tests>         Only run the comma separated list of tests. The test
                    names are the same as the ones produced as output.
-I                 Idle mode. Just open N idle connections and wait.

Examples:

Run the benchmark with the default configuration against 127.0.0.1:6379:
$ redis-benchmark

Use 20 parallel clients, for a total of 100k requests, against 192.168.1.1:
$ redis-benchmark -h 192.168.1.1 -p 6379 -n 100000 -c 20

Fill 127.0.0.1:6379 with about 1 million keys only using the SET test:
$ redis-benchmark -t set -n 1000000 -r 100000000

Benchmark 127.0.0.1:6379 for a few commands producing CSV output:
$ redis-benchmark -t ping,set,get -n 100000 --csv

Benchmark a specific command line:
$ redis-benchmark -r 10000 -n 10000 eval 'return redis.call("ping")' 0

Fill a list with 10000 random elements:
$ redis-benchmark -r 10000 -n 10000 lpush mylist __rand_int__

On user specified command lines __rand_int__ is replaced with a random integer with a range of values selected by the -r option.
```

## Nodejs 操作 Redis

官网上提供了各种语言访问 redis 的方法，大家可以看 https://redis.io/[clients](https://redis.io/clients) ，这里我们使用 nodejs 来连接 redis。官方推荐使用的是 node_redis

首先，我们来安装 nodejs 的 redis 包：

```sh
$ npm install redis
```

安装成功之后就可以进行redis库的连接了，创建连接的方法有下面几种：

```javascript
// 连接本地默认端口且无密码redis
const redis = require('redis');
const client = redis.createClient();
```

```javascript
// 连接远程无密码redis
const redis = require('redis');
const client = redis.createClient(6379, '10.211.55.12');
```

```javascript
// 如果redis开启了密码认证
const redis = require('redis');
const client = redis.createClient(6379, '10.211.55.12');
client.auth('password', function(err, reply) {
    console.log(reply);
});
```
