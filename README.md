# 学习心得整理工具

基于 `React + TypeScript + Dexie + Fuse + CodeMirror + Tailwind` 的纯前端学习笔记工具。

## 功能覆盖

- 快速录入：`Ctrl/Cmd + K` 呼出输入面板
- 双编辑模式：结构化（结论/疑问）与自由 Markdown（CodeMirror）
- 分类与标签：分类树浏览、标签过滤、分类管理与排序
- 全文搜索：Fuse.js 模糊检索
- AI 增强：GLM 提炼摘要/关键词/关联推荐，复习卡片生成
- 本地持久化：IndexedDB（Dexie）
- 导出：JSON 与 Markdown

## 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问 Vite 提示的本地地址。

## 测试与构建

```bash
npm run test
npm run build
```

## AI 配置

1. 打开设置页。
2. 填写智谱 API Key。
3. 默认模型是 `glm-5`，如需可改为你账户可用的模型名。

> 说明：本项目无后端代理，API Key 仅保存在浏览器 `localStorage`。
