# 教科书式的TypeScript类型体操工具——utility-types

> 首发于：2022-09-13

最近一段时间比较忙，好久没有写博客了，正好这段时间跟 TypeScript “杠上”了，刚好又看到一个 github 上的仓库 [utility-types](https://github.com/piotrwitek/utility-types)，写了很多有意思的类型工具，不过这个仓库代码比较老了，最高支持 TypeScript v3.7，所以在新项目的实战中就不太建议直接使用了，不过其源码还是有很多很有价值的东西，所以我想在此进行一些源码分析、学习，以提高自己的 TypeScript 水平。

utility-types 代码比较老了，有一部分它实现的工具类型后来都成为了 TypeScript 的内置工具类型。

## Aliases & Type Guards 别名和类型守卫

[源码地址 https://github.com/piotrwitek/utility-types/blob/master/src/aliases-and-guards.ts](https://github.com/piotrwitek/utility-types/blob/master/src/aliases-and-guards.ts)

### Primitive

就是定义了几个原始类型：

```typescript
export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;
```

### isPrimitive

原始类型的类型守卫：

```typescript
// 源码 : val is Primitive 建议删掉
export const isPrimitive = (val: unknown): val is Primitive => {
  if (val === null || val === undefined) {
    return true;
  }
  switch (typeof val) {
    case 'string':
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'symbol': {
      return true;
    }
    default:
      return false;
  }
};
```



### Falsy

定义了做条件判断时都为 false 的类型：

```typescript
export type Falsy = false | '' | 0 | null | undefined;
```



### isFalsy

Falsy 类型的类型守卫：

```typescript
// 源码的 : val is Falsy 建议删掉
export const isFalsy = (val: unknown): val is Falsy => !val;
```



### Nullish

定义了空类型：

```typescript
export type Nullish = null | undefined;
```



### isNullish

空类型的类型守卫：

```typescript
// 源码的 : val is Nullish 建议删掉
export const isNullish = (val: unknown): val is Nullish => val == null;
```


## Union operators 类型的联合操作

[源码地址 https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts](https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts)

### SetIntersection

获取 A、B 两个类型的交叉类型，和内置的 Extract 一样。

```typescript
export type SetIntersection<A, B> = A extends B ? A : never;
```



### SetDifference

获取 A 类型中有，但 B 类型中没有的类型，与内置的 Exclude 一样。 

```typescript
export type SetDifference<A, B> = A extends B ? never : A;
```



### SetComplement

与 SetDifference 作用一样，但是对后面一个类型增加了一个约束，这个约束即前面那个类型。

```typescript
export type SetComplement<A, A1 extends A> = SetDifference<A, A1>;
```



### SymmetricDifference

获取 A、B 类型中没有的交叉的类型。它与 SetDifference 的不同点在于，SetDifference 只能获取到 A 类型不交叉于 B 类型的部分，而 SymmetricDifference 同时也能获取 B 类型不交叉于 A 类型的部分。

```typescript
export type SymmetricDifference<A, B> = SetDifference<A | B, A & B>;
```



### NonUndefined

排除一个类型中的 undefined 类型，内置有一个 NonNullable，排除 null 和 undefined 类型

```typescript
export type NonUndefined<A> = A extends undefined ? never : A;
```



## Object operators 对象类型的操作

[源码地址 https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts](https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts)

### FunctionKeys

取出一个对象中值为函数类型的键，返回格式是 `'key1' | 'key2' ......`

```typescript
export type FunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never;
}[keyof T];
```

- `T extends object` 就是约束我们传入的泛型都必须是对象类型的
- `[K in keyof T]-?` 是遍历取出对象的键，如果该键是可选属性会被转换成必选属性，这个键用 K 表示
- `NonUndefined<T[K]>` 把取出来的值类型做一个 undefined 过滤
- `extends Function ? K : never` 判断值类型是否为函数类型，如果为函数类型则返回这个键，如果不是则返回 never
- `[keyof T]` 是把前面的结果都取出来，当然 never 的会被忽略掉



### NonFunctionKeys

取出一个对象中值不为函数类型的键，返回格式同上。

```typescript
export type NonFunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? never : K;
}[keyof T];
```

和前面那个很像只是 `extends Function ? never : K` 改变了一下顺序。



### MutableKeys、WritableKeys、ReadonlyKeys

取出对象中可变、可写、只读的成员名，返回格式是 `'key1' | 'key2' ......`

```typescript
export type MutableKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

export type WritableKeys<T extends object> = MutableKeys<T>;

export type ReadonlyKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >;
}[keyof T];

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;
```

这段源码最难的就是要看懂 `IfEquals`，我们先改变一下其书写方式：

```typescript
type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends 
  (<T>() => T extends Y ? 1 : 2)
  ? A : B;
```

这样就清晰多了。

`<T>() => T extends X ? 1 : 2 ` 这个表达式其实在部分情况下它就写个 X 也是可以的，为了帮助理解，我先简化一下：

```typescript
type IfEquals<X, Y, A = X, B = never> = X extends Y ? A : B;
```

不过在某些情况下这个判断会有问题，比如：`X= { readonly x: string } Y = { x: string }`；`X = { x: never }`；`X = { x: string; y: number } Y = { x: string }` 等情况的结果也不对。

所以 `IfEquals` 的作用就是判断 X、Y 两个类型是否相等的，相等返回 A，不相等返回 B。

看懂了 `IfEquals` 再来看 `MutableKeys` 就容易了，其实就是对对象类型的每个成员进行遍历：

- `{ [Q in P]: T[P] }` 原封不动遍历
- `{ -readonly [Q in P]: T[P] }` 去掉 readonly 约束 
- 如果一样就返回键名，不一样则返回 never

`ReadonlyKeys` 只是在返回的时候稍微不一样，如果一样就返回 never，不一样则返回键名



### RequiredKeys、OptionalKeys

取出必选、可选的成员名，返回格式是 `'key1' | 'key2' ......`

```typescript
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
```

- `{} extends Pick<T, K>` 如果 K 是一个可选成员，那么它便不能形成一个有效的约束，所以一个空对象也会被判断为是满足条件的

### PickByValue

通过值类型来 Pick 成员

```typescript
export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>;
```

- `T[Key] extends ValueType ? Key : never` 把匹配 ValueType 类型的 Key 取出来



### PickByValueExact

通过值类型来精确Pick成员，与 `PickByValue` 相比 `PickByValueExact` 的类型匹配更加精确。

比如：类型 number | undefined，PickByValue 可以匹配 number 类型和 number | undefined 类型，而 `PickByValueExact` 只能匹配到 number | undefined 类型

```typescript
export type PickByValueExact<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: [ValueType] extends [T[Key]]
      ? [T[Key]] extends [ValueType]
        ? Key
        : never
      : never;
  }[keyof T]
>;
```


还是先改一下源代码的格式：

```typescript
[ValueType] extends [T[Key]] ? ([T[Key]] extends [ValueType] ? Key : never) : never;
```

- `[T[Key]] extends [ValueType] ? Key : never` 把匹配 ValueType 类型的 Key 取出来（非精确匹配）
- `[ValueType] extends [T[Key]]` 这里是反过来就行了一个匹配，这样就可以过滤掉上面的例子中 number 类型和 number | undefined 类型的情况，因为反过来就匹配不了

### OmitByValue

通过值类型来Omit成员

```typescript
export type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>;
```



### OmitByValueExact

通过值类型来精确Omit成员

```typescript
export type OmitByValueExact<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: [ValueType] extends [T[Key]]
      ? [T[Key]] extends [ValueType]
        ? never
        : Key
      : Key;
  }[keyof T]
>;
```



### Intersection

提取两个对象有交叉的成员

```typescript
export type Intersection<T extends object, U extends object> = Pick<
  T,
  Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>;
```

- `Extract<keyof T, keyof U> & Extract<keyof U, keyof T> ` 从 T 的 Key 中提取 U 的 Key 也有的 Key，再从 U 的 Key 中提取 K 的 Key 也有的 Key，然后再取个交集。最后把这个几个交集里面的 Key 对应的成员从 T 中取出来。



### Diff

提取两个对象中前面这个对象存在但后面这个对象不存在的成员

```typescript
export type Diff<T extends object, U extends object> = Pick<
  T,
  SetDifference<keyof T, keyof U>
>;
// 等价
export type Diff<T extends object, U extends object> = Pick<
  T,
  Exclude<keyof T, keyof U>
>;
```



### Subtract

从 T 类型中减去 T1 类型，其中T1 类型是个对象类型，T 类型满足 T1 类型约束，`Subtract` 与 `Diff` 很相似，只是后者多了传入的两个对象之间的约束关系

```typescript
export type Subtract<T extends T1, T1 extends object> = Pick<
  T,
  SetComplement<keyof T, keyof T1>
>;
```



### Overwrite

将U 类型中与 T 类型键名相同的成员进行覆写，返回覆写后的 T类型。可以传三参数，但是传第三个参数的时候前两个参数就失效了，所以用的时候传两参数即可。

```typescript
export type Overwrite<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T>
> = Pick<I, keyof I>;
```

- `I = Diff<T, U> & Intersection<U, T>` 取出 T 中存在但是 U 中不存在成员，然后以 U 类型为主，取出 T、U 类型的交集，最后把他们并到一起

### Assign

像合并两个对象一样，将 U 类型中的成员合并到 T 类型中

```typescript
export type Assign<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T> & Diff<U, T>
> = Pick<I, keyof I>;
```

- `I = Diff<T, U> & Intersection<U, T> & Diff<U, T>` 取出 T 中存在但是 U 中不存在成员，然后以 U 类型为主，取出 T、U 类型的交集，再取出 U 中存在但是 T 中不存在成员，最后把他们并到一起



### DeepReadonly

就是字面意思：深只读，就是递归将每一层的成员都变成只读类型

```typescript
export type DeepReadonly<T> = T extends ((...args: any[]) => any) | Primitive
  ? T
  : T extends _DeepReadonlyArray<infer U>
  ? _DeepReadonlyArray<U>
  : T extends _DeepReadonlyObject<infer V>
  ? _DeepReadonlyObject<V>
  : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
/** @private */
export type _DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
```

这里使用了递归，直接看让人很不好理解，我把上面的代码拆解成一段意思相近的伪代码，帮助理解：

```typescript
function DeepReadonly(T) {
  // 如果是函数或原始类型
  if (T === ((...args: any[]) => any) | Primitive) {
    return T;
  }
  if (T !== isDeepReadonlyArray(T)) {
    return DeepReadonlyArray(T);
  }
  if (T !== isDeepReadonlyObject(T)) {
    return DeepReadonlyObject(T);
  }
  return T;
}

function DeepReadonlyArray(T) {
  // 数组处理得到 U
  // ...
  return DeepReadonly(U)
}

function DeepReadonlyObject(T) {
  // 对象处理得到 V
  // ...
  return DeepReadonly(V)
}
```



### DeepRequired

深必选所有成员，原理与 `DeepReadonly` 类似

```typescript
export type DeepRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
  ? _DeepRequiredArray<T[number]>
  : T extends object
  ? _DeepRequiredObject<T>
  : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepRequiredArray<T>
  extends Array<DeepRequired<NonUndefined<T>>> {}
/** @private */
export type _DeepRequiredObject<T> = {
  [P in keyof T]-?: DeepRequired<NonUndefined<T[P]>>;
};
```



### DeepNonNullable

深去空，原理与 `DeepReadonly` 类似

```typescript
export type DeepNonNullable<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
  ? _DeepNonNullableArray<T[number]>
  : T extends object
  ? _DeepNonNullableObject<T>
  : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepNonNullableArray<T>
  extends Array<DeepNonNullable<NonNullable<T>>> {}
/** @private */
export type _DeepNonNullableObject<T> = {
  [P in keyof T]-?: DeepNonNullable<NonNullable<T[P]>>;
};
```



### DeepPartial

深可选所有成员，原理与 `DeepReadonly` 类似

```typescript
export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? _DeepPartialArray<U>
  : T extends object
  ? _DeepPartialObject<T>
  : T | undefined;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepPartialArray<T> extends Array<DeepPartial<T>> {}
/** @private */
export type _DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };
```



### Optional

将 T 对象的 K 键变成可选成员，如果省略 K 就是把 T 对象的所有成员变成可选

```typescript
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;
```

- `Omit<T, K>` 排除匹配 K 键名的成员
- `Partial<Pick<T, K>>` 把 K 键名的成员提取出来，并都变成可选
- 把上面的两个结果合并起来



### ValuesType

把数组、类数组、对象的成员的类型都取出来

```typescript
export type ValuesType<
  T extends ReadonlyArray<any> | ArrayLike<any> | Record<any, any>
> = T extends ReadonlyArray<any>
  ? T[number]
  : T extends ArrayLike<any>
  ? T[number]
  : T extends object
  ? T[keyof T]
  : never;
```

如果是数组、类数组就取出数组的元素类型，如果是对象就取出对象成员的键的联合类型



### Mutable、Writable

去掉成员的 readonly ，让其变成一个可变或者叫可写成员

```typescript
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
export type Writable<T> = Mutable<T>;
```



### AugmentedRequired

将指定成员变成必选属性

```typescript
export type AugmentedRequired<
  T extends object,
  K extends keyof T = keyof T
> = Omit<T, K> & Required<Pick<T, K>>;
```

- 与 `Optional` 原来类似



## Special operators 特殊的类型操作

[源码地址 https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts](https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts)

### Unionize

将对象类型的成员全员取出来，返回其每个成员组成的联合类型

```typescript
export type Unionize<T extends object> = {
  [P in keyof T]: { [Q in P]: T[P] };
}[keyof T];
```



### PromiseType

取出 Promise 包裹的返回类型

```typescript
export type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;
```

- `Promise<infer U>` 可以自行推断出 Promise 包裹的返回类型并赋值给 U



### Brand

我也没体会到它的作用是啥😅

```typescript
export type Brand<T, U> = T & { __brand: U };
```



### UnionToIntersection

联合类型转交叉类型，如 `T1 | T2` -> `T1 & T2`

```typescript
export type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never;
```

- 第一步 `(U extends any ? (k: U) => void : never)` 这里主要是把传入的 U 类型（联合类型）转化成 `(T1 extends any ? (k: T1) => void : never) | (T2 extends any ? (k: T2)=> void : never) | ...`
- 第二步 `(k: T1) => void | (k: T2) => void extends ((k: infer I) => void)` 利用 infer 的特性同一类型变量的多个候选类型将会被推断为交叉类型




## Flow's Utility Types

[源码地址 https://github.com/piotrwitek/utility-types/blob/master/src/utility-types.ts](https://github.com/piotrwitek/utility-types/blob/master/src/utility-types.ts)

### $Keys

和 `keyof` 作用一样，但是增加了 object 约束

```typescript
export type $Keys<T extends object> = keyof T;
```



### $Values

取出对象的值的所有类型

```typescript
export type $Values<T extends object> = T[keyof T];
```



### $ReadOnly

把一个对象类型的成员（包括其深层的成员）都变成只读类型

```typescript
export type $ReadOnly<T extends object> = DeepReadonly<T>;
```



### $Diff

同 `Subtract`

```typescript
export type $Diff<T extends U, U extends object> = Pick<
  T,
  SetComplement<keyof T, keyof U>
>;
```



### $PropertyType

获取给定的属性类型

```typescript
export type $PropertyType<T extends object, K extends keyof T> = T[K];
```



### $ElementType

通过键名或键类型获取数组、元祖或者对象对应成员的类型

```typescript
export type $ElementType<
  T extends { [P in K & any]: any },
  K extends keyof T | number
> = T[K];
```



### $Call

等价内置的 `ReturnType`

```typescript
export type $Call<Fn extends (...args: any[]) => any> = Fn extends (
  arg: any
) => infer RT
  ? RT
  : never;
```



### $Shape

把一对象类型的成员都变成可选成员

```typescript
export type $Shape<T extends object> = Partial<T>;
```



### $NonMaybeType

等价 `NonNullable`，排除 null 与 undefined

```typescript
export type $NonMaybeType<T> = NonNullable<T>;
```



### Class

获取 T 类型的构造函数类型

```typescript
export type Class<T> = new (...args: any[]) => T;
```



### mixed

```typescript
export type mixed = unknown;
```



## 延伸阅读

[https://github.com/type-challenges/type-challenges/blob/main/README.zh-CN.md](https://github.com/type-challenges/type-challenges/blob/main/README.zh-CN.md)

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html)
