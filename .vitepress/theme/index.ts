import { h } from "vue";
import { type Theme, inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";
import './styles.css'
import confetti from './components/confetti.vue';
import busuanzi from 'busuanzi.pure.js';
import VisitorPanel from './components/VisitorPanel.vue';
import Layout from './components/Layout.vue';

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    const { app, router } = ctx;
    app.component("confetti", confetti);
    app.component("VisitorPanel", VisitorPanel);

    if (inBrowser) {
      router.onAfterRouteChange = () => {
        busuanzi.fetch();
      };
    }
  },
  Layout: () => {
    return h(Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  }
} satisfies Theme;
