# Vue2数据双向绑定原理

> 首发于：2020-04-26

## Vue数据双向绑定原理

### Object.defineProperty

#### 描述

用于在一个对象上定义新的属性或修改现有属性, 并返回该对象

#### 语法

```js
Object.defineProperty(obj, prop, descriptor)
```

#### 参数

- obj：必需，要在其上定义属性的对象

- prop: 必须，要定义或修改的属性的名称或Symbol

- descriptor：定义或修改的属性的描述符

  具体如下：

  ```typescript
  interface Descriptor {
      // 为 true 时此属性方可删除或更改  
      configurable?: boolean;
      // 为 true 时此属性可以被枚举（使用 for...in 或 Object.keys()）
      enumerable?: boolean;
      // 属性对应的值,可以使任意类型的值，默认为 undefined
      value?: any;
      // 为 true 时属性值才能被重写
      writable?: boolean;
      // getter 一种获得属性值的方法
      get?(): any;
      // setter 一种设置属性值的方法
      set?(v: any): void;
  }
  ```

  一些例子:

  ```js
  // configurable 的例子
  let a = {
      p1: 10,
      p2: 'test'
  }
  Object.defineProperty(a, 'p1', {
      configurable: false,
      value: 20
  })
  delete a.p1 // 返回 false，此属性删不掉
  ```

  ```js
  // enumerable 的例子
  let b = {
      p1: 10,
      p2: 'test'
  }
  console.log(Object.keys(b)) // 返回 ["p1", "p2"]
  Object.defineProperty(b, 'p1', {
      enumerable: false
  })
  console.log(Object.keys(b)) // 返回 ["p2"]
  ```

  ```js
  // writable 的例子
  let c = {
      p1: 10,
      p2: 'test'
  }
  Object.defineProperty(c, 'p1', {
      writable: false,
      value: 20
  })
  c.p1 // 20
  c.p1 = 30
  console.log(c.p1) // 20
  ```

  ```js
  // getter/setter 的例子
  // 注意：当使用了getter 或setter 方法，不允许使用 writable 和 value 这两个属性
  let d = {
      p1: 10,
      p2: 'test'
  }
  Object.defineProperty(d, 'p1', {
      get: function () {
          // d.p1 时就会一直返回 100
          return 100
      },
      set: function (newVal) {
          console.log(`new value:${newVal}`)
      }
  })
  console.log(d.p1)
  d.p1 = 25
  ```


#### 返回值

传入函数的对象。即第一个参数 obj

#### 兼容性

IE8以下会有兼容性问题

### 实现一个极简的双向绑定

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div id="app">
    	<input type="text" id="a">
    	<p id="b"></p>
    </div>
    <script>
        let obj = {}
        Object.defineProperty(obj, 'test', {
            set: function (newVal) {
                document.getElementById("a").value = newVal
                document.getElementById("b").innerHTML = newVal
            }
        })

        document.addEventListener('keyup', function (e) {
            obj.test = e.target.value
        })
    </script>
</body>
</html>
```

### MVVM

MVVM 模式将程序分为三个部分：模型（Model）、视图（View）、视图模型（View-Model）。

![](./image/pic1.awebp)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <title>Document</title>
</head>
<body>
    <div id="app">
        <input type="text" v-model="text">
        {{ text }}
    </div>
    
    <script>
        const vm = new Vue({
            el: '#app',
            data: {
                text: 'hello world'
            }
        })
    </script>
</body>
</html>
```

要实现数据双向绑定需要分解为三个步骤：

1. input框、text文本与data中的数据进行绑定；
2. input框变化data数据也发生变化，即 view => model；
3. data中的数据变化input框、text文本内容变化，即model => view；

### DocumentFragment

#### 描述

Document.createDocumentFragment()，创建一个新的空白的文档片段( DocumentFragment)。

DocumentFragment 是DOM节点。它们不是主DOM树的一部分。通常的用例是创建文档片段，将元素附加到文档片段，然后将文档片段附加到DOM树。在DOM树中，文档片段被其所有的子元素所代替。

因为文档片段存在于**内存中**，并不在DOM树中，所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。因此，使用文档片段通常会带来更好的性能。

#### 语法

```js
// fragment 指向一个空的 DocumentFragment 对象的引用
let fragment = document.createDocumentFragment();
```

#### 示例

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <ul id="ul"></ul>
    <script>
        var element = document.getElementById('ul'); // assuming ul exists
        var fragment = document.createDocumentFragment();
        var browsers = ['Firefox', 'Chrome', 'Opera',
            'Safari', 'Internet Explorer'];

        browsers.forEach(function (browser) {
            var li = document.createElement('li');
            li.textContent = browser;
            fragment.appendChild(li);
        });

        element.appendChild(fragment);
    </script>
</body>

</html>
```

#### 劫持子节点

Vue 进行编译时，就是将挂载目标的所有子节点劫持（通过 append 方法，DOM 中的节点会被自动删除）到 DocumentFragment 中，经过一番处理后，再将 DocumentFragment 整体返回插入挂载目标。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div id="app">
    	<input type="text" id="a">
    	<p id="b"></p>
    </div>
    <script>
        const dom = nodeToFragment(document.getElementById('app'))
        console.log(dom)

        function nodeToFragment (node) {
            let fragment = document.createDocumentFragment()
            let child
            while (child = node.firstChild) {
                // appendChild 方法有个隐蔽的地方，就是调用以后 child 会从原来 DOM 中移除
                // 劫持 node 的所有子节点
                fragment.appendChild(child)
            }
            return fragment
        }
    </script>
</body>
</html>
```

### 数据初始化绑定

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <input type="text" v-model="text">
        {{ text }}
    </div>
    <script>
        function nodeToFragment(node, vm) {
            let fragment = document.createDocumentFragment()
            let child

            while (child = node.firstChild) {
                compile(child, vm)
                fragment.appendChild(child)
            }
            return fragment
        }

        function compile(node, vm) {
            const reg = /\{\{(.*)\}\}/;
            // 节点类型为元素
            if (node.nodeType === 1) {
                const attr = node.attributes;
                // 解析属性
                for (let i = 0; i < attr.length; i++) {
                    if (attr[i].nodeName === 'v-model') {
                        let name = attr[i].nodeValue; // 获取 v-model 绑定的属性名
                        node.value = vm.data[name]; // 将 data 的值赋给该 node
                        node.removeAttribute('v-model')
                    }
                }
            }
            // 节点类型为 text
            if (node.nodeType === 3) {
                if (reg.test(node.nodeValue)) {
                    let name = RegExp.$1 // 获取匹配到的字符串
                    name = name.trim()
                    node.nodeValue = vm.data[name]
                }
            }
        }

        function Vue(options) {
            this.data = options.data
            const id = options.el
            const dom = nodeToFragment(document.getElementById(id), this)

            // 编译完成后，将 dom 返回到 app 中
            document.getElementById(id).appendChild(dom)
        }

        const vm = new Vue({
            el: 'app',
            data: {
                text: 'hello world'
            }
        })
    </script>
</body>

</html>

```

### 响应式的数据绑定

当我们在输入框输入数据的时候，首先触发 input 事件（或者 keyup、change 事件），在相应的事件处理程序中，我们获取输入框的 value 并赋值给 vm 实例的 text 属性。我们会利用 defineProperty 将 data 中的 text 设置为 vm 的访问器(getter)属性，因此给 vm.text 赋值，就会触发 set 方法。在 set 方法中主要做两件事，第一是更新属性的值，第二留到任务三再说。

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <input type="text" v-model="text">
        {{ text }}
    </div>
    <script>
        function nodeToFragment(node, vm) {
            let fragment = document.createDocumentFragment()
            let child

            while (child = node.firstChild) {
                compile(child, vm)
                fragment.appendChild(child)
            }
            return fragment
        }

        function compile(node, vm) {
            const reg = /\{\{(.*)\}\}/;
            // 节点类型为元素
            if (node.nodeType === 1) {
                const attr = node.attributes;
                // 解析属性
                for (let i = 0; i < attr.length; i++) {
                    if (attr[i].nodeName === 'v-model') {
                        let name = attr[i].nodeValue; // 获取 v-model 绑定的属性名
                        node.addEventListener('input', function (e) {
                            vm[name] = e.target.value
                        })
                        node.value = vm[name]; // 将 data 的值赋给该 node
                        node.removeAttribute('v-model')
                    }
                }
            }
            // 节点类型为 text
            if (node.nodeType === 3) {
                if (reg.test(node.nodeValue)) {
                    let name = RegExp.$1 // 获取匹配到的字符串
                    name = name.trim()
                    node.nodeValue = vm[name]
                }
            }
        }

        function defineReactive(obj, key, val) {
            Object.defineProperty(obj, key, {
                get: function () {
                    return val
                },
                set: function (newVal) {
                    if (newVal === val) return
                    val = newVal;
                    console.log(val)
                }
            })
        }

        function observe(obj, vm) {
            Object.keys(obj).forEach(function (key) {
                defineReactive(vm, key, obj[key])
            })
        }

        function Vue(options) {
            this.data = options.data
            const data = this.data
            observe(data, this)

            const id = options.el
            const dom = nodeToFragment(document.getElementById(id), this)

            // 编译完成后，将 dom 返回到 app 中
            document.getElementById(id).appendChild(dom)
        }

        const vm = new Vue({
            el: 'app',
            data: {
                text: 'hello world'
            }
        })
    </script>
</body>

</html>
```

### 订阅/发布模式（subscribe&publish）

data中的 text 属性变化了，set 方法触发了，但是文本节点的内容没有变化。如何让同样绑定到 text 的文本节点也同步变化呢？这里又有一个知识点：订阅发布模式。

订阅发布模式（又称观察者模式）定义了一种一对多的关系，让多个观察者同时监听某一个主题对象，这个主题对象的状态发生改变时就会通知所有观察者对象。

发布者发出通知 => 主题对象收到通知并推送给订阅者 => 订阅者执行相应操作

```js
// 订阅者们
const sub1 = { update: function () { console.log(1) } }
const sub2 = { update: function () { console.log(2) } }
const sub3 = { update: function () { console.log(3) } }

// 一个主题
function Dep () {
    this.subs = [sub1, sub2, sub3]
}
Dep.prototype.notify = function () {
    this.subs.forEach(function (sub) {
        sub.update()
    })
}

// 发布者
var pub = {
    publish: function () {
        dep.notify()
    }
}

var dep = new Dep()
pub.publish() // 1 2 3
```



之前提到的，当 set 方法触发后做的第二件事就是作为发布者发出通知：“我是属性 text，我变了”。文本节点则是作为订阅者，在收到消息后执行相应的更新操作。

```js
const adadisPub = {
    adadisBook: [],              // adadis售货员的小本本
    subShoe(phoneNumber) {       // 买家在小本本是登记号码
        this.adadisBook.push(phoneNumber)
    },
    notify() {                     // 售货员打电话通知小本本上的买家
        for (const customer of this.adadisBook) {
            customer.update()
        }
    }
}

const customer1 = {
    phoneNumber: '152xxx',
    update() {
        console.log(this.phoneNumber + ': 去商场看看')
    }
}

const customer2 = {
    phoneNumber: '138yyy',
    update() {
        console.log(this.phoneNumber + ': 给表弟买双')
    }
}

adadisPub.subShoe(customer1)  // 在小本本上留下号码
adadisPub.subShoe(customer2)

adadisPub.notify()            // 打电话通知买家到货了

// 152xxx: 去商场看看
// 138yyy: 给表弟买双
```



### 双向绑定的实现

我们已经实现：修改输入框内容 => 在事件回调函数中修改属性值 => 触发属性的 set 方法。

接下来我们要实现的是：发出通知 dep.notify() => 触发订阅者的 update 方法 => 更新视图。

这里的关键逻辑是：如何将 watcher 添加到关联属性的 dep 中。

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <input type="text" v-model="text">
        {{ text }}
    </div>
    <script>
        function observe(obj, vm) {
            Object.keys(obj).forEach(function (key) {
                defineReactive(vm, key, obj[key])
            })
        }

        function defineReactive(obj, key, val) {
            // 在监听数据的过程中，会为 data 中的每一个属性生成一个主题对象 dep
            const dep = new Dep()
            Object.defineProperty(obj, key, {
                get: function () {
                    // 添加订阅者 watcher 到主题对象 Dep
                    if (Dep.target) {
                        dep.addSub(Dep.target)
                    }
                    return val
                },
                set: function (newVal) {
                    if (newVal === val) return
                    val = newVal
                    // 作为发布者发出通知
                    dep.notify()
                }
            })
        }

        function nodeToFragment(node, vm) {
            let fragment = document.createDocumentFragment()
            let child

            while (child = node.firstChild) {
                compile(child, vm)
                fragment.appendChild(child)
            }
            return fragment
        }

        function compile(node, vm) {
            const reg = /\{\{(.*)\}\}/;
            // 节点类型为元素
            if (node.nodeType === 1) {
                const attr = node.attributes;
                // 解析属性
                let name
                for (let i = 0; i < attr.length; i++) {
                    if (attr[i].nodeName === 'v-model') {
                        name = attr[i].nodeValue; // 获取 v-model 绑定的属性名
                        node.addEventListener('input', function (e) {
                            vm[name] = e.target.value
                        })
                        node.value = vm[name]; // 将 data 的值赋给该 node
                        node.removeAttribute('v-model')
                    }
                }
                // 在编译 HTML 的过程中，会为每个与数据绑定相关的节点生成一个订阅者 watcher，watcher 会将自己添加到相应属性的 dep 中
                new Watcher(vm, node, name, 'input');
            }
            // 节点类型为 text
            if (node.nodeType === 3) {
                if (reg.test(node.nodeValue)) {
                    let name = RegExp.$1 // 获取匹配到的字符串
                    name = name.trim()
                    new Watcher(vm, node, name, 'text');
                }
            }
        }

        // 订阅
        function Watcher(vm, node, name, nodeType) {
            // 首先，将自己赋给了一个全局变量 Dep.target
            Dep.target = this;
            this.name = name;
            this.node = node;
            this.vm = vm;
            this.nodeType = nodeType;
            // 执行了 update 方法，进而执行了 get 方法，get 的方法读取了 vm 的访问器属性，从而触发了访问器属性的 get 方法，get 方法中将该 watcher 添加到了对应访问器属性的 dep 中
            this.update();
            Dep.target = null;
        }
        Watcher.prototype = {
            update: function () {
                this.get();
                // 更新视图
                if (this.nodeType === 'text') {
                    this.node.nodeValue = this.value;
                }
                if (this.nodeType === 'input') {
                    this.node.value = this.value;
                }
            },
            // 获取 data 中的属性值
            get: function () {
                // 获取属性的值
                this.value = this.vm[this.name]; // 触发相应属性的 get
            }
        }
        // 主题
        function Dep() {
            this.subs = []
        }
        Dep.prototype = {
            addSub: function (sub) {
                this.subs.push(sub);
            },
            notify: function () {
                this.subs.forEach(function (sub) {
                    sub.update();
                });
            }
        }

        function Vue(options) {
            this.data = options.data
            const data = this.data
            observe(data, this)
            const id = options.el
            const dom = nodeToFragment(document.getElementById(id), this)
            // 编译完成后，将 dom 返回到 app 中
            document.getElementById(id).appendChild(dom)
        }

        const vm = new Vue({
            el: 'app',
            data: {
                text: 'hello world'
            }
        })
    </script>
</body>

</html>
```
