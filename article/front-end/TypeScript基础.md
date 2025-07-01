# TypeScript基础

> 首发于：2021-10-19

## 什么是 TypeScript

根据[官方](https://www.tslang.cn/)的定义 `TypeScript` 是 `JavaScript` 类型的超集，它可以编译成纯 `JavaScript`。它主要为开发者提供了类型系统和对 ES6 的支持。

## 为什么要使用 TypeScript

### TypeScript 更加可靠

众所周知，`JavaScript` 是没有“类型”这一说的

```
“'undefined' is not a function”
“Cannot read property 'xx' of null|undefined”
```

上面的低级错误我们在使用 `JavaScript` 开发的时候经常都会见到，`Javascript` 写久容易造成“类型思维”的缺失，养成不良的编程习惯。 而 `TypeScript` 写的代码出现这种错误的频率就会小很多，这也是得益于 `TypeScript` 的静态类型检查。

接手复杂的大型应用时，`TypeScript` 能让应用易于维护、迭代，且稳定可靠，除非你在写 `TS` 代码的时候类型全程用 `any`。

### 面向接口编程

编写 `TypeScript` 类型注解，本质就是接口设计。

以下是使用 `TypeScript` 设计的一个展示用户信息 `React` 组件示例，从中我们一眼就能了解组件接收数据的结构和类型，并清楚地知道如何在组件内部编写安全稳定的 `JSX` 代码。

```typescript
interface IUserInfo {
  /** 用户 id */
  id: number;
  /** 用户名 */
  name: string;
  /** 头像 */
  avatar?: string;
}

function UserInfo(props: IUserInfo) {
  // ...
}
```

TypeScript 极大可能改变你的思维方式，从而逐渐养成一个好习惯。比如，编写具体的逻辑之前，我们需要设计好数据结构、编写类型注解，并按照这接口约定实现业务逻辑。这显然可以减少不必要的代码重构，从而大大提升编码效率。

同时，你会更明白接口约定的重要性，也会约束自己/他人设计接口、编写注解、遵守约定，乐此不疲。

### TypeScript 正成为主流

`JavaScript` 缺少类型检查这个问题其实开源社区一直在致力于解决。

2014年 `Facebook` 推出了 `Flow`， `React` 源码就是用它写。

2015年微软推出了 `TypeScript 1.0`，如今6年过去了，显然 `TypeScript` 发展得更好一些。`Angular` 和 `Vue` 全面使用 `TypeScript` 重构代码。甚至连 `Facebook` 自己的产品 `Jest` 和 `Yarn` 都在向 `TypeScript` 迁移。

## 编写你的第一个 TypeScript 程序

### 在线编译

[http://www.typescriptlang.org/play/index.html](http://www.typescriptlang.org/play/index.html)

### 本地编译

```sh
# 新建一个工程
npm init -y

# npm 全局安装
npm install -g typescript

# 查看 TypeScript 版本
tsc -v

# 在当前目录进行初始化
tsc --init

# 修改tsconfig.json
# 添加"outDir": "./js", // “./js” 是js文件输出路径，可以根据自己需要修改

# 编译
tsc
```

## 基础语法

### 原始类型

`JS` 中原始数据类型包括：布尔值、数值、字符串、`null`、`undefined` 以及 ES6 中的新类型 [`Symbol`](http://es6.ruanyifeng.com/#docs/symbol) 和 ES10 中的新类型 [`BigInt`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)。`TS` 中有一些差异：

```typescript
let booleanTrue: boolean = true;

let number666: number = 666;

let str: string = 'abc';

let nullType = null;

let undefinedType = undefined;

const symbolType: symbol = Symbol();

const bigInt: BigInt = 9999999991111111n; // 编译目标版本高于 ES2020 可用

function returnNothing(): void {}
```

### 复杂类型

#### 数组

```typescript
const arr1: number[] = [1, 2, 3];
// 或者
const arr2: Array<number> = [1, 2, 3];
```

#### 元祖（Tuple）

```typescript
let x: [string, number] = ['', 10];
console.log(x[0].substr(1));

// react 的 hook
const [count, setCount] = useState(0);
```

#### 枚举

```typescript
enum Color {
  Red,
  Green,
  Blue
}
let c: Color = Color.Green;

enum Color {
  Red = 1,
  Green = 2,
  Blue = 'blue'
}
let c: Color = Color.Green;
```

#### 任意类型

```typescript
let antType: any;
```

#### never

`never` 自身以外，其他类型（包括 `any` 在内的类型）都不能为 `never` 类型赋值。

```typescript
// 返回 never 的函数必须存在无法达到的终点
function infiniteLoop(): never {
  while (true) {}
}
```

#### unknown

`unknown` 是 `TypeScript 3.0 `中添加的一个类型，它主要用来描述类型并不确定的变量。

```typescript
let result: unknown;
if (x) {
  result = x();
} else if (y) {
  result = y();
}
```

`unknown` 在类型上会比 `any` 更安全，因为对其类型可以进行缩小后会有正常的类型检查，而 `any` 不能。

```typescript
let result: unknown;
result.toFixed(); // 提示错误
if (typeof result === 'number') {
  result.toFixed(); // 此处 hover result 提示类型是 number，不会提示错误
}
```

#### object

`object` 类型表示非原始类型的类型，即非 number、string、boolean、bigint、symbol、`null`、`undefined` 的类型。然而，它也是个没有什么用武之地的类型，如下所示的一个应用场景是用来表示 `Object.create` 的类型。

```typescript
declare function create(o: object | null): any;
create({}); // ok
create(() => null); // ok
create(2); // 报错
create('string'); // 报错
```

### 类型断言

`TypeScript` 类型检测无法做到绝对智能，毕竟程序不能像人一样思考。有时会碰到我们比 `TypeScript` 更清楚实际类型的情况，比如下面的例子：

```typescript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2); // 不能将类型“undefined”分配给类型“number”
```

其中，`greaterThan2` 一定是一个数字（确切地讲是 3），因为 `arrayNumber` 中明显有大于 2 的成员，但静态类型对运行时的逻辑无能为力。

在 `TypeScript` 看来，`greaterThan2` 的类型既可能是数字，也可能是 `undefined`，所以上面的示例中提示了一个错误，此时我们不能把类型 `undefined` 分配给类型 `number`。

不过，我们可以使用一种笃定的方式——**类型断言**（类似仅作用在类型层面的强制类型转换）告诉 `TypeScript` 按照我们的方式做类型检查。

```typescript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2) as number;
// 或者
const greaterThan2: number = <number>arrayNumber.find(num => num > 2);
```

还有一种非空断言，可以用来排除值为 `null`、`undefined` 的情况，当然这种断言也是一种和 `any` 一样的危险的选择：

```typescript
let mayNullOrUndefinedOrString: null | undefined | string;
mayNullOrUndefinedOrString!.toString(); // ok
mayNullOrUndefinedOrString.toString(); // 报错
```

### 类型推断

在 `TypeScript` 中，类型标注声明是在变量之后（即类型后置），它不像 `Java` 语言一样，先声明变量的类型，再声明变量的名称。

使用类型标注后置的好处是编译器可以通过代码所在的上下文推导其对应的类型，无须再声明变量类型。

### 字面量类型

在 `TypeScript` 中，字面量不仅可以表示值，还可以表示类型，即所谓的字面量类型。不过实际一般不会这么用，一般会组合为联合类型。

```typescript
let specifiedStr: 'this is string' = 'this is string';
specifiedStr = 'abc' // 报错
let specifiedNum: 1 = 1;
let specifiedBoolean: true = true;
```

### 参数类型

#### 可选参数

```typescript
// 隐含着 x 可能是 undefined
function log(x?: string) {
  return x;
}
```

#### 默认参数

```typescript
function log(x = 'hello') {
  console.log(x);
}
```

#### 剩余参数

```typescript
function sum(...nums: number[]) {
  return nums.reduce((a, b) => a + b, 0);
}
```

#### this

在 `JavaScript` 中，函数 `this` 的指向一直是一个令人头痛的问题。因为 this 的值需要等到函数被调用时才能被确定，更别说通过一些方法还可以改变 `this` 的指向。也就是说 `this` 的类型不固定，它取决于执行时的上下文。

但是，使用了 `TypeScript` 后，我们就不用担心这个问题了。通过指定 `this` 的类型（严格模式下，必须显式指定 `this` 的类型），当我们错误使用了 `this`，`TypeScript` 就会提示我们

```typescript
function say() {
    console.log(this.name); // 'this' implicitly has type 'any' because it does not have a type annotation
}
say();

function say(this: Window, name: string) {
    console.log(this.name);
}
```

#### 函数重载

不同类型的参数应该有不同类型的返回值。

```typescript
function convert(x: string): number;
function convert(x: number): string;
function convert(x: null): -1;
function convert(x: string | number | null): any {
  if (typeof x === 'string') {
    return Number(x);
  }
  if (typeof x === 'number') {
    return String(x);
  }
  return -1;
}
```

#### 类型谓词 is

```typescript
function isString(s): s is string { // 类型谓词，可以将 s 的隐式 any 缩小为 string
  return typeof s === 'string';
}
function isNumber(n: number) {
  return typeof n === 'number';
}
function operator(x: unknown) {
  if(isString(x)) { // ok x 类型缩小为 string
  }
  if (isNumber(x)) { // unknown 不能赋值给 number
  }
}
```

### 类类型

#### 类

```typescript
class Dog {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  bark() {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog('Q');
dog.bark(); // => 'Woof! Woof!'
```

#### 继承

```typescript
class Animal {
  type = 'Animal';
  say(name: string) {
    console.log(`I'm ${name}!`);
  }
}

class Dog extends Animal {
  bark() {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog();
dog.bark(); // => 'Woof! Woof!'
dog.say('Q'); // => I'm Q!
dog.type; // => Animal

class Dog extends Animal {
  name: string;
  constructor(name: string) { // 如果有 constructor
    super(); // 必须添加 super 方法
    this.name = name;
  }

  bark() {
    console.log('Woof! Woof!');
  }
}
```

#### 公共、私有与受保护的修饰符

在 `TypeScript` 中就支持 3 种访问修饰符，分别是 `public`、`private`、`protected`。

- `public` 修饰的是在任何地方可见、公有的属性或方法；

- `private` 修饰的是仅在同一类中可见、私有的属性或方法；

- `protected` 修饰的是仅在类自身及子类中可见、受保护的属性或方法。

**注意**：`TypeScript` 中定义类的私有属性仅仅代表静态类型检测层面的私有。如果我们强制忽略 `TypeScript` 类型的检查错误，转译且运行 `JavaScript` 时依旧可以获取到 `private` 属性，这是因为 `JavaScript` 并不支持真正意义上的私有属性。

#### 只读修饰符

如果我们不希望类的属性被更改，但是又想让其公开可见，可以使用 `readonly` 只读修饰符。

```typescript
class Son {
  public readonly firstName: string;
  constructor(firstName: string) {
    this.firstName = firstName;
  }
}
```

#### 存取器

除了上边提到的修饰符之外，在 `TypeScript` 中还可以通过 `getter`、`setter` 截取对类成员的读写访问。

```typescript
class Son {
  public firstName: string;
  public lastName: string;
  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  get myFirstName() {
    return this.firstName;
  }

  set myFirstName(name: string) {
    if (this.firstName === 'Tony') {
      this.lastName = name;
    } else {
      console.error('Unable to change myLastName');
    }
  }
}

const son1 = new Son('Tony', 'J');
son1.myFirstName = 'hello';
```

#### 静态属性

```typescript
class MyArray {
  static displayName = 'MyArray';
  static isArray(obj: unknown) {
    return Object.prototype.toString.call(obj).slice(8, -1) === 'Array';
  }
}
console.log(MyArray.displayName); // => "MyArray"
console.log(MyArray.isArray([])); // => true
console.log(MyArray.isArray({})); // => false
```

#### 抽象类

抽象类是一种不能被实例化仅能被子类继承的特殊类。

```typescript
abstract class Adder {
  abstract x: number;
  abstract y: number;
  abstract add(): number;
  displayName = 'Adder';
  addTwice(): number {
    return (this.x + this.y) * 2;
  }
}
class NumAdder extends Adder {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
  add(): number {
    return this.x + this.y;
  }
}
const numAdder = new NumAdder(1, 2);
console.log(numAdder.displayName); // => "Adder"
console.log(numAdder.add()); // => 3
console.log(numAdder.addTwice()); // => 6
```

与 `interface` 相比，`interface` 只能定义类成员的类型。

#### 类的类型

类是一种特殊的类型，准确的讲叫接口类型。

```typescript
class A {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
const a1: A = {}; // Property 'name' is missing in type '{}' but required in type 'A'.
const a2: A = { name: 'a2' }; // ok
```

### 接口

#### 接口类型

接口类型可以让我定义一些复杂的数据类型，并能够很好地进行复用。

```typescript
interface ProgramLanguage {
  /** 语言名称 */
  name: string;
  /** 使用年限 */
  age: () => number;
}

const pl: ProgramLanguage = {
  name: 'JavaScript',
  age: () => { return 99 }
}
```

#### 可省略属性

```typescript
/** 关键字 接口名称 */
interface OptionalProgramLanguage {
  /** 语言名称 */
  name: string;
  /** 使用年限 */
  age?: () => number;
}
let OptionalTypeScript: OptionalProgramLanguage = {
  name: 'TypeScript'
}; 
```

#### 只读属性

```typescript
interface ReadOnlyProgramLanguage {
  /** 语言名称 */
  readonly name: string;
  /** 使用年限 */
  readonly age: (() => number) | undefined;
}
let ReadOnlyTypeScript: ReadOnlyProgramLanguage = {
  name: 'TypeScript',
  age: undefined
}
ReadOnlyTypeScript.name = 'JavaScript'; // 报错
```

#### 定义函数类型

以上章节中，我们只列举了接口用来定义对象的类型的案例，其实接口也可以用来定义函数类型。

```typescript
interface ProgramLanguage {
  /** 语言名称 */
  name: string;
  /** 使用年限 */
  age: () => number;
}
interface StudyLanguage {
  (language: ProgramLanguage): void
}
/** 单独的函数实践 */
let StudyInterface: StudyLanguage = language => console.log(`${language.name} ${language.age()}`);
```

实际上，我们很少使用接口类型来定义函数的类型，更多使用内联类型或类型别名。

#### 索引签名

定义属性和值的类型。

```typescript
interface LanguageRankInterface {
  [rank: number]: string;
}
interface LanguageYearInterface {
  [name: string]: number;
}

let LanguageRankMap: LanguageRankInterface = {
  1: 'TypeScript', // ok
  2: 'JavaScript', // ok
  '0': '123', // ok
  'WrongINdex': '2012' // 报错
};

let LanguageMap: LanguageYearInterface = {
  TypeScript: 2012, // ok
  JavaScript: 1995, // ok
  1: 1970 // ok
};
```

注意：在上述示例中，数字作为对象索引时，它的类型既可以与数字兼容，也可以与字符串兼容，这与 `JavaScript` 的行为一致。因此，使用 0 或 '0' 索引对象时，这两者等价。

#### 继承与实现

接口类型可以继承和被继承。

```typescript
interface ProgramLanguage {
  /** 语言名称 */
  name: string;
  /** 使用年限 */
  age: () => number;
}
interface DynamicLanguage extends ProgramLanguage {
  rank: number; // 定义新属性
}
  
interface TypeSafeLanguage extends ProgramLanguage {
  typeChecker: string; // 定义新的属性
}
/** 继承多个 */
interface TypeScriptLanguage extends DynamicLanguage, TypeSafeLanguage {
  name: 'TypeScript'; // 用原属性类型的兼容的类型(比如子集)重新定义属性
}
/** 类实现接口 */
class LanguageClass implements ProgramLanguage {
  name: string = '';
  age = () => new Date().getFullYear() - 2012
}
```

#### Type 类型

接口类型的一个作用是将内联类型抽离出来，从而实现类型可复用。其实，我们也可以使用类型别名接收抽离出来的内联类型实现复用。

```typescript
/** 类型别名 */
type LanguageType = {
  /** 以下是接口属性 */
  /** 语言名称 */
  name: string;
  /** 使用年限 */
  age: () => number;
}
```

实际上，在大多数的情况下使用接口类型和类型别名的效果等价，但是在某些特定的场景下这两者还是存在很大区别。比如，重复定义的接口类型，它的属性会叠加，这个特性使得我们可以极其方便地对全局变量、第三方库的类型做扩展。

```typescript
interface Language {
  id: number;
}
  
interface Language {
  name: string;
}

let lang: Language = {
  id: 1, // ok
  name: 'name' // ok
}

/** 报错 */
type Language = {
  id: number;
}
/** 报错 */
type Language = {
  name: string;
}
let lang: Language = {
  id: 1,
  name: 'name'
}
```

### 高级类型

#### 联合类型

```typescript
function formatPX(size: number | string) {
  // ...
}
formatPX(13); // ok
formatPX('13px'); // ok

function formatUnit(size: number | string, unit: 'px' | 'em' | 'rem' | '%' = 'px') {
  // ...
}
formatUnit(1, 'em'); // ok
formatUnit('1px', 'rem'); // ok
formatUnit('1px', 'bem'); // 报错

// type 的联合
type ModernUnit = 'vh' | 'vw';
type Unit = 'px' | 'em' | 'rem';
type MessedUp = ModernUnit | Unit; // 类型是 'vh' | 'vw' | 'px' | 'em' | 'rem'

// 接口的联合
interface Bird {
  fly(): void;
  layEggs(): void;
}
interface Fish {
  swim(): void;
  layEggs(): void;
}
const getPet: () => Bird | Fish = () => {
  return {
   // ...
  } as Bird | Fish;
};
const Pet = getPet();
Pet.layEggs(); // ok
Pet.fly(); // 报错 'Fish' 没有 'fly' 属性; 'Bird | Fish' 没有 'fly' 属性

if ('fly' in Pet) {
  Pet.fly(); // ok
}
```

#### 交叉类型

```typescript
// 这是一个没有任何用处的交叉类型 相当于 never
type Useless = string & number;
```

#### 合并接口类型

```typescript
// 合并接口类型
type IntersectionType = { id: number; name: string; } & { age: number };
const mixed: IntersectionType = {
  id: 1,
  name: 'name',
  age: 18
}

type IntersectionTypeConfict = { id: number; name: string; } & { age: number; name: number; };
const mixedConflict: IntersectionTypeConfict = {
  id: 1,
  name: 2, // 报错，Type 'number' is not assignable to type 'never'.
  age: 2
};
```

#### 合并联合类型

```typescript
// 合并联合
type UnionA = 'px' | 'em' | 'rem' | '%';
type UnionB = 'vh' | 'em' | 'rem' | 'pt';
type IntersectionUnion = UnionA & UnionB;
const intersectionA: IntersectionUnion = 'em'; // ok
const intersectionB: IntersectionUnion = 'rem'; // ok
const intersectionC: IntersectionUnion = 'px'; // 报错
const intersectionD: IntersectionUnion = 'pt'; // 报错
```

#### 联合、交叉组合

联合相当于 `JS` 中的“与”，交叉相当于“或”，他们的优先级也和 `JS` 中的表现一致。

```typescript
// 交叉操作符优先级高于联合操作符
type UnionIntersectionA = { id: number; } & { name: string; } | { id: string; } & { name: number; };
// 调整优先级
type UnionIntersectionB = ('px' | 'em' | 'rem' | '%') | ('vh' | 'em' | 'rem' | 'pt');
```

### 泛型

#### 什么是泛型

泛型指的是类型参数化，即将原来某种具体的类型进行参数化。和定义函数参数一样，我们可以给泛型定义若干个类型参数，并在调用时给泛型传入明确的类型参数。设计泛型的目的在于有效约束类型成员之间的关系，比如函数参数和返回值、类或者接口成员和方法之间的关系。

#### 泛型类型参数

泛型最常用的场景是用来约束函数参数的类型，我们可以给函数定义若干个被调用时才会传入明确类型的参数。

```typescript
// P 就是在调用的时候才会传入的明确类型
function reflect<P>(param: P): P {
  return param;
}
reflect<string>('string')

function reflectArray<P>(param: P[]) {
  return param;
}
const reflectArr = reflectArray([1, '1']); // reflectArr 是 (string | number)[]
```

#### 泛型类

使用泛型用来约束构造函数、属性、方法的类型

```typescript
class Memory<S> {
  store: S;
  constructor(store: S) {
    this.store = store;
  }
  set(store: S) {
    this.store = store;
  }
  get() {
    return this.store;
  }
}
const numMemory = new Memory<number>(1); // <number> 可缺省
const getNumMemory = numMemory.get(); // 类型是 number
numMemory.set(2); // 只能写入 number 类型
const strMemory = new Memory(''); // 缺省 <string>
const getStrMemory = strMemory.get(); // 类型是 string
strMemory.set('string'); // 只能写入 string 类型
```

对于 React 开发者而言，组件也支持泛型，不过这种用法稍微有些奇怪，不常用。

```tsx
function GenericCom<P>(props: { prop1: P }) {
  return <>{props.prop1}</>;
}
// 显式指定了接口类型 { name: string } 作为入参
<GenericCom<{ name: string; }> prop1={{ name: 'GenericCom' }}/>
```

#### 泛型类型

`Array<类型>` 的语法来定义数组类型，所以 `Array` 本身就是一种类型。

在 `TypeScript` 中，类型本身就可以被定义为拥有不明确的类型参数的泛型，并且可以接收明确类型作为入参，从而衍生出更具体的类型。

```typescript
type ReflectFuncton = <P>(param: P) => P;
interface IReflectFuncton {
  <P>(param: P): P
}
const reflectFn2: ReflectFuncton = reflect;
const reflectFn3: IReflectFuncton = reflect;

function reflect<P>(param: P): P {
  return param;
}
```

`Redux` 中使用泛型

```typescript
interface ReduxModel<State> {
  state: State,
  reducers: {
    [action: string]: (state: State, action: any) => State
  }
}

type ModelInterface = { id: number; name: string };
const model: ReduxModel<ModelInterface> = {
  state: { id: 1, name: 'Clark' }, //  ok 类型必须是 ModelInterface
  reducers: {
    setId: (state, action: { payload: number }) => ({
      ...state,
      id: action.payload // ok must be number
    }),
    setName: (state, action: { payload: string }) => ({
      ...state,
      name: action.payload // ok must be string
    })
  }
}
```

#### 泛型约束

前面提到了泛型就像是类型的函数，它可以抽象、封装并接收（类型）入参，而泛型的入参也拥有类似函数入参的特性。因此，我们可以把泛型入参限定在一个相对更明确的集合内，以便对入参进行约束。

```typescript
function reflectSpecified<P extends number | string | boolean>(param: P):P {
  return param;
}
reflectSpecified('string'); // ok
reflectSpecified(1); // ok
reflectSpecified(true); // ok
reflectSpecified(null); // 报错 'null' 不能赋予类型 'number | string | boolean'

// 把接口泛型入参约束在特定的范围内
interface ReduxModelSpecified<State extends { id: number; name: string }> {
  state: State
}
type ComputedReduxModel1 = ReduxModelSpecified<{ id: number; name: string; }>; // ok
type ComputedReduxModel2 = ReduxModelSpecified<{ id: number; name: string; age: number; }>; // ok
type ComputedReduxModel3 = ReduxModelSpecified<{ id: string; name: number; }>; // 报错
type ComputedReduxModel4 = ReduxModelSpecified<{ id: number;}>; // 报错

// 多个不同的泛型入参之间设置约束关系
interface ObjSetter {
  <O extends {}, K extends keyof O, V extends O[K]>(obj: O, key: K, value: V): V; 
}
const setValueOfObj: ObjSetter = (obj, key, value) => (obj[key] = value);
setValueOfObj({ id: 1, name: 'name' }, 'id', 2); // ok
setValueOfObj({ id: 1, name: 'name' }, 'name', 'new name'); // ok
setValueOfObj({ id: 1, name: 'name' }, 'age', 2); // 报错
setValueOfObj({ id: 1, name: 'name' }, 'id', '2'); // 报错
```

### declare

在运行时，前端代码 `<script>` 标签会引入一个全局的库，再导入全局变量、函数等。此时，如果你想安全地使用这些全局变量或者函数，那么就需要对变量的类型进行声明。

#### 声明变量

```typescript
declare var val1: string;
declare let val2: number;
declare const val3: boolean;
val1 = '1';
val1 = '2';
val2 = 1;
val2 = '2'; // Type 'string' is not assignable to type 'number'.
val3 = true; // Cannot assign to 'val3' because it is a constant.
```

#### 声明函数

```typescript
declare function toString(x: number): string;
const x = toString(1); // => string
```

使用 `declare` 关键字时，我们不需要编写声明的变量、函数、类的具体实现（因为变量、函数、类在其他库中已经实现了），只需要声明其类型即可，否则会报错

```typescript
declare function toString(x: number) {
  return String(x);
}; // An implementation cannot be declared in ambient contexts.
```

#### 声明类

声明类时，我们只需要声明类的属性、方法的类型即可。

```typescript
declare class Person {
  public name: string;
  private age: number;
  constructor(name: string);
  getAge(): number;
}
const person = new Person('Mike');
person.name; // => string
person.age; // Property 'age' is private and only accessible within class 'Person'.
person.getAge(); // => number
```

#### 声明枚举

声明枚举只需要定义枚举的类型，并不需要定义枚举的值。声明枚举仅用于编译时的检查，编译完成后，声明文件中的内容在编译结果中会被删除。

```typescript
declare enum Direction {
  Up,
  Down,
  Left,
  Right,
}
// 编译出来的 js 只有这一句
const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
```

#### 声明 namespace

不同于声明模块，命名空间一般用来表示具有很多子属性或者方法的全局对象变量。

我们可以将声明命名空间简单看作是声明一个更复杂的变量。

```typescript
declare namespace $ {
  const version: number;
  function ajax(settings?: any): void;
}
$.version; // => number
$.ajax();
```

在 `TypeScript` 中，我们还可以编写以 `.d.ts` 为后缀的声明文件来增强（补齐）类型系统。

目前市面上常见的包，比如 `JQuery`、`React` 这种都有现成的声明文件（`.d.ts`），都是由社区贡献的（直接 `npm i @types/*` 即可）。

### 装饰器（Decorators）

在一些场景下我们需要额外的特性来支持标注或修改类及其成员，装饰器（又叫注解）是一种特殊类型的声明，它能够被附加到类声明，方法， 访问符，属性或参数上。

装饰器使用 `@expression` 这种形式，`expression` 求值后必须为一个函数，它会在运行时被调用，被装饰的声明信息做为参数传入。

装饰器的本质就是一个函数，但是他是一个返回函数的函数。

#### 支持开启

`Javascript` 里的装饰器目前还未正式发布，但在 `TypeScript` 里已做为一项实验性特性予以支持。你必须在命令行或 `tsconfig.json` 里启用 `experimentalDecorators` 编译器选项。

**命令行**：

```sh
tsc --target ES5 --experimentalDecorators
```

**tsconfig.json**：

```json
{
    "compilerOptions": {
        "target": "ES5",
        "experimentalDecorators": true
    }
}
```

#### 使用实例

下面代码是一个使用的样例，装饰器可以装饰的东西很多，装饰器可以装饰类，可以装饰方法，也可以装饰属性，还可以装饰参数，甚至还可以装饰访问器。而且还可以同时使用多个装饰器。

```typescript
@frozen 
class Foo {
  @configurable(false)
  @enumerable(true)
  method() {}

  @throttle(500)
  expensiveMethod() {}
}
```

下面这段代码的意思就是使用 `configurable` 函数对方法 `x()` 和 `y()` 进行配置，如果入参是 `false` 就代表这个方法会变成一个不可配置的方法。

```typescript
class Point {
    private _x: number;
    private _y: number;
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    @configurable(false)
    get x() { return this._x; }

    @configurable(false)
    get y() { return this._y; }
}

function configurable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(target, propertyKey, descriptor)
        descriptor.configurable = value;
    };
}
```

打印出来 `target` 就是类本身，`propertyKey` 是当前方法名称，`descriptor` 是对象的描述信息。

更多例子可以查看[官方文档](https://www.tslang.cn/docs/handbook/decorators.html)。

## 后续进阶内容

- `tsconfig.json` 详细配置
- `React` 中使用 `TS`
- `NodeJS` 中使用 `TS`类型守卫
- 类型守卫
- 类型兼容
- 声明文件开发
