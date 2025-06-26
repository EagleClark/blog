import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blog',
  title: "Eagle Clark",
  description: "Eagle Clark's blog.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
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
          text: 'Examples',
          items: [
            { text: 'test', link: './test' },
            { text: 'test1', link: './test1' }
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
            { text: '快速搭建自己的RAG知识库', link: '/article/ai/快速搭建自己的RAG知识库/', }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    outline: {
      level: [1, 2],
      label: '页面导航'
    },
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      link: '/'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/'
    }
  }
})
