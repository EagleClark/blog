# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Personal tech blog built with VitePress. Content is in Chinese, authored by Eagle Clark. Deployed to GitHub Pages at `eagle90.com` from the `vitepress` branch.

## Commands

```bash
pnpm docs:dev      # Start dev server
pnpm docs:build    # Build for production (output: .vitepress/dist)
pnpm docs:preview  # Preview production build locally
```

Package manager is **pnpm** (v9.10.0). Do not use npm or yarn.

## Architecture

- **`.vitepress/config.mts`** — VitePress site config: nav, sidebar, search, head tags (Google AdSense), locales, Vite asset handling (`*.image`, `*.awebp`)
- **`.vitepress/theme/`** — Custom theme extending VitePress default:
  - `index.ts` — Registers global Vue components (`confetti`, `VisitorPanel`) and initializes busuanzi analytics on route change
  - `components/confetti.vue` — Confetti animation on page load via `canvas-confetti`
  - `components/VisitorPanel.vue` — Page view counter via `busuanzi.pure.js`
  - `styles.css` — Hero section gradient styling customizations
- **`article/`** — All blog content as Markdown, organized by category directories:
  - `front-end/`, `front-end-framework/`, `full-stack/`, `data-structures-and-algorithms/`, `design-patterns/`, `ai/`, `fe-resource/`, `other/`
- **`public/`** — Static assets (favicon, hero images, `ads.txt`)
- **`index.md`** — Home page with VitePress `home` layout and hero section

## CI/CD

`.github/workflows/deploy.yml` triggers on push to `vitepress` branch. Builds with pnpm + Node 20, deploys `.vitepress/dist` to GitHub Pages.

## Commit conventions

Branch is `vitepress` (no merge to main). Commit messages are in Chinese, prefixed with `feat:` or `update:`.
