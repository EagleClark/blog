# Vue3开发实践的其中一种范式

> 首发于：2023-05-17

## 技术选型

- 包管理工具使用 [pnpm](https://pnpm.io/)
- 语言选择 [TypeScript](https://www.typescriptlang.org/)
- core 使用 [Vue3.2](https://vuejs.org/)，并采用组合式 API，两种风格的使用场景可以参考 [官网的说明](https://cn.vuejs.org/guide/introduction.html#api-styles)
- 打包构建使用 [Vite](https://vitejs.dev/)
- UI 库我这里以使用 [Ant Design Vue](https://antdv.com/)，故 CSS 预处理语言使用 [less](https://lesscss.org/)（这里根据自己的需求、技术栈、UI 库的相适性进行选择）。
- 状态管理使用 [pinia](https://pinia.vuejs.org/)
- 路由使用 [Vue Router](https://router.vuejs.org/)
- 国际化使用 [Vue I18n](https://vue-i18n.intlify.dev/)
- 请求等一些实用组件使用 [VueUse](https://vueuse.org/)
- 代码检查及格式化使用 [Eslint](https://eslint.org/)、[StyleLint](https://stylelint.io/)、[Prettier](https://prettier.io/)
- Git 代码提交校验使用  [Husky](https://typicode.github.io/husky/#/)、[commitlint](https://commitlint.js.org/#/)

## 初始化项目

我们使用 Vite 来初始化一个项目：

```bash
pnpm create vite --template vue-ts
```

初始化完成后我将得到一个 demo 项目，其目录结构如下所示（使用 [mddir](https://github.com/JohnByrneRepo/mddir) 生成）：

```
|-- vue3-vite
    |-- .gitignore
    |-- README.md
    |-- index.html
    |-- package.json
    |-- pnpm-lock.yaml
    |-- tsconfig.json
    |-- tsconfig.node.json
    |-- vite.config.ts
    |-- .vscode
    |   |-- extensions.json
    |-- public
    |   |-- vite.svg
    |-- src
        |-- App.vue
        |-- main.ts
        |-- style.css
        |-- vite-env.d.ts
        |-- assets
        |   |-- vue.svg
        |-- components
            |-- HelloWorld.vue
```

项目的 git 并未初始化，我们可以初始化一下：

```bash
git init

git add .

git commit -m"first commit"
```



## UI 库配置

这里我们以 `Ant Design Vue` 为例，该 UI 库使用的是 `Less` 所以我们先引入一下 `Less` 支持：

```bash
pnpm install less -D
```

安装 `Ant Design Vue`：

```bash
pnpm i ant-design-vue -S
```

根据[官方文档](https://www.antdv.com/docs/vue/introduce-cn)我们使用 `Vite` 按需引入：

安装 `unplugin-vue-components`，他可以帮助我们在全局自动按需导入 UI 库的各种组件，写代码的时候就可以省去大量的 `import` 语句：

```bash
pnpm i unplugin-vue-components -D
```

`vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
  ],
});
```

配置好之后项目跑起来就会自动生成一个文件 `components.d.ts`，可以把它放到各种 `ignore` 文件中，另外，还需要放入 `tsconfig.json` 中。

```diff
{
  // ...
  "include": [
    // ...
+    "./components.d.ts"
  ],
  // ...
}
```



最后，再引入一下 `ant-design-vue` 的 `less` 文件即可（暂时先引入到 `main.ts` 查看效果）：

```diff
+import 'ant-design-vue/dist/antd.less';
// ...
createApp(App).mount('#app');
```

注意：有时候我们的 Antd 的组件类型无法在 IDE 中显示，需要手动安装一下 `@vue/runtime-core`。



## 代码检查及格式化配置

### ESLint

使用 ESLint 来检查 `.ts`，`.vue` 文件里面的 TS 代码。

安装：

```bash
pnpm i eslint -D
```

然后，初始化：

```bash
eslint --init
```

然后，根据提示和自己的习惯配置即可，我的配置 `.eslintrc.json` 配置如下：

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended"
  ],
  "overrides": [],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["vue", "@typescript-eslint"],
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "max-len": ["error", 120],
    "no-undef": "off"
  }
}
```

再添加一个 `.eslintignore` 文件用于忽略我们不想检查的文件或目录，比如：

```
/node_modules
/dist
.DS_Store
.cache
```

执行如下命令进行错误检查：

```bash
eslint -c .eslintrc.json . --ext .ts,.vue
```

增加 `--fix` 可以自动修复可自动修复的错误：

```bash
eslint -c .eslintrc.json . --ext .ts,.vue --fix
```

上面的命令可以添加到 `package.json` 中，另外还增加了缓存机制：

```diff
{
  // ...
  "scripts": {
    // ...
+   "lint:eslint": "eslint -c .eslintrc.json . --ext .ts,.vue --cache --cache-location \"./.cache/\" --max-warnings 0",
+   "format:eslint": "eslint -c .eslintrc.json . --ext .ts,.vue  --cache --cache-location \"./.cache/\" --fix",
  },
  // ...
}
```



### StyleLint

使用 `StyleLint` 来检查 `.less` 和 `.css` 语法。

安装 `StyleLint` 及其标准配置：

```bash
pnpm install stylelint stylelint-config-standard -D
```

安装 `less` 标准配置和语法解析：

```bash
pnpm i stylelint-config-standard-less postcss-less -D
```

安装 `vue` 推荐配置：

```bash
pnpm install postcss-html stylelint-config-recommended-vue -D
```

新建配置文件 `.stylelintrc.json`：

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-standard-less",
    "stylelint-config-recommended-vue"
  ],
  "overrides": [
    {
      "files": ["**/*.less"],
      "customSyntax": "postcss-less"
    },
    {
      "files": ["**/*.html"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

再添加一个 `.stylelintignore` 文件用于忽略我们不想检查的文件或目录，比如：

```
/node_modules
/dist
.DS_Store
.cache
```

添加到 `package.json` 中，执行就可以进行错误检查和自动修复：

```diff
{
  // ...
  "scripts": {
    // ...
+   "lint:style": "stylelint -c .stylelintrc.json \"./**/*.{css,less,vue,html}\" --cache --cache-location \"./.cache/\"",
+   "format:style": "stylelint -c .stylelintrc.json \"./**/*.{css,less,vue,html}\"  --cache --cache-location \"./.cache/\" --fix",
  },
  // ...
}
```



### Prettier

`Prettier` 是我们格式化代码的主要工具，自动保存格式化就靠他了。

安装：

```bash
pnpm install --save-dev --save-exact prettier
```

新建配置文件 `.prettierrc.json`：

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false
}
```

再添加一个 `.prettierignore ` 文件用于忽略我们不想检查的文件或目录，比如：

```
/node_modules
/dist
.DS_Store
.cache
```

添加到 `package.json` 中，执行就可以进行自动修复了：

```diff
{
  // ...
  "scripts": {
    // ...
+   "format:prettier": "prettier --write \"./**/*.{html,vue,ts,js,json,md}\"",
+   "format": "pnpm run format:prettier && pnpm run format:eslint && pnpm run format:style",
  },
  // ...
}
```

最后，添加一个 vscode 的配置 `.vscode/settings.json`，用于自动保存并使用 `Prettier` 格式化：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```



## Git 代码提交校验配置

使用 `Git` 提交代码的时候我们需要一些校验避免未 `lint` 的代码提交上库。

安装和初始化 `Husky`：

```bash
pnpm dlx husky-init && pnpm install
```

咱们上一个章节不是配置了很多 `lint` 的命令吗，我们将其合并一下：

```diff
{
  // ...
  "scripts": {
    // ...
+   "lint:tsc": "tsc --noEmit",
+   "lint": "pnpm run lint:tsc && pnpm run lint:eslint && pnpm run lint:style",
  },
  // ...
}
```

再修改一下 `.husky/pre-commit`：

```diff
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

-npm test
+pnpm run lint
```

这时去提交代码就会去执行 `pnpm run lint`，如果出错就无法完成提交。

如果遇到如下错误：

```
src/main.ts:3:17 - error TS2307: Cannot find module './App.vue' or its corresponding type declarations.
```

可以添加一个文件 `src/env.d.ts`：

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const vueComponent: DefineComponent<{}, {}, any>;
  export default vueComponent;
}
```

然后，再使用 [commitlint](https://commitlint.js.org/#/) 搞一个提交信息的校验以规范我们在提交代码时的描述信息。

安装：

```bash
pnpm install -D @commitlint/cli @commitlint/config-conventional
```

新建配置文件 `commitlint.config.cjs`，提交格式参考 [GitHub - conventional-changelog/commitlint: 📓 Lint commit messages](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)：

```javascript
/* eslint-disable no-undef */
const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build', // 主要目的是修改项目构建系统（例如glup，webpack，rollup的配置等）的提交
        'ci', // 修改项目的持续集成流程（Kenkins、Travis等）的提交
        'chore', // 构建过程或辅助工具的变化
        'docs', // 文档提交（documents）
        'feat', // 新增功能（feature）
        'fix', // 修复 bug
        'pref', // 性能、体验相关的提交
        'refactor', // 代码重构
        'revert', // 回滚某个更早的提交
        'style', // 不影响程序逻辑的代码修改、主要是样式方面的优化、修改
        'test', // 测试相关的开发,
      ],
    ],
  },
};

module.exports = Configuration;
```

最后，添加 husky 配置：

```bash
npx husky add .husky/commit-msg  'npx --no -- commitlint --config commitlint.config.cjs --edit ${1}'
```

提交代码的描述举例：

```bash
# 注意冒号后面的空格不能省略
git commit -m"feat: 添加各种配置"
```



## 主题配置

主题切换的方案有很多种，这里我们使用 `CSS 变量 + 类名的方式`，切换丝滑，不过不适用于有动态主题需求的项目。

我们先引入一个一下 [VueUse](http://www.vueusejs.com/)，用于响应式操作 `localStorage`，不过它的功能并不限于此，可以说我们需要的很多功能性的 `hook` 都被它封装好了：

```bash
pnpm i @vueuse/core
```

创建 `theme/index.ts`：

```typescript
import { useStorage } from '@vueuse/core';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export const currentTheme = useStorage<Theme>('theme', Theme.LIGHT);

document.querySelector('html')?.setAttribute('class', currentTheme.value);

export const changeTheme = (theme: Theme) => {
  document.querySelector('html')?.setAttribute('class', theme);
  currentTheme.value = theme;
};
```

`light.less`：

```less
:root {
  --primary-color: #fff;
}
```

`dark.less`：

```less
.dark {
  --primary-color: #000;
}
```

`theme.less`

```less
// 这里面也可以引入一些其它 less 文件
@import url('ant-design-vue/dist/antd.less');
@import url('./light.less');
@import url('./dark.less');
```



## 国际化配置

国际化配置选择 `vue-i18n`。

安装：

```bash
pnpm install vue-i18n -S
```

然后，创建 `locale/index.ts`：

```typescript
import { createI18n } from 'vue-i18n';
import { useStorage } from '@vueuse/core';
import zh from './zh';
import en from './en';

export enum Language {
  ZH = 'zh',
  EN = 'en',
}

// 为了让 localStorage 的 key 不会别别处覆盖，可以将 'lang' 这样的 key 定义在一个枚举中作为一种优化手段
export const currentLang = useStorage<Language>('lang', Language.ZH);

const messages = {
  zh,
  en,
};

const i18n = createI18n({
  locale: Language.ZH,
  messages,
});

export const changeLang = (lang: Language) => {
  i18n.global.locale = lang;
  currentLang.value = lang;
};

i18n.global.locale = currentLang.value;

export { i18n };
```

各个语言都放在自己的文件夹下，我们以中文为例：

`zh/index.ts`

```typescript
import common from './common';

export default {
  common,
};
```

`zh/common.ts`

```typescript
export default {
  confirm: '确认',
  cancel: '取消',
};
```

`main.ts` 添加：

```diff
// ...
+import { i18n } from './locale';
+const app = createApp(App);
+app.use(i18n);
// ...
```



我这里没有写 UI 库相关的国际化，这部分内容都可以参考 UI 自己的文档，比如：[Ant Design Vue 的 国际化文档](https://www.antdv.com/docs/vue/i18n-cn)



## 路由配置

路由配置选择 `vue-router`。

安装：

```bash
pnpm install vue-router
```

`router/index.ts`：

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const AppHome = () => import('../bussiness/home/index.vue');
const HelloWorld = () => import('../components/HelloWorld.vue');
const NotFound = () => import('../components/NotFound.vue');

const routes = [
  { path: '/', component: AppHome },
  { path: '/home', component: HelloWorld },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  // 路由守卫
  console.log(to, from);
});

router.afterEach((to, from) => {
  // 路由守卫
  console.log(to, from);
});
```

`main.ts` 添加：

```diff
// ...
+import { router } from './router';
// ...
+app.use(router);
// ...
```

这里只展示了一些基本用法，详细用法还是得看官方文档。



## 状态管理

状态管理首选 `pinia`。

安装：

```bash
pnpm install pinia
```

`store/index.ts`：

```typescript
import { createPinia, defineStore } from 'pinia';
export const pinia = createPinia();

export const useAlertsStore = defineStore('alerts', {
  // other options...
});
```

`index.ts` 中可以定义一些全局的状态，某个业务相关状态定义到业务代码中即可。

`main.ts` 添加：

```diff
// ...
+import { pinia } from './store';
// ...
+app.use(pinia);
// ...
```



## 请求

请求使用 `VueUse` 的 `useFetch`，用它可以很好的享受到`响应式`所带来的便利。

`util/api.ts`

```typescript
import { MaybeRefOrGetter, UseFetchOptions, UseFetchReturn, createFetch } from '@vueuse/core';

const fetchInstance = createFetch({
  baseUrl: '.',
  options: {
    timeout: 30 * 1000,
    // 请求之前，注入 token、修改 headers 等
    beforeFetch({ options }) {
      return { options };
    },
    // 请求成功之后的处理逻辑
    afterFetch({ data, response }) {
      return { data, response };
    },
    // 请求失败之后的处理逻辑
    onFetchError({ data, error }) {
      return { data, error };
    },
  },
  fetchOptions: {
    mode: 'cors',
    credentials: 'same-origin',
  },
});

const FETCH_OPTIONS_KEY = [
  'fetch',
  'immediate',
  'refetch',
  'initialData',
  'timeout',
  'beforeFetch',
  'afterFetch',
  'onFetchError',
];

const isFetchOptions = (options: RequestInit | UseFetchOptions): options is UseFetchOptions => {
  for (const [key] of Object.entries(options)) {
    if (!FETCH_OPTIONS_KEY.includes(key)) {
      return false;
    }
  }

  return true;
};

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

const createMyFetch = (method: Method) => {
  function useFetch<T>(
    url: MaybeRefOrGetter<string>,
  ): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>;
  function useFetch<T>(
    url: MaybeRefOrGetter<string>,
    useFetchOptions: UseFetchOptions,
  ): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>;
  function useFetch<T>(
    url: MaybeRefOrGetter<string>,
    options: RequestInit,
    useFetchOptions?: UseFetchOptions,
  ): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>;
  function useFetch<T>(
    url: MaybeRefOrGetter<string>,
    options?: RequestInit | UseFetchOptions,
    useFetchOptions?: UseFetchOptions,
  ): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>> {
    if (!options) {
      return fetchInstance<T>(url).json()[method]();
    }
    if (isFetchOptions(options)) {
      return fetchInstance<T>(url, options).json()[method]();
    } else {
      return fetchInstance<T>(url, options, useFetchOptions).json()[method]();
    }
  }

  return useFetch;
};

const useGet = (() => createMyFetch('get'))();

const usePost = (() => createMyFetch('post'))();

const usePut = (() => createMyFetch('put'))();

const useDelete = (() => createMyFetch('delete'))();

const usePatch = (() => createMyFetch('patch'))();

const useHead = (() => createMyFetch('patch'))();

const useOptions = (() => createMyFetch('patch'))();

export { useGet, usePost, useDelete, usePut, usePatch, useHead, useOptions };
```

一般在业务代码中我们会创建业务专属的 `api.ts` 文件，我们应该在这个文件中处理所有跟接口相关的事情，接口如果然仅有一些不影响页面样式的变化，那么就只需要修改该文件即可，举个例子：

`bussiness/user/api.ts`

```typescript
import { useGet } from './util/api';

interface User {
  name: string;
  age: number;
  email: string;
}

interface ApiRes<T> {
  code: number;
  data: T;
  description: string;
}

// 立即执行
export const getUser = () => {
  const { isFetching, data } = useGet<ApiRes<User>>('/api/user');

  // compute 中可以做更多数据处理，也可以解决响应式丢失的问题
  return {
    isFetching,
    data: computed(() => data.value?.data ?? { name: '--', age: -1, email: '--' }),
  };
};

// 非立即执行
// export const getUser = () => {
//   const { isFetching, execute, data } = useGet<ApiRes<User>>('/api/user', { immediate: false });

//   // compute 中可以做更多数据处理，也可以解决响应式丢失的问题
//   return {
//     isFetching,
//     data: computed(() => data.value?.data ?? { name: '--', age: -1, email: '--' }),
//     execute,
//   };
// };
```

`bussiness/user/user.vue` 中使用。

立即执行使用：

```vue
<script setup lang="ts">
import { getUser } from './api';

const { isFetching, data } = getUser();
</script>

<script lang="ts">
export default { name: 'UserCard' };
</script>

<template>
    <div v-if="isFetching">{{ 'loading' }}</div>
    <div v-else>
      <p>{{ data.name }}</p>
      <p>{{ data.age }}</p>
      <p>{{ data.email }}</p>
    </div>
</template>

<style scoped lang="less"></style>
```

不立即执行使用：

```vue
<script setup lang="ts">
import { getUser } from './api';

const { isFetching, data, execute } = getUser();
</script>

<script lang="ts">
export default { name: 'UserCard' };
</script>

<template>
    <a-button type="primary" @click="() => execute()">{{ 'test' }}</a-button>
    <div v-if="isFetching">{{ 'loading' }}</div>
    <div v-else>
      <p>{{ data.name }}</p>
      <p>{{ data.age }}</p>
      <p>{{ data.email }}</p>
    </div>
</template>

<style scoped lang="less"></style>
```

## 开发工具及打包构建配置

这里无疑是使用 Vite，下面来说一下具体的配置。

其实前面我们已经写了一些配置项了，不过这里为了更多好用的功能，需要再完善一下结构。

### 结构修改并引入环境变量

```typescript
import { defineConfig, loadEnv } from 'vite';
// ...

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    // ...
  };
});
```

- `command` 在 development 模式下为 `serve`，production 模式下为 `build`

- `mode` 是指当前运行的模式，即 `development` 和 `production`

- 不同的 `mode` 会加载不同的环境变量文件，不管什么模式都会加载 `.env`

- development 会额外加载 `.env.development`，production 会额外加载 `.env.production`

- `define` 里面是定义全局变量，`__APP_ENV__` 可以在代码中直接使用，`APP_ENV` 要在环境变量配置文件中配置

- 如果要让 `__APP_ENV__` 在使用的时候不报错需要在 `vite-env.d.ts` 中声明一下（`declare const __APP_ENV__: string;`）



### 自动导入 `Vue` 的 `API`

配置了自动导入之后我们就不需要每次使用 `compute`、`ref` 等 Vue 的 API 时都去 `import` 了。

安转：

```bash
pnpm i -D unplugin-auto-import
```

`vite.config.ts` 中使用：

```diff
+import AutoImport from 'unplugin-auto-import/vite'
// ...

export default defineConfig(({ command, mode }) => {
  // ...
  plugins: [
     // ...
+    AutoImport({
+      imports: ['vue'],
+    }),
  ],
});
```

配置好之后项目跑起来就会自动生成一个文件 `auto-imports.d.ts`，可以把它放到各种 `ignore` 文件和 `tsconfig.json` 中。

```diff
{
  // ...
  "include": [
    // ...
+    "./auto-imports.d.ts"
  ],
  // ...
}
```



### Proxy 配置

我们需要连接后端的时候一般来说就需要搞一个代码，这样我们在开发环境中就可以无感地连接到后端。

```diff
// ...

export default defineConfig(({ command, mode }) => {
  // ...
  return {
    // ...
+    server: {
+      proxy: {
+        '/api': {
+          target: 'http://localhost:3000',
+          changeOrigin: true,
+          rewrite: (path) => path.replace(/^\/api/, ''),
+        },
+      },
+    },
  };
});
```

`target` 也可以使用环境变量，这样配置起来更方便。



### HTTPS 配置

安装插件：

```bash
pnpm i @vitejs/plugin-basic-ssl -D
```

添加配置项：

```diff
// ...
+import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command, mode }) => {
  return {
    // ...
    plugins: [
      // ...
+      basicSsl(),
    ],
    server: {
      // ...
+      https: true,
    },
  };
});
```

### 路径别名

路径别名主要是为了解决路径写起来层级过深等问题。

```diff
// ...
+import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  return {
    // ...
+    resolve: {
+      alias: {
+        '@': resolve(__dirname, './src'),
+        '@locale': resolve(__dirname, './src/locale'),
+      },
+    },
    // ...
  };
});
```

虽然配置了 `vite.config.ts` 之后虽然是可用的，但是 IDE 会报错，还需要配置一下 `tsconfig.json`：

```diff
{
  "compilerOptions": {
    /* ... */

+    "baseUrl": ".",
+    "paths": {
+      "@/*": ["src/*"],
+      "@locale/*": ["src/locale/*"]
+    }
  },
  /* ... */
}
```

### Mock 配置

安装：

```bash
# 这里踩了个坑，3.0.0 版本有问题，故使用2
pnpm i mockjs vite-plugin-mock@2 -D
```

添加 `vite.config.ts` 配置项：

```diff
// ...
+import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(({ command, mode }) => {
  return {
    // ...
    plugins: [
      // ...
+      viteMockServe({
+        mockPath: './src/mock',
+        localEnabled: command === 'serve' || mode === 'mock',
+      }),
    ],
	// ...
  };
});
```

这里的配置意为着我们使用 `vite --mode mock` 的时候，发请求就会走 `mock` 服务器，而不是 `proxy` 代理那个服务器。

mock 文件放在 `src/mock` 目录下：

```typescript
import { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/one',
    method: 'get',
    timeout: 1000,
    response: () => {
      return { // some object ... };
    },
  },
] as MockMethod[];

```

### SVG 雪碧图

[GitHub - vbenjs/vite-plugin-svg-icons: Vite Plugin for fast creating SVG sprites.](https://github.com/vbenjs/vite-plugin-svg-icons)

### 完整配置文件

```typescript
import { UserConfigExport, defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const config: UserConfigExport = {
    // vite 配置
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@locale': resolve(__dirname, './src/locale'),
      },
    },
    plugins: [
      vue(),
      Components({
        resolvers: [AntDesignVueResolver()],
      }),
      AutoImport({
        imports: ['vue'],
      }),
      basicSsl(),
    ],
    server: {
      https: true,
    },
  };

  if (command === 'serve' && mode === 'mock') {
    config.plugins.push(
      viteMockServe({
        mockPath: './src/mock',
        enable: true,
      }),
    );
  } else {
    config.server.proxy = {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    };
  }

  return config;
});
```

## 目录结构规划

经过了前面的各种配置之后，我们的目录结构现在的样子如下：

```
|-- vue
    |-- .env
    |-- .env.development
    |-- .env.production
    |-- .eslintignore
    |-- .eslintrc.json
    |-- .gitignore
    |-- .prettierignore
    |-- .prettierrc.json
    |-- .stylelintignore
    |-- .stylelintrc.json
    |-- README.md
    |-- auto-imports.d.ts
    |-- commitlint.config.cjs
    |-- components.d.ts
    |-- index.html
    |-- package.json
    |-- pnpm-lock.yaml
    |-- tsconfig.json
    |-- tsconfig.node.json
    |-- vite.config.ts
    |-- .cache
    |-- .husky
    |   |-- commit-msg
    |   |-- pre-commit
    |   |-- _
    |       |-- .gitignore
    |       |-- husky.sh
    |-- .vscode
    |   |-- extensions.json
    |   |-- settings.json
    |-- dist
    |-- public
    |   |-- vite.svg
    |-- src
        |-- App.vue
        |-- env.d.ts
        |-- main.ts
        |-- style.less
        |-- vite-env.d.ts
        |-- assets
        |   |-- vue.svg
        |-- bussiness
        |   |-- home
        |       |-- index.vue
        |-- components
        |   |-- HelloWorld.vue
        |   |-- NotFound.vue
        |-- constant
        |-- locale
        |   |-- index.ts
        |   |-- en
        |   |   |-- common.ts
        |   |   |-- index.ts
        |   |-- zh
        |       |-- common.ts
        |       |-- index.ts
        |-- mock
        |   |-- index.ts
        |-- router
        |   |-- index.ts
        |-- store
        |   |-- index.ts
        |-- theme
        |   |-- dark.less
        |   |-- index.ts
        |   |-- light.less
        |   |-- theme.less
        |-- util
            |-- api.ts
```

大概解释一下目录规划的原则：

- `src` 放着项目的核心逻辑，各个模块都放在这个目录之下。
- `bussiness` 放业务代码，界面都在这个目录下，各个功能模块（比如：`home`）都放在这个目录下，功能模块下会放该功能专业的 `api.ts`、`type.ts`、`*.vue`、`store.ts`、`image` 等，功能模块所需的东西都就近放置，比较好找。
- `components` 放置公共组件。
- `constant` 放置公共的常量。
- `locale` 放置国际化相关的内容，各个语言又有自己独有的目录。
- `mock` 放置 mock 代码。
- `router` 放置路由代码。
- `store` 放置全局的 store。
- `theme` 放置主题相关代码。
- `util` 放置公共的工具函数。



## 总结

这只是一种 `Vue3` 项目的实践，对新手来说，去从零搭建一个可用的项目可能还是比较有参考价值的，对于高手来说就可以忽略了。

前面介绍的很多配置也都是一个初始化的状态，在实践中，代码和业务越来越多的过程中，可能还会遇到各种问题，都需要我们去解决，当然前文中有哪些配置得不合理的，也欢迎大家友善交流。

项目地址：https://github.com/EagleClark/vue3-vite
