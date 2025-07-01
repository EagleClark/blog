# TypeScript进阶

> 首发于：2022-05-22

平时开发项目、工作对 TS 的使用频率越来越高，从最开始只会用 `string`、`number`、`boolean` 到 `类类型`、`联合类型`、`交叉类型` 以及 `泛型`，我以为这就差不多了，但是事实上项目做多了之后就会发现这些仍然不够用，还是有很多场景无法很方便地去定义类型，于是我便开始了 TS 的一些更高级的用法的探索。

## keyof

`keyof` 用于索引查询，执行的结果为某个类型的索引公共属性 key 的联合：

```typescript
interface IUser {
  name: string;
  readonly age: number;
  addr?: string;
}

// UserKeyType 其实就是 'name' | 'age' | 'addr'
type UserKeyType = keyof IUser
```

## Readonly

该关键字用于把所有属性变成只读属性。注意是大写的 `Readonly`，它是为每一个 key 添加 `readonly` 只读关键字。

```typescript
type ReadonlyUserType = Readonly<IUser>
```

其原理就是为每个 key 都增加一个 `readonly` 修饰符：

```typescript
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

## Partial

该关键字用于把所有属性变成可选属性。

```typescript
type PartialUserType = Partial<IUser>
```

其原理就是遍历每一个属性并设置为可选：

```typescript
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

## Required

该关键字用于把所有属性变成必选属性。

```typescript
type RequiredUserType = Required<IUser>
```

其原理就是遍历每一个属性并设置为必选：

```typescript
type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

## Pick

有时候我需要挑选一组属性，组成新的类型，就适合使用 `Pick`，这样可以简洁很多。

```typescript
type PickUserType = Pick<IUser, 'name' | 'age'>
```

`K extends keyof T` 意为 K 由 T 的 key 来约束，其原理是遍历 K，提取 T 中对应的属性：

```typescript
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

## Exclude

顾名思义，排除，从联合类型 T 中 排除联合类型 U 中出现的项。

```typescript
type Exclude<T, U> = T extends U ? never : T;
```

例子：

```typescript
type ExcludeType1 = Exclude<'age' | 'name', 'xxx'>
const E1_1: ExcludeType1 = 'name';
const E1_2: ExcludeType1 = 'age';
type ExcludeType2 = Exclude<'age' | 'name', 'age'>
const E2_1: ExcludeType2 = 'name';
const E2_2: ExcludeType2 = 'age'; // 报错
type ExcludeType3 = Exclude<'age', 'age' | 'name'> // never
```

## Extract

提取联合类型 T 与 联合类型U 的交集，没有交集返回 never 类型。

```typescript
type Extract<T, U> = T extends U ? T : never;
```

例子：

```typescript
type ExtractType1 = Extract<'age' | 'name', 'xxx'> // never
type ExtractType2 = Extract<'age' | 'name', 'age'>
const E2_1: ExtractType2 = 'name'; // 报错
const E2_2: ExtractType2 = 'age';
type ExtractType3 = Extract<'age', 'age' | 'name'>
const E3: ExtractType3 = 'age';
```

## Omit

从类型 T 中剔除 K 中的所有属性。利用 `Exclude` 来排除 K 中属性，再用 `Pick` 提取剩下的属性，这其实是一个与 `Pick` 相反的操作。

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

例子：

```typescript
type OmitUserType = Omit<IUser, 'name' | 'age'>
const O1: OmitUserType = {
  addr: '',
};
```

## Record

有时候我们想定义一个对象（object），但是里面的属性又不是固定的，我看到很多小伙伴是用的 `Object`、`object`。

```typescript
const obj: object = {};

const obj: Object = {};
```

事实上这样定义非常难用，后面要用这个对象的时候，你什么都 `.` 不出来， `.` 什么都报错，于是有人为了不报错，直接就定义成 `any` 类型了。

还有一些小伙伴水平稍微高一点，使用了 `interface 的索引签名`，比如这样：

```typescript
interface IObj {
  [key: string]: string,
}
const obj: IObj = {};
```

这样就什么都能 `.` 出来了，不过这个方法有点儿麻烦，而且如果这个对象的值类型不是一个 `string` 而是另一个对象怎么办呢，再定义一个 `interface` 吗？这未免也太麻烦了吧！

`Record` 其实就能为我们解决这个问题，看个例子：

```typescript
// key 为任意 string，值为任意 string 的对象
const obj: Record<string, string> = {};
```

下面来看一下 `Record` 的实现原理：

```typescript
// keyof any 为 string | number | symbol
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

## NonNullable

用于剔除类型中的 `null` 和 `undefined` 类型。

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

例子：

```typescript
type NonNullableType = NonNullable<string | null | undefined>

const n1: NonNullableType = '';
const n2: NonNullableType = null; // 报错
const n3: NonNullableType = undefined; // 报错
```

## Parameters

用于获取函数类型的参数类型，返回一个参数的类型的元祖。

```typescript
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

- `(...args: any) => any` 其实用 `Funtion` 也行。

- `infer` 关键字的作用是让 TS 自己推导类型，并将推导结果存储在其参数绑定的类型上，`infer` 只能在 `extends` 条件类型上使用。

例子：

```typescript
type FuncType = (arg1: string, arg2: number) => boolean
type ParamType = Parameters<FuncType>
const P: ParamType = ['arg1', 2]; // [string, number] 类型
```

## ReturnType

用于获取函数类型的返回值类型。

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

例子：

```typescript
type FuncType = (arg1: string, arg2: number) => boolean
type RType = ReturnType<FuncType>
const R: RType = false; // boolean 类型
```

## ConstructorParameters

用于获取类的构造函数的参数类型，返回一个参数类型的元祖。

```typescript
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;
```


例子：

```typescript
class Test {
  arg1 = 0;
  arg2: string | undefined = '';
  constructor(arg1: number, arg2?: string) {
    this.arg1 = arg1;
    this.arg2 = arg2;
  }
}

type ConType = ConstructorParameters<typeof Test>;
const C: ConType = [1, 'test']; // [arg1: number, arg2?: string | undefined]
```

```typescript
interface TestClass {
  new(arg1: number, arg2?: string): TestClass; // 这种写法一般用在 .d.ts 文件里面声明类类型用
  prop1: number;
  prop2: number;
}

type CType = ConstructorParameters<TestClass>
```


## InstanceType

用于获取构造函数的返回值类型。

```typescript
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
```

例子：

```typescript
interface TestClass {
  new(arg1: number, arg2?: string): TestClass;
  prop1: number;
  prop2: number;
}

type InstType = InstanceType<TestClass>
```

```typescript
class Test {
  arg1 = 0;
  arg2: string | undefined = '';
  constructor(arg1: number, arg2?: string) {
    this.arg1 = arg1;
    this.arg2 = arg2;
  }
}

type InstType = InstanceType<typeof Test>
const I: InstType = new Test(0); // Test
```

## Uppercase 与 Lowercase

对字符串类型的类型进行大小写处理。

```typescript
type UP = Uppercase<'aaa'> // 'AAA'
type L = Lowercase<'AAA'> // 'aaa'
```


## Capitalize 与 Uncapitalize

对字符串类型的类型进行首字母大小写处理。

```typescript
type C = Capitalize<'test'> // 'Test'
type UC = Uncapitalize<'TEst'> // 'tEst'
```

## 总结

其实把泛型、`extends`、`infer`、`in` 等关键字的用法掌握好，我们还可以封装出更多适合我们自己项目的高级类型工具。

推荐一个比较好的高级类型工具的 github 项目 [utility-types](https://github.com/piotrwitek/utility-types)。

[TS 官方文档](https://www.typescriptlang.org/docs/handbook/utility-types.html)
