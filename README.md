# 周杰 · 个人设计作品集

品牌策略、视觉设计、AI 设计、平面设计与数字体验作品集。包含响应式首页、精选作品卡片、作品详情、PDF 和 Rondel 唱片互动体验。

## GitHub Pages 发布

仓库已包含完整构建结果 `docs/`，无需安装依赖即可发布。

1. 打开仓库 **Settings → Pages**。
2. Source 选择 **Deploy from a branch**。
3. Branch 选择 **main**，目录选择 **/docs**，点击 **Save**。
4. 等待 GitHub 的 Pages 部署成功，以设置页的 **Visit site** 为准。

## 本地构建展示版

需要 Node.js 24。

```sh
npm ci --ignore-scripts
node scripts/prepare-pages.mjs
npx vite build --config vite.pages.config.ts
node scripts/finish-pages.mjs
```

构建输出为 `pages-dist/`，替换 `docs/` 后提交即可更新 Pages。默认网址子路径是 `/zhou-jie-portfolio/`，可通过 `PAGES_BASE` 同时配置 Vite 和收尾脚本。

## 内容与后台

- `github-pages/content/projects.json`：2026-10-26 从现有线上网站导出的 10 个公开作品。
- `github-pages/content/rondel.json`：同次导出的唱片体验内容。
- `public/`：图片、PDF、字体、脚本和本地音乐；发布不依赖原站的图片服务。
- `app/`、`lib/`、`worker/`：保留的完整服务端源代码。
- Pages 是静态展示版；管理员入口仍指向原网站，服务端身份验证、数据库和上传功能不在 GitHub Pages 上运行。
- 后台修改不会自动同步到 Pages；需要重新导出公开内容并构建提交。
- 仓库不包含管理员密码、会话数据库、环境密钥或平台访问令牌。

公开仓库与 Pages 部署成功均不代表中国境内所有网络都可访问，需分别验证。

作品、音频与第三方资源保留各自权利；本仓库未额外授予其再分发许可。第三方代码保留原有许可标注。
