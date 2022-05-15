import { MARKED_CLASS_NAME } from './Markdown';

export type WindowType = Window & typeof globalThis & { MathJax: any};

/**
 * 注入 MathJax 以支持 markdown 的数学公式解析
 */
function injectMathJax() {
  if (!(window as WindowType).MathJax) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.head.appendChild(script);
  }
}

/**
 * 双反斜杠 marked 之后会被转成一个，要在转之前增加一对
 * @param mdText
 */
export function adapterForMathJax(mdText: string) {
  return mdText.replaceAll('\\\\', '\\\\\\\\');
}

/**
 * 默认初始化完成的回调函数
 */
function defaultCallback() {
  (window as WindowType).MathJax.typesetPromise(document.getElementsByClassName(MARKED_CLASS_NAME));
}
/**
 * 初始化 MathJax
 * @param callback Mathjax加载完成后的回调
 */
export function initMathJax(callback?: Function) {
  injectMathJax();
  (window as WindowType).MathJax = {
    tex: {
      // 行内公式标志
      inlineMath: [['$', '$']],
      // 块级公式标志
      displayMath: [['$$', '$$']],
      // 下面两个主要是支持渲染某些公式
      processEnvironments: true,
      processRefs: true,
    },
    options: {
      // 跳过渲染的标签
      skipHtmlTags: ['noscript', 'style', 'textarea', 'pre', 'code'],
      ignoreHtmlClass: 'tex2jax_ignore',
    },
    startup: {
      // 当mathjax加载并初始化完成后的回调
      pageReady: () => {
        defaultCallback();
        callback && callback();
      },
    },
    svg: {
      fontCache: 'global',
    },
  };
}
