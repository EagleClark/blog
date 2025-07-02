# 跳表（Skip List）

>  首发于：2020-08-03

## 概念

我们只需要对链表稍加改造，就可以支持类似“二分”的查找算法。我们把改造之后的数据结构叫做跳表（Skip list）。

每两个结点提取一个结点到上一级，我们把抽出来的那一级叫做索引或索引层。如下图所示，图中的 down 表示 down 指针，指向下一级结点。

![](./image/pic1.image)

下图是一个多级索引，遍历的效率会更高。

![](./image/pic2.image)

跳表这种数据结构对你来说，可能会比较陌生，因为一般的数据结构和算法书籍里都不怎么会讲。但是它确实是一种各方面性能都比较优秀的动态数据结构，可以支持快速地插入、删除、查找操作，写起来也不复杂，甚至可以替代红黑树（Red-black tree）。Redis 中的有序集合（Sorted Set）就用到了跳表。

## JavaScript实现

```js
// 跳表索引最大级数
const MAX_LEVEL = 16

/**
 * 辅助实现跳表功能，类似链表中的节点
 * @class
 */
class Node {
    constructor(data) {
        // 存放数据的属性
        this.data = data === undefined ? -1 : data
        // 当前节点处于整个跳表索引的级数
        this.maxLevel = 0
        // 表示下一个节点是什么
        // 用数组来表示是因为在不同的索引层级该节点的下一个节点不一样
        this.refer = new Array(MAX_LEVEL)

    }
}

/**
 * 跳表类
 * @class
 */
class SkipList {
    constructor() {
        // 当前跳表索引的总级数
        this.levelCount = 1
        // Node类实例，指向整个链表的开始
        this.head = new Node()
    }

    /**
     * 在跳表插入数据的时候，随机生成索引的级数
     */
    static randomLevel() {
        let level = 1
        for (let i = 0; i < MAX_LEVEL; i++) {
            if (Math.random() < 0.5) {
                // 50% 的概率，保证每一级索引节点的数量大概是上一级索引节点的2倍
                level++
            }
        }
        return level
    }

    /**
     * 向跳表里面插入数据
     * 跳表插入数据的时候索引是随机插入的
     * @param {*} value 数据
     */
    insert(value) {
        // 生成随机索引级数
        const level = SkipList.randomLevel()
        // 创建新节点
        const newNode = new Node(value)
        // 设置索引级数
        newNode.maxLevel = level
        // 创建一个长度为 level 且每个元素都是一个 Node 实例的数组，用于存放待更新的节点
        const update = new Array(level).fill(new Node())
        // 把当前节点设置为起始节点，因为要从头开始遍历
        let p = this.head
        // 循环每一个索引层级
        for (let i = level - 1; i >= 0; i--) {
            while (p.refer[i] !== undefined && p.refer[i].data < value) {
                // 找到当前节点应该插入到的位置的前一个位置
                p = p.refer[i]
            }
            // 把找到的位置赋值给update，作为待更新的节点
            update[i] = p
        }
        // 循环每一个索引层级
        for (let i = 0; i < level; i++) {
            // 把新节点的下一个节点设置为上一个节点的原下一个节点
            newNode.refer[i] = update[i].refer[i]
            // 把当前节点设置为上一个节点的新下一个节点
            update[i].refer[i] = newNode
        }
        // 更新跳表所以层级计数
        if (this.levelCount < level) {
            this.levelCount = level
        }
    }

    /**
     * 查找跳表里面的某个数据节点，并返回
     * @param {*} value 数据
     * @returns {*}
     */
    find(value) {
        if (!value) {return null}
        let p = this.head
        // 快速查找到距离目标节点最近的节点                     
        for (let i = this.levelCount - 1; i >= 0; i--) {
            // 从上到下查找节点
            while (p.refer[i] !== undefined && p.refer[i].data < value) {
                p = p.refer[i]
            }
        }

        if (p.refer[0] !== undefined && p.refer[0].data === value) {
            return p.refer[0]
        }
        return null
    }

    /**
     * 移除节点
     * @param {*} value 数据
     * @returns {*}
     */
    remove(value) {
        let _node
        let p = this.head
        const update = new Array(new Node())
        // 找到需要更新的节点，也就是被删除节点的上一个节点
        for (let i = this.levelCount - 1; i >= 0; i--) {
            while (p.refer[i] !== undefined && p.refer[i].data < value) {
                p = p.refer[i]
            }
            update[i] = p
        }
        if (p.refer[0] !== undefined && p.refer[0].data === value) {
            _node = p.refer[0];
            // 将当前节点删除之后对他前一个节点的下一个节点需要做一些修改
            for (let i = 0; i <= this.levelCount - 1; i++) {
                if (update[i].refer[i] !== undefined && update[i].refer[i].data === value) {
                    // 把要移除节点的上一个节点的下一个节点更新为要移除节点的下一个节点
                    update[i].refer[i] = update[i].refer[i].refer[i]
                }
            }
            return _node
        }
        return null
    }

    /**
     * 打印所有节点
     */
    printAll() {
        let p = this.head;
        while (p.refer[0] !== undefined) {
            console.log(p.refer[0].data)
            p = p.refer[0]
        }
    }
}

test();
function test() {
    let list = new SkipList();
    let length = 20000;
    //顺序插入
    for (let i = 1; i <= 10; i++) {
        list.insert(i);
    }
    //输出一次
    list.printAll();
    console.time('create length-10')
    //插入剩下的
    for (let i = 11; i <= length - 10; i++) {
        list.insert(i);
    }
    console.timeEnd('create length-10')
    //搜索 10次
    for (let j = 0; j < 10; j++) {
        let key = Math.floor(Math.random() * length + 1);
        console.log(key, list.find(key))
    }
    //搜索不存在的值
    console.log('null:', list.find(length + 1));
    //搜索5000次统计时间
    console.time('search 5000');
    for (let j = 0; j < 5000; j++) {
        let key = Math.floor(Math.random() * length + 1);
    }
    console.timeEnd('search 5000');
}
```
