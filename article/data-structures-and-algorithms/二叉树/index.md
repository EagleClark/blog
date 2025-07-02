# 二叉树（Binary Tree）

>  首发于：2020-08-23

## 树（Tree）

如下图所示：

![](./image/pic1.image)


比如下面一幅图，A 节点就是 B 节点的`父节点`，B 节点是 A 节点的`子节点`。B、C、D 这三个节点的父节点是同一个节点，所以它们之间互称为`兄弟节点`。我们把没有父节点的节点叫做`根节点`，也就是图中的节点 E。我们把没有子节点的节点叫做`叶子节点`或者`叶节点`，比如图中的 G、H、I、J、K、L 都是叶子节点
![](./image/pic2.image)

关于树的三个概念：高度（Height）、深度（Depth）、层（Level）

- 节点的高度 = 节点到子叶节点的最长路径（边数）
- 节点的深度 = 根节点到这个节点所经历的边的个数
- 节点的层数 = 节点的深度 + 1
- 树的高度 = 根节点的高度

![](./image/pic3.image)

## 二叉树（Binary Tree）

我们最常用的树还是二叉树，二叉树，顾名思义，每个节点最多有两个“叉”，也就是两个子节点，分别是`左子节点`和`右子节点`。不过，二叉树并不要求每个节点都有两个子节点，有的节点只有左子节点，有的节点只有右子节点。

编号 2 的二叉树中，叶子节点全都在最底层，除了叶子节点之外，每个节点都有左右两个子节点，这种二叉树就叫做`满二叉树`。

编号 3 的二叉树中，叶子节点都在最底下两层，最后一层的叶子节点都靠左排列，并且除了最后一层，其他层的节点个数都要达到最大，这种二叉树叫做`完全二叉树`。

什么是完全二叉树可能不是那么好理解，所以我们要先看一下，二叉树的存储方式以便于我们来理解它。

![](./image/pic4.image)

![](./image/pic5.image)

### 存储

#### 链式存储法

每个节点有三个字段，其中一个存储数据，另外两个是指向左右子节点的指针。我们只要拎住根节点，就可以通过左右子节点的指针，把整棵树都串起来。这种存储方式我们比较常用。大部分二叉树代码都是通过这种结构来实现的。

![](./image/pic6.image)


#### 顺序存储法

如果节点 X 存储在数组中下标为 i 的位置，下标为 2 * i 的位置存储的就是左子节点，下标为 2 * i + 1 的位置存储的就是右子节点。反过来，下标为 i/2 的位置存储就是它的父节点。通过这种方式，我们只要知道根节点存储的位置（一般情况下，为了方便计算子节点，根节点会存储在下标为 1 的位置），这样就可以通过下标计算，把整棵树都串起来。

![](./image/pic7.image)


不过，我刚刚举的例子是一棵完全二叉树，所以仅仅“浪费”了一个下标为 0 的存储位置。如果是非完全二叉树，其实会浪费比较多的数组存储空间。你可以看我举的下面这个例子。

![](./image/pic8.image)


所以，如果某棵二叉树是一棵完全二叉树，那用数组存储无疑是最节省内存的一种方式。因为数组的存储方式并不需要像链式存储法那样，要存储额外的左右子节点的指针。这也是为什么完全二叉树会单独拎出来的原因，也是为什么完全二叉树要求最后一层的子节点都靠左的原因。

堆其实就是一种完全二叉树，最常用的存储方式就是数组。

### 遍历

![](./image/pic9.image)

- 前序遍历是指，对于树中的任意节点来说，先打印这个节点，然后再打印它的左子树，最后打印它的右子树。
- 中序遍历是指，对于树中的任意节点来说，先打印它的左子树，然后再打印它本身，最后打印它的右子树。
- 后序遍历是指，对于树中的任意节点来说，先打印它的左子树，然后再打印它的右子树，最后打印这个节点本身。

从我前面画的前、中、后序遍历的顺序图，可以看出来，每个节点最多会被访问两次，所以遍历操作的时间复杂度，跟节点的个数 n 成正比，也就是说二叉树遍历的时间复杂度是 O(n)。

- 前驱节点：二叉树进行中序遍历，遍历后的顺序，当前节点的前一个节点为该节点的前驱节点。

- 后继节点：二叉树进行中序遍历，遍历后的顺序，当前节点的后一个节点为该节点的后继节点。

## 二叉查找树（Binary Search Tree）

二叉查找树是二叉树中最常用的一种类型，也叫二叉搜索树、二叉排序树。顾名思义，二叉查找树是为了实现快速查找而生的。不过，它不仅仅支持快速查找一个数据，还支持快速插入、删除一个数据。

二叉查找树要求，在树中的任意一个节点，其左子树中的每个节点的值，都要小于这个节点的值，而右子树节点的值都大于这个节点的值。

![](./image/pic10.image)


极度不平衡的二叉查找树可能会退化为链表，查找的时间复杂度就变成了 O(n)，而平衡二叉树插入、删除、查找操作的时间复杂度也比较稳定，是 O(logn)。

下面是 JavaScript 实现：

```js
/**
 * @class
 * 二叉树的节点
 */
class Node {
    constructor(data) {
        this.data = data
        this.left = null
        this.right = null
    }
}

/**
 * @class
 * 二叉搜索树
 * 允许插入重复值，会插入到右节点，查找和删除的时候不会进行
 */
class BinarySearchTree {
    constructor() {
        this.root = null
    }

    /**
     * 插入节点，相等会被插入到右节点
     * @param {*} data 数据
     */
    insert(data) {
        let node = new Node(data)

        // 判断是否是根节点
        if (this.root === null) {
            this.root = node
            return
        }

        // 节点的插入位置，节点被插入到哪个节点之上
        let insertPosition = this.root
        while (true) {
            if (insertPosition.data <= data) {
                // 比根节点大或者相等，需要继续判断右节点
                if (insertPosition.right === null) {
                    // 没有右节点，插入的节点就是右节点
                    insertPosition.right = node
                    return
                }
                // 有右节点继续递归，去右节点进行比较大小
                insertPosition = insertPosition.right
            } else {
                // 比根节点小
                if (insertPosition.left === null) {
                    // 没有左节点，插入的节点就是左节点
                    insertPosition.left = node
                    return
                }
                // 有左节点继续递归，去左节点进行比较大小
                insertPosition = insertPosition.left
            }
        }
    }

    /**
     * 查找一个数据在哪个节点
     * @param {*} data 数据 
     */
    find(data) {
        let node = this.root
        while (node !== null) {
            if (node.data < data) {
                node = node.right
            } else if (node.data > data) {
                node = node.left
            } else {
                // node.data 与 data 相等的情况
                return node
            }
        }
        return null
    }

    /**
     * 删除节点
     * @param {*} data 数据
     */
    delete(data) {
        // 要删除的节点，初始化为根节点
        let node = this.root
        // 要删除节点的父节点
        let parentNode = null

        // 查找一个节点的父节点
        while (node !== null && node.data !== data) { 
            // 如果 node.data 与 data 相等说明已经找到了该节点而不是该节点的父节点
            parentNode = node

            if (node.data < data) {
                node = node.right
            } else {
                node = node.left
            }
        }
        if (node === null) {
            // 没找到这个节点，无法进行删除，直接返回
            return
        }

        if (node.left !== null && node.right !== null) {
            // 左右节点都不为空
            // 需要找到右子树中最小的节点，那么这个节点是肯定没有左节点的
            // 找到这个节点之后要用它来替换当前节点，再把该节点删除

            // 右子树中最小的节点
            let minRightNode = node.right
            // 右子树中最小的节点的父节点
            let minParentRightNode = node
            while (minRightNode.left !== null) {
                // 一直循环到左节点为空才会停止，这样能找到最小节点
                minParentRightNode = minRightNode
                minRightNode = minRightNode.left
            }

            // 用最小节点的数据替换要删除节点的数据
            node.data = minRightNode.data
            // 此时相当于已经完成了 node 的删除，但是 minRightNode 却还没有被删除
            // 所以下面就把 node 替换成 minRightNode，parentNode 替换成 minParentRightNode
            // 因为 minRightNode 最多只有一个节点，所以用下面的代码就可以去完成 minRightNode 的删除
            node = minRightNode
            parentNode = minParentRightNode
        }

        // 删除的节点为叶子节点或者只有一个节点
        // 只需要把父节点的指向进行修改即可
        // node 的子节点
        let childNode
        if (node.left !== null) {
            // 左节点不为空就把子节点设为左节点
            childNode = node.left
        } else if (node.right !== null) {
            // 右节点不为空就把子节点设为右节点
            childNode = node.right
        } else {
            // 左右节点都为空的情况，删除的是叶子节点
            childNode = null
        }
        
        if (parentNode === null) {
            this.root = childNode
        } else if (parentNode.left === node) {
            parentNode.left = childNode
        } else {
            parentNode.right = childNode
        }
    }

    /**
     * LDR 中序遍历
     * 先打印它的左子树，然后再打印它本身，最后打印它的右子树
     * @returns {array} 数组
     */
    inorderTraversal() {
        if (this.root === null) return
        let res = []
        _inorderTraversal(this.root.left)
        res.push(this.root.data)
        _inorderTraversal(this.root.right)
        return res

        function _inorderTraversal(node) {
            if (node === null) {
                return
            }
            _inorderTraversal(node.left)
            res.push(node.data)
            _inorderTraversal(node.right)
        }
    }

    /**
     * VLR 前序遍历
     * 先打印这个节点，然后再打印它的左子树，最后打印它的右子树
     * @returns {array} 数组
     */
    preorderTraversal() {
        if (this.root === null) return
        let res = []
        res.push(this.root.data)
        _preorderTraversal(this.root.left)
        _preorderTraversal(this.root.right)
        return res

        function _preorderTraversal(node) {
            if (node === null) {
                return
            }
            res.push(node.data)
            _preorderTraversal(node.left)
            _preorderTraversal(node.right)
        }
    }

    /**
     * LRD 后序遍历
     * 先打印它的左子树，然后再打印它的右子树，最后打印这个节点本身
     * @returns {array} 数组
     */
    postorderTraversal() {
        if (this.root === null) return
        let res = []
        _postorderTraversal(this.root.left)
        _postorderTraversal(this.root.right)
        res.push(this.root.data)
        return res

        function _postorderTraversal(node) {
            if (node === null) {
                return
            }            
            _postorderTraversal(node.left)
            _postorderTraversal(node.right)
            res.push(node.data)
        }
    }

    /**
     * 查找最小节点
     */
    findMin() {
        if (this.root === null) return
        let node = this.root
        while (node.left !== null) {
            node = node.left
        }
        return node
    }

    /**
     * 查找最大值
     */
    findMax() {
        if (this.root === null) return
        let node = this.root
        while (node.right !== null) {
            node = node.right
        }
        return node
    }
}

let tree = new BinarySearchTree()
tree.insert(30)
tree.insert(20)
tree.insert(40)
tree.insert(19)
tree.insert(21)
tree.insert(32)
tree.insert(45)
tree.insert(25)
tree.insert(25)
tree.delete(25)
var a = tree.find(25)
a = tree.find(20)
a = tree.find(100)
console.log(tree.inorderTraversal())
console.log(tree.preorderTraversal())
console.log(tree.postorderTraversal())
console.log(tree.findMin())
console.log(tree.findMax())
```

## 红黑树（Red-Black Tree）

二叉查找树在频繁的动态更新过程中，可能会出现树的高度远大于 log2n 的情况，从而导致各个操作的效率下降。极端情况下，二叉树会退化为链表，时间复杂度会退化到 O(n)。所以就有了`平衡二叉查找树`。

平衡二叉树的严格定义是：二叉树中任意一个节点的左右子树的高度相差不能大于 1。完全二叉树、满二叉树其实都是平衡二叉树，但是非完全二叉树也有可能是平衡二叉树，如下图所示：

![](./image/pic11.image)

平衡二叉查找树不仅满足上面平衡二叉树的定义，还满足二叉查找树的特点。最先被发明的平衡二叉查找树是AVL 树，它严格符合我刚讲到的平衡二叉查找树的定义，即任何节点的左右子树高度相差不超过 1，是一种高度平衡的二叉查找树。但是很多平衡二叉查找树其实并没有严格符合上面的定义（树中任意一个节点的左右子树的高度相差不能大于 1），红黑树就是这样，它从根节点到各个叶子节点的最长路径，有可能会比最短路径大一倍。

我们学习数据结构和算法是为了应用到实际的开发中的，所以，我觉得没必去死抠定义。对于平衡二叉查找树这个概念，我觉得我们要从这个数据结构的由来，去理解“平衡”的意思。发明平衡二叉查找树这类数据结构的初衷是，解决普通二叉查找树在频繁的插入、删除等动态更新的情况下，出现时间复杂度退化的问题。

所以，平衡二叉查找树中“平衡”的意思，其实就是让整棵树左右看起来比较“对称”、比较“平衡”，不要出现左子树很高、右子树很矮的情况。这样就能让整棵树的高度相对来说低一些，相应的插入、删除、查找等操作的效率高一些。

所以，如果我们现在设计一个新的平衡二叉查找树，只要树的高度不比 log2n 大很多（比如树的高度仍然是对数量级的），尽管它不符合我们前面讲的严格的平衡二叉查找树的定义，但我们仍然可以说，这是一个合格的平衡二叉查找树。

平衡二叉查找树其实有很多，比如，Splay Tree（伸展树）、Treap（树堆）等，但是我们提到平衡二叉查找树，听到的基本都是红黑树。它的出镜率甚至要高于“平衡二叉查找树”。

红黑树的英文是“Red-Black Tree”，简称 R-B Tree。它是一种不严格的平衡二叉查找树，我前面说了，它的定义是不严格符合平衡二叉查找树的定义的。

顾名思义，红黑树中的节点，一类被标记为黑色，一类被标记为红色。除此之外，一棵红黑树还需要满足这样几个要求：

- 根节点是黑色的；
- 每个叶子节点都是黑色的空节点（NIL），也就是说，叶子节点不存储数据；
- 任何相邻的节点都不能同时为红色，也就是说，红色节点是被黑色节点隔开的；
- 每个节点，从该节点到达其可达叶子节点的所有路径，都包含相同数目的黑色节点；

平衡二叉查找树的初衷，是为了解决二叉查找树因为动态更新导致的性能退化问题。所以，“平衡”的意思可以等价为性能不退化。“近似平衡”就等价为性能不会退化得太严重。

二叉查找树很多操作的性能都跟树的高度成正比。一棵极其平衡的二叉树（满二叉树或完全二叉树）的高度大约是 log2n，所以如果要证明红黑树是近似平衡的，我们只需要分析，红黑树的高度是否比较稳定地趋近 log2n 就好了。

红黑树中包含最多黑色节点的路径不会超过 log2n，所以加入红色节点之后，最长路径不会超过 2log2n，也就是说，红黑树的高度近似 2log2n。所以，红黑树的高度只比高度平衡的 AVL 树的高度（log2n）仅仅大了一倍，在性能上，下降得并不多。这样推导出来的结果不够精确，实际上红黑树的性能更好。

红黑树的 JavaScript 代码实现：

```js
/** node 颜色 */
const NodeColor = { Red: "red", Black: "black" }

/**
 * @class
 * 叶子黑色空节点
 */
class LeafNode {
    constructor() {
        this.data = null
        this.color = NodeColor.Black
    }
}

// 叶子黑色空节点
const leafNode = new LeafNode()

/**
 * @class
 * 红黑树的节点
 */
class RedBlackNode {
    constructor(data) {
        this.data = data
        this.left = leafNode
        this.right = leafNode
        this.color = NodeColor.Red
        this.parent = null
    }
}

/**
 * @class
 * 红黑树
 */
class RedBlackTree {
    constructor() {
        this.root = null
    }

    /**
     * 插入节点，供外部调用的接口
     * @param {*} data 数据
     */
    insert(data) {
        // 插入的是跟节点
        if (this.root === null) {
            this.root = new RedBlackNode(data)
            this.root.color = NodeColor.Black
        } else {
            // 不是根节点的情况
            // 先不考虑平衡，就像普通二叉树一样正常插入，并返回新插入的节点
            const newNode = this._insert(data)
            // 新节点插入之后对平衡性进行修正
            this._insertFixup(newNode)
        }
    }

    /**
     * 不考虑平衡，就像普通二叉树一样正常插入节点，仅供内部调用
     * @param {*} data 数据
     * @returns {RedBlackNode} 返回新插入的节点
     */
    _insert(data) {
        let node = new RedBlackNode(data)

        // 节点的插入位置，节点被插入到哪个节点之上
        let insertPosition = this.root
        while (true) {
            if (insertPosition.data <= data) {
                // 比根节点大或者相等，需要继续判断右节点
                if (insertPosition.right === leafNode) {
                    // 没有右节点，插入的节点就是右节点
                    insertPosition.right = node
                    node.parent = insertPosition
                    return node
                }
                // 有右节点继续递归，去右节点进行比较大小
                insertPosition = insertPosition.right
            } else {
                // 比根节点小
                if (insertPosition.left === leafNode) {
                    // 没有左节点，插入的节点就是左节点
                    insertPosition.left = node
                    node.parent = insertPosition
                    return node
                }
                // 有左节点继续递归，去左节点进行比较大小
                insertPosition = insertPosition.left
            }
        }
    }

    /**
     * 对关注节点进行修复
     * @param {RedBlackNode} node 关注节点
     */
    _insertFixup(node) {
        // 新插入节点的父节点
        const parentNode = node.parent
        if (parentNode !== null && parentNode.color === NodeColor.Red) {
            // 父节点不为空且父节点为红色，两个红色节点相连了，这种情况不符合红黑树的要求，肯定需要修复
            // 祖父节点
            const grandParentNode = parentNode.parent
            if (parentNode === grandParentNode.left) {
                // 父节点是祖父节点的左子节点
                // 叔叔节点就是祖父节点的右子节点
                const uncleNode = grandParentNode.right
                if (uncleNode.color === NodeColor.Red) {
                    // 如果叔叔节点为红色，那就把父节点置为黑色，叔叔节点也置为黑色，祖父节点置为红色，然后把关注节点改为祖父节点，对祖父节点再进行修复
                    parentNode.color = NodeColor.Black
                    uncleNode.color = NodeColor.Black
                    grandParentNode.color = NodeColor.Red
                    this._insertFixup(grandParentNode)
                } else {
                    // 叔叔节点为黑色节点
                    if (parentNode.right === node) {
                        // 如果节点为父节点的右子节点，那么把关注节点切换到父节点，然后对父节点进行左旋，再对父节点进修复
                        this._rotateLeft(parentNode)
                        this._insertFixup(parentNode)
                    } else if (parentNode.left === node) {
                        // 如果节点为父节点的左子节点，那么把父节点置为黑色，祖父节点置为红色，然后把关注节点切到祖父节点，然后对祖父节点进行右旋
                        parentNode.color = NodeColor.Black
                        grandParentNode.color = NodeColor.Red
                        this._rotateRight(grandParentNode)
                    }
                }
            } else {
                // 父节点是祖父节点的右子节点
                // 叔叔节点就是祖父节点的左子节点
                const uncleNode = grandParentNode.left
                if (uncleNode.color === NodeColor.Red) {
                    // 如果叔叔节点为红色，那就把父节点置为黑色，叔叔节点也置为黑色，祖父节点置为红色，然后把关注节点改为祖父节点，对祖父节点再进行修复（同上）
                    parentNode.color = NodeColor.Black
                    uncleNode.color = NodeColor.Black
                    grandParentNode.color = NodeColor.Red
                    this._insertFixup(grandParentNode)
                } else {
                    // 叔叔节点为黑色节点
                    if (parentNode.left === node) {
                        // 如果节点为父节点的左子节点，那么把关注节点切换到父节点，然后对父节点进行右旋，再对父节点进修复
                        this._rotateRight(parentNode)
                        this._insertFixup(parentNode)
                    } else if (parentNode.right === node) {
                        // 如果节点为父节点的右子节点，那么把父节点置为黑色，祖父节点置为红色，然后把关注节点切到祖父节点，然后对祖父节点进行左旋
                        parentNode.color = NodeColor.Black
                        grandParentNode.color = NodeColor.Red
                        this._rotateLeft(grandParentNode)
                    }
                }
            }
        }
        this.root.color = NodeColor.Black;
    }

    /**
     * 左旋
     * @param {RedBlackNode} node 关注节点
     */
    _rotateLeft(node) {
        // 右子节点
        let sonRight = node.right
        // 右子节点的左子节点，左孙节点
        let grandsonLeft = sonRight.left
        // 把关注节点的右子节点变成左孙节点
        node.right = grandsonLeft
        // 右子节点的左子节点的父节点更新为关注节点
        grandsonLeft.parent = node

        // 右子节点的父节点更新为关注节点的父节点
        sonRight.parent = node.parent

        if (node.parent === null) {
            // 关注节点的父节点为空，说明关注节点是根节点，根节点更新为右子节点
            this.root = sonRight;
        } else {
            // 关注节点不是根节点
            if (node.parent.left === node) {
                // 关注节点是其父节点的左子节点，那么就将这个节点更新
                node.parent.left = sonRight;
            } else {
                // 关注节点是其父节点的右子节点，那么就将这个节点更新
                node.parent.right = sonRight;
            }
        }

        // 把关注节点变成右子节点的左子节点，交换了父子关系
        sonRight.left = node
        // 关注节点的父节点更新为右子节点
        node.parent = sonRight
    }

    /**
     * 右旋
     * @param {RedBlackNode} node 关注节点
     */
    _rotateRight(node) {
        // 左子节点
        let sonLeft = node.left
        // 左子节点的右子节点，右孙节点
        let grandsonRight = sonLeft.right
        // 把关注节点的左子节点变成右孙节点
        node.left = grandsonRight
        // 左子节点的右子节点的父节点更新为关注节点
        grandsonRight.parent = node

        // 左子节点的父节点更新为关注节点的父节点
        sonLeft.parent = node.parent

        if (node.parent === null) {
            // 关注节点的父节点为空，说明关注节点是根节点，根节点更新为左子节点
            this.root = sonLeft;
        } else {
            // 关注节点不是根节点
            if (node.parent.left === node) {
                // 关注节点是其父节点的左子节点，那么就将这个节点更新
                node.parent.left = sonLeft;
            } else {
                // 关注节点是其父节点的右子节点，那么就将这个节点更新
                node.parent.right = sonLeft;
            }
        }

        // 把关注节点变成左子节点的右子节点，交换了父子关系
        sonLeft.right = node
        // 关注节点的父节点更新为左子节点
        node.parent = sonLeft
    }

    /**
     * 移除节点，外部调用
     * @param {*} data 数据
     */
    remove(data) {
        // 查找节点
        const node = this.find(data)
        // 没找到节点
        if (node === null) {
            return
        } else {
            // 找到节点
            this._remove(node)
        }
    }

    /**
     * 移除节点，内部调用
     * @param {RedBlackNode} node 节点
     */
    _remove(node) {
        let child, parent, nodeColor
        if (node.left !== leafNode && node.right !== leafNode) {
            // 要删除节点的左右子节点都是非空节点
            // 查找到右子节点的最小子节点
            const tempNode = this.findMin(node.right)

            if (node.parent === null) {
                // 父节点为空，说明是根节点
                this.root = tempNode
            } else {
                // 父节点不为空
                if (node.parent.left === node) {
                    // 节点是其父节点的左子节点，就把查找到的最小节点赋值给其父节点的左子节点
                    node.parent.left = tempNode
                } else {
                    // 节点是其父节点的右子节点，就把查找到的最小节点赋值给其父节点的右子节点
                    node.parent.right = tempNode
                }
            }
            // 因为查找出来的节点是最小节点，所以它没有左子节点，它只可能有非空右子节点
            child = tempNode.right
            // 最小节点的父节点
            parent = tempNode.parent
            // 最小节点颜色
            nodeColor = tempNode.color

            if (parent.data === node.data) {
                // 最小节点的父节点数据和要删除节点数据相等，那么最小节点是要删除节点的左子节点
                parent = tempNode
            } else {
                // 最小节点与要删除节点不是父子关系
                if (child !== leafNode) {
                    // 最小节点的右子节点存在，把他的父节点切换为最小子节点的父，相当于删除了最小节点的操作
                    child.parent = parent
                }
                // 最小节点的父节点的左子节点就是最小节点的右子节点
                parent.left = child
                // 要删除节点的右子节点会挂在找到的最小节点的右子节点上
                tempNode.right = node.right
                // 删除节点的右子节点的父节点就是最小节点
                node.right.parent = tempNode
            }

            // 最小节点的父变成要删除节点的父
            tempNode.parent = node.parent
            // 最小节点的颜色变成要删除节点的颜色
            tempNode.color = node.color
            // 最小节点的左子节点变成要删除节点的左子节点
            tempNode.left = node.left
            // 要删除节点的左子节点的父节点变成最小节点
            node.left.parent = tempNode

            if (nodeColor === NodeColor.Black) {
                // 最小节点为黑色则需要进行节点修复
                this._removeFixup(child, parent)
            }
        } else {
            // 删除节点只有一个或零个非空子节点
            if (node.left !== leafNode) {
                child = node.left
            } else {
                child = node.right
            }

            parent = node.parent
            nodeColor = node.color

            if (child !== leafNode) {
                child.parent = parent
            }

            if (parent !== null) {
                if (parent.left.data === node.data) {
                    parent.left = child
                } else {
                    parent.right = child
                }
            } else {
                this.root = child
            }

            if (nodeColor === NodeColor.Black) {
                // 最小节点为黑色则需要进行节点修复
                this._removeFixup(child, parent)
            }
        }
        // 清空要删除节点释放内存
        node = null
    }

    /**
     * 移除节点之后的修复，内部调用
     * @param {RedBlackNode} node 节点
     * @param {RedBlackNode} parentNode 父节点
     */
    _removeFixup(node, parentNode) {
        let otherNode
        while ((node === null || node.color === NodeColor.Black) && (node !== this.root)) {
            // 当节点不为根节点且节点为空或者节点为黑色才会进入此循环
            if (parentNode.left === node) {
                otherNode = parentNode.right
                if (otherNode.color === NodeColor.Red) {
                    otherNode.color = NodeColor.Black
                    parentNode.color = NodeColor.Red
                    this._rotateLeft(parentNode)
                    otherNode = parentNode.right
                }

                if ((otherNode.left === leafNode || otherNode.left.color === NodeColor.Black) &&
                    (otherNode.right === leafNode || otherNode.right.color === NodeColor.Black)) {
                    otherNode.color = NodeColor.Red
                    node = parentNode
                    parentNode = node.parent
                } else {
                    if (otherNode.right === leafNode || otherNode.right.color === NodeColor.Black) {
                        otherNode.left.color === NodeColor.Black
                        otherNode.color = NodeColor.Red
                        this._rotateRight(otherNode)
                        otherNode = parentNode.right
                    }

                    otherNode.color = parentNode.color
                    parentNode.color = NodeColor.Black
                    otherNode.right.color = NodeColor.Black
                    this._rotateLeft(parentNode)
                    node = this.root
                    break
                }
            } else {
                otherNode = parentNode.left
                if (otherNode.color === NodeColor.Red) {
                    otherNode.color = NodeColor.Black
                    parentNode.color = NodeColor.Red
                    this._rotateRight(parentNode)
                    otherNode = parentNode.left
                }

                if ((otherNode.left === leafNode || otherNode.left.color == NodeColor.Black) &&
                    (otherNode.right === leafNode || otherNode.right.color == NodeColor.Black)) {
                    otherNode.color = NodeColor.Red
                    node = parentNode
                    parentNode = node.parent
                } else {
                    if (otherNode.left === leafNode || otherNode.left.color == NodeColor.Black) {
                        otherNode.right.color = NodeColor.Black
                        otherNode.color = NodeColor.Red
                        this._rotateLeft(otherNode)
                        otherNode = parentNode.left
                    }

                    otherNode.color = parentNode.color
                    parentNode.color = NodeColor.Black
                    otherNode.left.color = NodeColor.Black
                    this._rotateRight(parentNode)
                    node = this.root
                    break
                }
            }
        }
        if (node !== null) {
            node.color = NodeColor.Black
        }
    }

    /**
     * 查找一个数据在哪个节点
     * @param {*} data 数据 
     * @returns {RedBlackNode | null} 返回节点或者空
     */
    find(data) {
        let node = this.root
        while (node !== null) {
            if (node === leafNode) {
                return null
            }
            if (node.data < data) {
                node = node.right
            } else if (node.data > data) {
                node = node.left
            } else {
                // node.data 与 data 相等的情况
                return node
            }
        }
        return null
    }

    /**
     * 查找最小节点
     * @param {RedBlackNode | undefined} node 节点或不传参
     * @returns {RedBlackNode} 返回节点
     */
    findMin(node) {
        if (node === undefined) {
            if (this.root === null) return
            node = this.root
        }
        while (node.left !== leafNode) {
            node = node.left
        }
        return node
    }

    /**
     * 找最大值
     * @param {RedBlackNode | undefined} node 节点或不传参
     * @returns {RedBlackNode} 返回节点
     */
    findMax(node) {
        if (node === undefined) {
            if (this.root === null) return
            node = this.root
        }
        while (node.right !== leafNode) {
            node = node.right
        }
        return node
    }

    /**
     * LDR 中序遍历
     * 先打印它的左子树，然后再打印它本身，最后打印它的右子树
     * @returns {array} 数组
     */
    inorderTraversal() {
        if (this.root === null) return
        let res = []
        _inorderTraversal(this.root.left)
        res.push(this.root.data)
        _inorderTraversal(this.root.right)
        return res

        function _inorderTraversal(node) {
            if (node === leafNode) {
                return
            }
            _inorderTraversal(node.left)
            res.push(node.data)
            _inorderTraversal(node.right)
        }
    }

    /**
     * VLR 前序遍历
     * 先打印这个节点，然后再打印它的左子树，最后打印它的右子树
     * @returns {array} 数组
     */
    preorderTraversal() {
        if (this.root === null) return
        let res = []
        res.push(this.root.data)
        _preorderTraversal(this.root.left)
        _preorderTraversal(this.root.right)
        return res

        function _preorderTraversal(node) {
            if (node === leafNode) {
                return
            }
            res.push(node.data)
            _preorderTraversal(node.left)
            _preorderTraversal(node.right)
        }
    }

    /**
     * LRD 后序遍历
     * 先打印它的左子树，然后再打印它的右子树，最后打印这个节点本身
     * @returns {array} 数组
     */
    postorderTraversal() {
        if (this.root === null) return
        let res = []
        _postorderTraversal(this.root.left)
        _postorderTraversal(this.root.right)
        res.push(this.root.data)
        return res

        function _postorderTraversal(node) {
            if (node === leafNode) {
                return
            }            
            _postorderTraversal(node.left)
            _postorderTraversal(node.right)
            res.push(node.data)
        }
    }
}

let rbt = new RedBlackTree()
rbt.insert(3)
rbt.insert(4)
rbt.insert(5)
rbt.insert(1)
rbt.insert(2)
rbt.insert(7)
rbt.remove(2)
let a = rbt.find(5)
let b = rbt.findMax()
let c = rbt.findMin()
console.log(rbt.inorderTraversal())
console.log(rbt.preorderTraversal())
console.log(rbt.postorderTraversal())
```
