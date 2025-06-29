# 浏览器CryptoAPI实践指南之ECDH

> 首发于：2024-10-30

## 前言

最近做一个需求需要用到前端的一些加密的东西，在我原来的认知中似乎只有 [crypto-js](https://www.npmjs.com/package/crypto-js) 这个选择，不过我发现他并不支持需求中要求的 [ECC 算法](https://zh.wikipedia.org/wiki/%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E5%AF%86%E7%A0%81%E5%AD%A6)。找了办法发现原来浏览器自己就有现成的 API 可以支持很多种加解密算法，不过网上的参考资料并不多，主要参考资料还是 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Crypto_API) 的相关章节，就是里面的部分内容比较晦涩，还涉及密码学的一些内容，不仔细看，写出来的代码各种报错，让人莫不着头脑，所以便有了这篇。

本文首先会介绍 `Crypto API` 的基础使用方法，再介绍 `ECDH` 到底怎么“玩儿”。

## Crypto API 基础使用

### 密钥对生成

#### 核心API

密钥对生成的核心 API 是 `window.crypto.subtle.generateKey(algorithm, extractable, keyUsages)`。

algorithm 指的是加密算法，是个对象，比如：我们使用 `AES-GCM` 算法，那么这个算法对象就要包含算法的名称和密钥的长度。

```json
{
    name: "AES-GCM",
    length: 256,
},
```

当然，不同的加密算法对象的内容是不一样的，这个要根据实际情况而定。

extractable 参数，布尔值，指的是生成的密钥是否可被 `exportKey` 和 `wrapKey` 这两个API导出。

为什么还需要导出呢？因为 `generateKey` 生成的密钥是一个JS的对象，并不是我们平时所理解的一个密钥字符串，他被隐匿了起来，在很多场景下使用这些密钥就直接用JS的对象即可，也不需要知道具体的密钥字符串。

keyUsages 参数，数组，表示生成出来的密钥可以被用于做什么，数组元素的值有：

- `encrypt`：密钥可用于加密消息。
- `decrypt`：密钥可用于解密消息。
- `sign`：密钥可用于对消息进行签名。
- `verify`：密钥可用于验证。
- `deriveKey`：密钥可用于派生新的密钥。
- `deriveBits`：密钥可用于派生比特序列。
- `wrapKey`：密钥可用于包装一个密钥。
- `unwrapKey`：密钥可用于解开一个密钥的包装。

这里的每个取值都对应着一个 API，如果用途参数中不包含某个 API，那么这个 API 在使用这个密钥时就会报错。

#### 密钥生成实例

一个 `AES-GCM` 密钥生成实例。

```javascript
const key = await window.crypto.subtle.generateKey(
  {
    name: "AES-GCM",
    length: 256,
  },
  true,
  ["encrypt", "decrypt"],
);

console.log(key);
// CryptoKey {type: "secret", extractable: true, algorithm: {…}, usages: Array(2)}
```

生成的这个 `key` 就可以用于加密和解密消息，不过正如我前面所说的，这个 `key` 的具体值是什么我们无法看见，仅体现为一个 `CryptoKey` 类型的对象。

### 密钥的导出导入

#### 导出核心API

密钥导出主要是为了能让 `CryptoKey` 这个 JS 对象可以变成我们平常所熟知的密钥的样子，这样也才能和其他程序进行交互。

密钥导出核心 API 为 `window.crypto.subtle.exportKey(format, key)`。

format 参数，字符串，指的是密钥导出之后用什么格式表示，具体值如下：

- `raw`：Raw格式，用于导出 `AES`、`HMAC` 的密钥，或椭圆曲线算法的公钥。
- `pkcs8`：PKCS #8 格式，用于导出 `RSA` 和椭圆曲线算法的私钥。
- `spki`：SubjectPublicKeyInfo 格式，导出 `RSA` 和椭圆曲线算法的公钥。
- `jwk`：JSON Web Key 格式，导出 `RSA` 和椭圆曲线算法的公钥或私钥，以及 `AES` 和 `HMAC` 的密钥。

key 参数就是 `CryptoKey` 类型的对象，可由 `generateKey` 和 `importKey` 函数生成。

这么说可能比较抽象，下面一一生成并导出一下。

##### raw

```javascript
const key = await window.crypto.subtle.generateKey(
  {
    name: "AES-GCM",
    length: 256,
  },
  true,
  ["encrypt", "decrypt"],
);

const exported = await window.crypto.subtle.exportKey('raw', key);

console.log(exported);
// ArrayBuffer(32)

const exportedKeyBuffer = new Uint8Array(exported);
console.log(`[${exportedKeyBuffer}]`);
// [78,12,68,41,104,187,92,65,2,155,130,107,166,15,80,220,19,95,215,42,127,79,119,96,109,80,78,233,217,116,31,36]
```

##### pkcs8

```javascript
const keyPair = await window.crypto.subtle.generateKey(
  {
    name: "ECDH",
    namedCurve: "P-256",
  },
  true,
  ["deriveKey", "deriveBits"],
);

console.log(keyPair);
// {publicKey: CryptoKey, privateKey: CryptoKey}

const exported = await window.crypto.subtle.exportKey(
  "pkcs8",
  keyPair.privateKey
);
// ArrayBuffer转字符串
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

const exportedAsString = ab2str(exported);
// 字符串转Base64
const exportedAsBase64 = window.btoa(exportedAsString);
const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
console.log(pemExported);
```

打印内容如下：

```
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg1LbprneezxxcAoCmOMGZQavsMXl+99yzjt4696yjJmKhRANCAATKC7hc3+DJkI6dPL4YvP9JMBjwwBdtF7Y1CBIDBU5iC54rxOZVUa5yIYH5LaNqVxbXodIecFvj8eg5wkHf/eci
-----END PRIVATE KEY-----
```

##### spki

```javascript
// 生成密钥代码与pkcs8的一样

const exported = await window.crypto.subtle.exportKey(
  "spki",
  keyPair.publicKey
);
// ArrayBuffer转字符串
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

const exportedAsString = ab2str(exported);
// 字符串转Base64
const exportedAsBase64 = window.btoa(exportedAsString);
const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
console.log(pemExported);
```

打印内容如下：

```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE4jET8HSPfDA9PqKWGczt9GPqlU+gaDuWrn2zUKzTXLiVfXpZhuqtCTW9spocNQ5M4qeoEqYMPtVTUE2Il04aCA==
-----END PUBLIC KEY-----
```

##### jwk

```javascript
// 生成密钥代码与pkcs8的一样

const exported = await window.crypto.subtle.exportKey(
  "jwk",
  keyPair.publicKey
);

console.log(JSON.stringify(exported));
// '{"crv":"P-256","ext":true,"key_ops":[],"kty":"EC","x":"4jET8HSPfDA9PqKWGczt9GPqlU-gaDuWrn2zUKzTXLg","y":"lX16WYbqrQk1vbKaHDUOTOKnqBKmDD7VU1BNiJdOGgg"}'
```

#### 导入核心API

导入即上面导出的逆操作，在与其他程序交互的时候，其他程序是不会给前端传 `CryptoKey` 这种对象的，所以要在前端使用其他程序传过来的密钥就需要使用导入 API 来生成一个前端能用的 `CryptoKey` 对象。

密钥导出核心 API 为 `window.crypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages)`。

format 参数与 `exportKey` 的相同。

keyData 则是包含了给定格式的密钥，即 JS 中的 `ArrayBuffer`、`TypedAray`、`DataView`、`JSONWebKey`对象。

algorithm、extractable、keyUsages 三个参数则与 `generateKey` 的相同。

下面是一些实例。

##### raw

一般用于导入 `AES` 和 `HMAC` 的密钥，或椭圆曲线算法的公钥。这种格式的密钥需要已包含密钥的原始字节的 `ArrayBuffer` 对象的形式提供。

```javascript
// getRandomValues方法让你可以获取符合密码学要求的安全的随机值。
// 传入参数的数组被随机值填充（在加密意义上的随机）。
// 入参类型为 TypedArray（Int8Array、Uint8Array、Int16Array、 Uint16Array、 Int32Array 或者 Uint32Array）
const rawKey = window.crypto.getRandomValues(new Uint8Array(32));

const secretKey = await window.crypto.subtle.importKey(
  "raw",
  rawKey,
  "AES-GCM",
  true,
  ["encrypt", "decrypt"]
);

console.log(secretKey); // 打印一个 CryptoKey 对象
```

##### pkcs8

一般用于导入 `RSA` 和椭圆曲线算法的私钥。

```javascript
// 这是一个椭圆曲线算法的私钥
const pemEncodedKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg1LbprneezxxcAoCmOMGZQavsMXl+99yzjt4696yjJmKhRANCAATKC7hc3+DJkI6dPL4YvP9JMBjwwBdtF7Y1CBIDBU5iC54rxOZVUa5yIYH5LaNqVxbXodIecFvj8eg5wkHf/eci
-----END PRIVATE KEY-----`;

// 从字符串转ArrayBuffer
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// 定义pem格式秘钥的开头结尾
const pemHeader = "-----BEGIN PRIVATE KEY-----";
const pemFooter = "-----END PRIVATE KEY-----";
// 截取去除开头和结尾的秘钥内容
const pemContents = pemEncodedKey.substring(pemHeader.length, pemEncodedKey.length - pemFooter.length);
// 将base64编码的内容解码为字符串
const binaryDerString = window.atob(pemContents);
// 从字符串转ArrayBuffer
const binaryDer = str2ab(binaryDerString);

const privateKey = await window.crypto.subtle.importKey(
  "pkcs8",
  binaryDer,
  {
    name: "ECDH",
    namedCurve: "P-256",
  },
  true,
  ["deriveKey", "deriveBits"],
);

console.log(privateKey); // 打印一个 CryptoKey 对象
```

用上一个章节的 `exportKey` 去导出可以得到同样的 `pemEncodedKey`。

##### spki

`SubjectPublicKeyInfo` 导入 `RSA` 和椭圆曲线算法的公钥。

```javascript
// 这是一个椭圆曲线算法的公钥
const pemEncodedKey = `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEXtwNxY8AssNPy4usjTZcAwFpBP1vMaIVFFGeO/WUmvnR9FLsHRIEqaRyguD/runjP5eGpOYvamuyV9QaR38uyen/0D0+wB/oDhKiKX37rx0pQC9BLcAxjhVyZXOd+Ljz
-----END PUBLIC KEY-----`;

// 此处省略与上面pkcs8相同的中间过程和代码皆

const pemHeader = "-----BEGIN PUBLIC KEY-----";
const pemFooter = "-----END PUBLIC KEY-----";

// 此处省略与上面pkcs8相同的中间过程和代码皆

const publicKey = await window.crypto.subtle.importKey(
  "spki",
  binaryDer,
  {
    name: "ECDH",
    namedCurve: "P-384",
  },
  true,
  [], // 注意此处为空数组，可以正常使用，否则会报错；不同的 algorithm 该参数会不一样
);

console.log(publicKey); // 打印一个 CryptoKey 对象
```

用上一个章节的 `exportKey` 去导出可以得到同样的 `pemEncodedKey`。

##### jwk

`JSON Web Key` 格式，导入 `RSA` 和椭圆曲线算法的公钥或私钥，以及 `AES` 和 `HMAC` 的密钥。

```javascript
// 从给定的 JSON Web Key 对象导入一个 ECDSA 私有签名密钥
const jwkEcKey = {
  crv: "P-384",
  d: "wouCtU7Nw4E8_7n5C1-xBjB4xqSb_liZhYMsy8MGgxUny6Q8NCoH9xSiviwLFfK_",
  ext: true,
  key_ops: ["sign"],
  kty: "EC",
  x: "SzrRXmyI8VWFJg1dPUNbFcc9jZvjZEfH7ulKI1UkXAltd7RGWrcfFxqyGPcwu6AQ",
  y: "hHUag3OvDzEr0uUQND4PXHQTXP5IDGdYhJhL-WLKjnGjQAw0rNGy5V29-aV-yseW",
};


const key = await window.crypto.subtle.importKey(
  "jwk",
  jwkEcKey,
  {
    name: "ECDSA",
    namedCurve: "P-384",
  },
  true,
  ["sign"],
);

console.log(key); // 打印一个 CryptoKey 对象
```

### 数据加密解密

#### 加密核心 API

加密的核心 `API` 为 `window.crypto.subtle.encrypt(algorithm, key, data)`。

algorithm 为一个算法对象，支持 [RSA-OAEP](https://developer.mozilla.org/en-US/docs/Web/API/RsaOaepParams)、[AES-CTR](https://developer.mozilla.org/en-US/docs/Web/API/AesCtrParams)、[AES-CBC](https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams)、[AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams) 四种加密算法，具体对象字段参见`MDN`。

key 为一个 `CryptoKey` 对象。

data 待加密数据的 `ArrayBuffer`、`TypedArray` 或 `DataView`。

下面是一个实例：

```javascript
// 生成密钥，用于加密
const key = await window.crypto.subtle.generateKey(
  {
    name: "AES-GCM",
    length: 256,
  },
  true,
  ["encrypt", "decrypt"],
);

const iv = window.crypto.getRandomValues(new Uint8Array(12));

const enc = new TextEncoder();
const encoded = enc.encode("abcdefg");

const ciphert = await window.crypto.subtle.encrypt(
  { name: "AES-GCM", iv: iv },
  key,
  encoded,
);

console.log(ciphert); // 输出一个 ArrayBuffer(23)
```

#### 解密核心 API

解密的核心 `API` 为 `window.crypto.subtle.decrypt(algorithm, key, data)`。参数与加密的完全相同。

下面是一个实例，解密上面加密那个实例的数据：

```javascript
// 加密的代码见前一个实例

const textArrayBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphert);
console.log(textArrayBuffer); // 输出一个 ArrayBuffer(7)

const decoder = new TextDecoder();
const ciphertext = decoder.decode(textArrayBuffer);
console.log(ciphertext); // abcdefg
```

## ECDH

### 简介

回到前言中说的需求，其实这个需求本身很简单，其实就是要让后端给前端发个公钥，然后前端用这个公钥加密了数据再发回后端，后端用私钥解密，就完事儿了，说实话最开始我觉得用 `RSA` 做就可以了，事实上这也确实可以。但是领导加了个要求，说得用 `ECC`，不能用 `RSA`。

不过也能理解，比较总的来说 `ECC` 更加先进吧，下面是在网上找的一个对比表格：

| 对比项目 | ECC 加密算法 | RSA 加密算法 |
| ----- | ----- | ----- |
| 密钥长度 | 256位 | 2048位 |
| CPU 占用 | 较少 | 较高 |
| 内存占用 | 较少 | 较高 |
| 网络消耗 | 较少 | 较高 |
| 加密效率 | 较高 | 一般 |
| 抗攻击性 | 较强 | 一般 |
| 兼容范围 | 新版浏览器和操作系统均支持，但存在少数不支持的平台。例如 cPanel | 均支持 |

说了半天还没说 `ECDH`，下面正式介绍一下他吧。

`ECDH` 全称是椭圆曲线迪菲-赫尔曼密钥交换（Elliptic Curve Diffie–Hellman key exchange），主要是用来在一个不安全的通道中建立起安全的共有加密资料。

### 数据交互流程简介

话不多说，直接上图。

![ECDH.png](./image/ECDH.png)

1. 浏览器与服务端各种生成自己的密钥对
2. 浏览器与服务端交换公钥，浏览器的公钥发送给服务端，服务端的公钥发送给浏览器
3. 浏览器使用自己的私钥与服务端的公钥派生共享密钥，服务端使用自己的私钥与浏览器的公钥派生共享密钥，这俩共享密钥是相同的（这背后的数学原理不在此展开了）
4. 浏览器的明文数据将使用共享密钥加密后发送给服务端，服务端收到密文之后使用共享密钥解密出明文
5. 服务端的明文数据将使用共享密钥加密后发送给浏览器，浏览器收到密文之后使用共享密钥解密出明文

### 派生共享密钥

#### 核心 API

派生共享密钥的核心 API 为 `deriveKey(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages)`。

algorithm 指要用到的派生算法，对象类型，支持 [ECDH](https://developer.mozilla.org/en-US/docs/Web/API/EcdhKeyDeriveParams)、[HKDF](https://developer.mozilla.org/zh-CN/docs/Web/API/HkdfParams)、[PBKDF2](https://developer.mozilla.org/en-US/docs/Web/API/Pbkdf2Params) 三种算法。

baseKey 派生算法的输入，以 `ECDH` 为例，这里就是密钥对中的私钥。

derivedKeyAlgorithm 派生密钥算法，对象类型，支持 [HMAC](https://developer.mozilla.org/zh-CN/docs/Web/API/HmacKeyGenParams)、[AES-CTR](https://developer.mozilla.org/en-US/docs/Web/API/AesKeyGenParams)、[AES-CBC](https://developer.mozilla.org/en-US/docs/Web/API/AesKeyGenParams)、[AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/AesKeyGenParams)、[AES-KW](https://developer.mozilla.org/en-US/docs/Web/API/AesKeyGenParams)。

extractable 与 keyUsages 参数和 `generateKey` 的一样。

#### 示例代码

```javascript
await window.crypto.subtle.deriveKey(
  {
    name: "ECDH",
    public: publicKey,
  },
  privateKey,
  {
    name: "AES-GCM",
    length: 256,
  },
  true,
  ["encrypt", "decrypt"],
);
```

### 完整实例

#### 实例业务简介（以下故事纯属虚构）

小蓝和小红是地下党的同志，经常需要传递一些秘密情报，不能让反动派的小灰知道。小灰怀疑小蓝和小红是地下党，所以总是想窃听小蓝和小红的对话。所以小蓝和小红就非常需要一个秘密的渠道来进行情报传递，所以我们的需求就来了。

#### 完整代码

```javascript
// 小蓝生成了一个自己的密钥对，里面有公私钥
const blueKeyPair = await window.crypto.subtle.generateKey(
  {
    name: "ECDH",
    namedCurve: "P-384",
  },
  false,
  ["deriveKey"]
);

// 小红也需要一个密钥对，不过小红没有用浏览器API生成而是不知道从哪儿搞了一对，导入了进来

// 这是一个椭圆曲线算法的私钥
const pemEncodedKey = `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDBIQw7fNBif4aU4b9Mm62opxyRYb+NThuiHTn4tV8GkTnSiayeGJB3PEewB3/j3M36hZANiAARe3A3FjwCyw0/Li6yNNlwDAWkE/W8xohUUUZ479ZSa+dH0UuwdEgSppHKC4P+u6eM/l4ak5i9qa7JX1BpHfy7J6f/QPT7AH+gOEqIpffuvHSlAL0EtwDGOFXJlc534uPM=
-----END PRIVATE KEY-----`;

// 从字符串转ArrayBuffer
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// 定义pem格式秘钥的开头结尾
const pemHeader = "-----BEGIN PRIVATE KEY-----";
const pemFooter = "-----END PRIVATE KEY-----";
// 截取去除开头和结尾的秘钥内容
const pemContents = pemEncodedKey.substring(pemHeader.length, pemEncodedKey.length - pemFooter.length);
// 将base64编码的内容解码为字符串
const binaryDerString = window.atob(pemContents);
// 从字符串转ArrayBuffer
const binaryDer = str2ab(binaryDerString);

const redPrivateKey = await window.crypto.subtle.importKey(
  "pkcs8",
  binaryDer,
  {
    name: "ECDH",
    namedCurve: "P-384",
  },
  true,
  ["deriveKey", "deriveBits"],
);

// 这是一个椭圆曲线算法的公钥
const pemEncodedKey1 = `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEXtwNxY8AssNPy4usjTZcAwFpBP1vMaIVFFGeO/WUmvnR9FLsHRIEqaRyguD/runjP5eGpOYvamuyV9QaR38uyen/0D0+wB/oDhKiKX37rx0pQC9BLcAxjhVyZXOd+Ljz
-----END PUBLIC KEY-----`;

const pemHeader1 = "-----BEGIN PUBLIC KEY-----";
const pemFooter1 = "-----END PUBLIC KEY-----";

// 截取去除开头和结尾的秘钥内容
const pemContents1 = pemEncodedKey1.substring(pemHeader1.length, pemEncodedKey1.length - pemFooter1.length);
// 将base64编码的内容解码为字符串
const binaryDerString1 = window.atob(pemContents1);
// 从字符串转ArrayBuffer
const binaryDer1 = str2ab(binaryDerString1);

const redPublicKey = await window.crypto.subtle.importKey(
  "spki",
  binaryDer1,
  {
    name: "ECDH",
    namedCurve: "P-384",
  },
  true,
  [],
);

// 由于我们的代码就是个模拟，所以公钥交换的过程我们就省略了，再次都可以直接拿到
// 小蓝生成自己的共享密钥
const blueSecretKey = await window.crypto.subtle.deriveKey(
  {
    name: "ECDH",
    public: redPublicKey,
  },
  blueKeyPair.privateKey,
  {
    name: "AES-GCM",
    length: 256,
  },
  true,
  ["encrypt", "decrypt"]
);

// 小红生成自己的共享密钥
const redSecretKey = await window.crypto.subtle.deriveKey(
  {
    name: "ECDH",
    public: blueKeyPair.publicKey,
  },
  redPrivateKey,
  {
    name: "AES-GCM",
    length: 256,
  },
  true,
  ["encrypt", "decrypt"]
);

// 小蓝使用共享密钥加密自己的数据发送给小红
const iv = window.crypto.getRandomValues(new Uint8Array(12));
const blueEnc = new TextEncoder();
const blueEncoded = blueEnc.encode('Hello Red! I am Blue.');
const blueCipherText = await window.crypto.subtle.encrypt(
  {
    name: "AES-GCM",
    iv,
  },
  blueSecretKey,
  blueEncoded,
);

// 小红使用自己的共享密钥来解密
const decrypted = await window.crypto.subtle.decrypt(
  {
    name: "AES-GCM",
    iv,
  },
  redSecretKey,
  blueCipherText,
);
const redDec = new TextDecoder();
const redEncoded = redDec.decode(decrypted);

console.log(redEncoded); // Hello Red! I am Blue.

// 小红用自己共享密钥加密数据发给小蓝，小蓝用自己的共享密钥解开的过程是一样的，就不再重复写一遍了
```
