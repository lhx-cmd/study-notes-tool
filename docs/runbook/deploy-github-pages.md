# GitHub Pages 发布手册

## 一次性准备
1. 配置远程仓库 `origin`
2. 确认 `vite.config.ts` 的 `base` 与仓库名一致
3. 安装依赖后执行 `npm run build`

## 常规发布
```bash
git add .
git commit -m "your message"
git push
npm run deploy
```

## 验证地址
- 主页: `https://<用户名>.github.io/<仓库名>/#/`
- 复习页: `https://<用户名>.github.io/<仓库名>/#/review`
- 设置页: `https://<用户名>.github.io/<仓库名>/#/settings`

## 常见问题
- 404: 检查是否使用 `#/` 地址，及 Pages 分支是否为 `gh-pages`
- 页面未更新: 等待 1-3 分钟并强刷
- 资源路径错: 检查 `base` 是否与仓库名匹配
