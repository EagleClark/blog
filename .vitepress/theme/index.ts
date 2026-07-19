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
      // 防止复杂图表内容被裁剪
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true },
      gantt: { useMaxWidth: true },
      journey: { useMaxWidth: true },
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

        // 修复 SVG 纵向裁剪：mermaid 生成的节点高度经常不够
        const svgEl = container.querySelector('svg');
        if (svgEl) {
          svgEl.setAttribute('width', '100%');
          svgEl.removeAttribute('height');

          // 延迟到浏览器布局完成后修正节点高度
          requestAnimationFrame(() => {
            // 1. 修正 foreignObject 高度 —— mermaid 算多行中文/emoji 文本时经常偏小
            const foreignObjects = svgEl.querySelectorAll('foreignObject');
            foreignObjects.forEach((fo) => {
              const div = fo.querySelector('div');
              if (!div) return;
              const textHeight = div.scrollHeight;
              const foHeight = parseFloat(fo.getAttribute('height') || '0');
              if (textHeight > foHeight) {
                const diff = textHeight - foHeight;
                // 撑高 foreignObject
                fo.setAttribute('height', String(textHeight));
                // 找到同节点下的 rect，同步撑高
                const nodeGroup = fo.closest('g');
                if (nodeGroup) {
                  // rect 可能在 nodeGroup 下（mermaid v11 结构）或上一层
                  const rect = nodeGroup.querySelector(':scope > rect')
                    || nodeGroup.parentElement?.querySelector(':scope > rect');
                  if (rect) {
                    const rectH = parseFloat(rect.getAttribute('height') || '0');
                    rect.setAttribute('height', String(rectH + diff));
                  }
                }
              }
            });

            // 2. 修正 viewBox 高度，确保所有内容都在视口内
            try {
              let maxBottom = 0;
              const walk = (el: Element) => {
                for (const child of el.children) {
                  try {
                    const bbox = (child as SVGGraphicsElement).getBBox?.();
                    if (bbox && bbox.height > 0) {
                      maxBottom = Math.max(maxBottom, bbox.y + bbox.height);
                    }
                  } catch { /* 跳过 */ }
                  walk(child);
                }
              };
              walk(svgEl);
              if (maxBottom > 0) {
                const vb = svgEl.getAttribute('viewBox');
                if (vb) {
                  const parts = vb.split(/\s+/).map(Number);
                  const padded = maxBottom + 24;
                  if (padded > parts[3]) {
                    svgEl.setAttribute('viewBox', `${parts[0]} ${parts[1]} ${parts[2]} ${padded}`);
                  }
                }
              }
            } catch { /* 容错 */ }
          });
        }

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
