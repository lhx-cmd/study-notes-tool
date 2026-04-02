# 架构总览

## 技术栈
- 前端: React + TypeScript + Vite
- 样式: Tailwind CSS
- 本地存储: Dexie (IndexedDB)
- 搜索: Fuse.js
- 编辑器: CodeMirror (Markdown)
- AI: 智谱 GLM API (前端直连)

## 运行与部署
- 路由: `HashRouter`（适配 GitHub Pages，避免刷新 404）
- 部署: GitHub Pages（`gh-pages -d dist`）
- 无后端服务，纯静态站点

## 领域模型
- `Note`
  - 核心字段: `mode`, `conclusion`, `question`, `freeContent`, `tags`, `source`
  - AI 字段: `aiSummary`, `aiKeywords`, `relatedNoteIds`, `aiCacheFingerprint`
- `ReviewCardsCache`
  - 字段: `id`, `hash`, `createdAt`, `cards`

## 数据层
- DB 名称: `study-notes-db`
- 表:
  - `notes`: 笔记数据
  - `reviewCardsCache`: 复习卡缓存
- 版本迁移:
  - v2 中清理历史 `categoryId`，并新增 `reviewCardsCache`

## 页面结构
- `/`: 首页（搜索 + 标签筛选 + 笔记列表）
- `/note/:noteId`: 详情页（编辑 + AI 提炼 + 关联推荐）
- `/review`: 复习页（读取/生成复习卡）
- `/settings`: 设置页（API Key/模型 + 导出）

## 关键行为
- 标签是唯一组织维度（分类功能已移除）
- 复习卡按笔记内容哈希缓存到 IndexedDB，内容变化自动失效
- 来源 `source` 若为 `http/https`，展示为可点击链接并新标签页打开
