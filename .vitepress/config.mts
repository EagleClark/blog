import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Eagle Clark",
  description: "Eagle Clark's blog.",
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  vite: {
    assetsInclude: ['**/*.image', '**/*.awebp'],
  },
  markdown: {
    image: {
      lazyLoading: true,
    }
  },
  themeConfig: {
    
    logo: { src: '/favicon.png', width: 24, height: 24 },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: "技术文章",
        items: [
          { text: "我的掘金", link: "https://juejin.cn/user/2875978150314408/columns" },
          { text: "前端核心基础", link: "/article/front-end/JavaScript模块化" },
          { text: "前端框架", link: "/article/front-end-framework/Vue3开发实践的其中一种范式" },
          { text: "走向全栈", link: "/article/full-stack/SSE/" },
          { text: "数据结构与算法", link: "/article/data-structures-and-algorithms/复杂度分析" },
          { text: "设计模式", link: "/article/design-patterns/设计原则/" },
          { text: "AI", link: "/article/ai/Ollama部署本地大模型" },
        ],
      },
      { text: '关于我', link: '/about' },
    ],

    sidebar: {
      '/article/front-end/': [
        {
          text: '语言（JS/TS）',
          collapsed: true,
          items: [
            { text: 'Babel', link: '/article/front-end/Babel' },
            { text: 'JavaScript模块化', link: '/article/front-end/JavaScript模块化' },
            { text: 'TypeScript基础', link: '/article/front-end/TypeScript基础' },
            { text: 'TypeScript进阶', link: '/article/front-end/TypeScript进阶' },
            { text: 'TypeScript类型体操', link: '/article/front-end/TypeScript类型体操' },
          ]
        },
        {
          text: '基本功',
          collapsed: true,
          items: [
            { text: '跨域', link: '/article/front-end/跨域/' },
            { text: '前端测试', link: '/article/front-end/前端测试/' },
          ]
        },
        {
          text: '进阶',
          collapsed: true,
          items: [
            { text: 'HTTPS到底是如何保障我们的安全的', link: '/article/front-end/HTTPS到底是如何保障我们的安全的/' },
            { text: '浏览器CryptoAPI实践指南之ECDH', link: '/article/front-end/浏览器CryptoAPI实践指南之ECDH/' },
            { text: '微前端', link: '/article/front-end/微前端' },
          ]
        }
      ],
      '/article/front-end-framework': [
        {
          text: '前端框架',
          items: [
            { text: 'Vue3开发实践的其中一种范式', link: '/article/front-end-framework/Vue3开发实践的其中一种范式' },
            { text: 'Vue2数据双向绑定原理', link: '/article/front-end-framework/Vue2数据双向绑定原理/' },
            { text: 'Angular基础', link: '/article/front-end-framework/Angular基础/', },
          ]
        }
      ],
      '/article/full-stack': [
        {
          text: '走向全栈',
          collapsed: true,
          items: [
            { text: 'SSE', link: '/article/full-stack/SSE/' },
            { text: 'GraphQL', link: '/article/full-stack/graphql/', },
            { text: 'Docker', link: '/article/full-stack/docker/', },
            { text: 'Nginx——正向代理、反向代理', link: '/article/full-stack/nginx/', },
          ]
        },
        {
          text: '数据库',
          collapsed: true,
          items: [
            { text: 'Redis基础', link: '/article/full-stack/redis/', },
            { text: 'InfluxDB基础', link: '/article/full-stack/InfluxDB/', },
          ]
        }
      ],
      '/article/data-structures-and-algorithms': [
        {
          text: '数据结构与算法',
          items: [
            { text: '复杂度分析', link: '/article/data-structures-and-algorithms/复杂度分析', },
            { text: '栈', link: '/article/data-structures-and-algorithms/栈', },
            { text: '队列', link: '/article/data-structures-and-algorithms/队列', },
            { text: '链表', link: '/article/data-structures-and-algorithms/链表', },
            { text: '跳表', link: '/article/data-structures-and-algorithms/跳表/', },
            { text: '散列表', link: '/article/data-structures-and-algorithms/散列表', },
            { text: '二叉树', link: '/article/data-structures-and-algorithms/二叉树/', },
            { text: '堆', link: '/article/data-structures-and-algorithms/堆/', },
            { text: '二分查找', link: '/article/data-structures-and-algorithms/二分查找', },
            { text: '排序', link: '/article/data-structures-and-algorithms/排序/', },
            { text: '0-1背包问题', link: '/article/data-structures-and-algorithms/0-1背包问题', },
          ]
        }
      ],
      '/article/design-patterns': [
        {
          text: '设计模式',
          items: [
            { text: '设计原则', link: '/article/design-patterns/设计原则/', },
            { text: '单例模式', link: '/article/design-patterns/单例模式', },
            { text: '工厂模式', link: '/article/design-patterns/工厂模式', },
            { text: '抽象工厂模式', link: '/article/design-patterns/抽象工厂模式', },
            { text: '建造者模式', link: '/article/design-patterns/建造者模式', },
            { text: '代理模式', link: '/article/design-patterns/代理模式', },
            { text: '享元模式', link: '/article/design-patterns/享元模式', },
            { text: '适配器模式', link: '/article/design-patterns/适配器模式', },
            { text: '装饰者模式', link: '/article/design-patterns/装饰者模式', },
            { text: '外观模式', link: '/article/design-patterns/外观模式', },
            { text: '组合模式', link: '/article/design-patterns/组合模式', },
            { text: '桥接模式', link: '/article/design-patterns/桥接模式', },
            { text: '观察者模式与发布订阅模式', link: '/article/design-patterns/观察者模式/', },
            { text: '策略模式', link: '/article/design-patterns/策略模式', },
            { text: '状态模式', link: '/article/design-patterns/状态模式', },
            { text: '模板方法模式', link: '/article/design-patterns/模板方法模式', },
            { text: '迭代器模式', link: '/article/design-patterns/迭代器模式', },
            { text: '命令模式', link: '/article/design-patterns/命令模式/', },
            { text: '职责链模式', link: '/article/design-patterns/职责链模式', },
            { text: '中介者模式', link: '/article/design-patterns/中介者模式', },
          ]
        }
      ],
      '/article/ai/': [
        {
          text: 'AI',
          items: [
            { text: 'Ollama部署本地大模型', link: '/article/ai/Ollama部署本地大模型', },
            { text: '快速搭建自己的RAG知识库', link: '/article/ai/快速搭建自己的RAG知识库/', },
            { text: '提示词工程', link: '/article/ai/提示词工程', },
            { text: '基于LangChain实现Function call', link: '/article/ai/基于LangChain实现Function call', },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EagleClark/blog/tree/vitepress' }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    footer: {
      message: '京ICP备18043750号',
      copyright: 'Copyright © 2025-present Eagle Clark'
    },

    notFound: {
      title: '页面未找到',
      quote:
        '但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。',
      linkLabel: '前往首页',
      linkText: '带我回首页'
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容'
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      link: '/'
    },
  }
})
