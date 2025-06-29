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
            { text: 'test', link: './test' },
            { text: 'test1', link: './test1' }
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
    }
  },
  // locales: {
  //   root: {
  //     label: '中文',
  //     lang: 'zh-CN',
  //     link: '/'
  //   },
  //   en: {
  //     label: 'English',
  //     lang: 'en-US',
  //     link: '/en/'
  //   }
  // }
})
