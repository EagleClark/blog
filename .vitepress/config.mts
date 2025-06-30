import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Eagle Clark",
  description: "Eagle Clark's blog.",
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
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
          { text: "AI", link: "/article/ai/Ollama部署本地大模型" },
        ],
      },
      { text: '关于我', link: '/about' },
    ],

    sidebar: {
      '/article/front-end/': [
        {
          text: '前端核心基础',
          items: [
            { text: 'JavaScript模块化', link: '/article/front-end/JavaScript模块化' },
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
          ]
        }
      ],
      '/article/full-stack': [
        {
          text: '走向全栈',
          items: [
            { text: 'SSE', link: '/article/full-stack/SSE/' },
            { text: 'GraphQL', link: '/article/full-stack/graphql/', },
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
          ]
        }
      ],
      '/article/design-patterns': [
        {
          text: '设计模式',
          items: [
            { text: '设计原则', link: '/article/design-patterns/设计原则/', },
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
