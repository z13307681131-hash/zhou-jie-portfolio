import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const root = import.meta.dirname;
const base = process.env.PAGES_BASE || '/zhou-jie-portfolio/';
export default defineConfig({
  root: path.join(root, 'github-pages'),
  base,
  publicDir: false,
  plugins: [
    {
      name: 'portfolio-pages-paths',
      enforce: 'pre',
      transform(source, id) {
        if (!id.startsWith(root) || id.includes('node_modules') || !/\.(tsx?|jsx?|json)$/.test(id)) return;
        return source.replace(/(["'`])\/(assets\/|work\/|rondel-assets\/|media\/|rondel(?=["'`])|admin(?=[/"'`])|favicon\.svg)/g, (_, quote, part) => `${quote}${base}${part}`)
          .replace(/href=(["'])\/(?=[#"'])/g, (_, quote) => `href=${quote}${base}`)
          .replaceAll(`${base}admin`, 'https://zhou-jie-design-portfolio.z13307681131.chatgpt.site/admin');
      },
    },
    react(),
  ],
  resolve: { alias: [
    { find: '@/lib/project-store', replacement: path.join(root, 'github-pages/project-store.ts') },
    { find: 'next/link', replacement: path.join(root, 'github-pages/link.tsx') },
    { find: '@', replacement: root },
  ] },
  css: { postcss: path.join(root, 'postcss.config.mjs') },
  build: { outDir: path.join(root, 'pages-dist'), emptyOutDir: true },
});
