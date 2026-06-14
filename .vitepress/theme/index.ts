import { h } from "vue";
import { type Theme, inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";
import './styles.css'
import confetti from './components/confetti.vue';
import busuanzi from 'busuanzi.pure.js';
import VisitorPanel from './components/VisitorPanel.vue';
import Layout from './components/Layout.vue';

let mermaidMod: typeof import('mermaid') | null = null;
let idCounter = 0;
let renderLock = false;

function getVitePressTheme(): 'dark' | 'default' {
  if (!inBrowser) return 'default';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'default';
}

async function renderMermaid() {
  if (!inBrowser || renderLock) return;
  renderLock = true;

  try {
    // 清理之前可能残留的渲染结果
    document.querySelectorAll('.mermaid-rendered').forEach(el => el.remove());
    document.querySelectorAll('pre.mermaid').forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    if (!mermaidMod) {
      mermaidMod = await import('mermaid');
    }

    const theme = getVitePressTheme();
    mermaidMod.default.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme,
    });

    // 兜底：把 VitePress 默认渲染的 pre code.language-mermaid 替换成 pre.mermaid
    document.querySelectorAll('pre code.language-mermaid').forEach((code) => {
      const pre = code.parentElement;
      if (!pre) return;
      const mermaidPre = document.createElement('pre');
      mermaidPre.className = 'mermaid';
      mermaidPre.textContent = code.textContent || '';
      pre.replaceWith(mermaidPre);
    });

    const elements = document.querySelectorAll('pre.mermaid');
    for (const el of elements) {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.display === 'none') continue;

      const code = el.textContent || '';
      try {
        const id = `mermaid-${++idCounter}`;
        const { svg } = await mermaidMod.default.render(id, code);
        const container = document.createElement('div');
        container.className = 'mermaid-rendered';
        container.innerHTML = svg;
        htmlEl.style.display = 'none';
        el.after(container);
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
    }
  } finally {
    renderLock = false;
  }
}

async function reRenderMermaid() {
  if (!inBrowser || !mermaidMod) return;

  // 如果正在渲染，延迟重试
  if (renderLock) {
    setTimeout(reRenderMermaid, 50);
    return;
  }

  document.querySelectorAll('.mermaid-rendered').forEach((el) => el.remove());
  document.querySelectorAll('pre.mermaid').forEach((el) => {
    (el as HTMLElement).style.display = '';
  });

  await renderMermaid();
}

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    const { app, router } = ctx;
    app.component("confetti", confetti);
    app.component("VisitorPanel", VisitorPanel);

    if (inBrowser) {
      // 延迟到 requestAnimationFrame，等 VitePress hydration 和主题应用完成后再渲染
      requestAnimationFrame(() => renderMermaid());

      const originalOnAfterRouteChange = router.onAfterRouteChange;
      router.onAfterRouteChange = () => {
        originalOnAfterRouteChange?.();
        busuanzi.fetch();
        renderMermaid();
      };

      const observer = new MutationObserver(() => {
        reRenderMermaid();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  },
  Layout: () => {
    return h(Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  }
} satisfies Theme;
