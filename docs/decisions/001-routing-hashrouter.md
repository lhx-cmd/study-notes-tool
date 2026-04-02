# 001 - 路由改为 HashRouter

- 日期: 2026-04-01
- 状态: 已采纳

## 背景
GitHub Pages 在 SPA 刷新子路径时无法自动回退到 `index.html`，导致 404。

## 决策
将路由从 `BrowserRouter` 改为 `HashRouter`。

## 影响
- 优点: 刷新、书签、直达页面稳定可用。
- 代价: URL 形态变为 `.../#/...`。

## 备注
不再依赖额外 `404.html` 回退脚本。
