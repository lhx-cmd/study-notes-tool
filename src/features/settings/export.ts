import type { Category, Note } from '../../lib/types'
import { findCategoryPath } from '../categories/service'

function escapeMarkdown(value: string): string {
  return value.replace(/[\\`*_{}[\]()#+\-.!|]/g, '\\$&')
}

export function exportJson(notes: Note[], categories: Category[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      notes,
      categories,
    },
    null,
    2,
  )
}

export function exportMarkdown(notes: Note[], categories: Category[]): string {
  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)

  return sorted
    .map((note) => {
      const header = `# ${escapeMarkdown(
        note.mode === 'structured'
          ? note.conclusion.slice(0, 30) || '未命名笔记'
          : note.freeContent.slice(0, 30) || '未命名笔记',
      )}`
      const meta = [
        `- 创建时间: ${new Date(note.createdAt).toLocaleString()}`,
        `- 更新时间: ${new Date(note.updatedAt).toLocaleString()}`,
        `- 分类: ${findCategoryPath(note.categoryId, categories)}`,
        `- 标签: ${note.tags.length > 0 ? note.tags.map((tag: string) => `#${tag}`).join(' ') : '无'}`,
        `- 来源: ${note.source ?? '无'}`,
      ].join('\n')

      const body =
        note.mode === 'structured'
          ? `## 核心结论\n${note.conclusion || '(空)'}\n\n## 思考疑问\n${note.question || '(空)'}`
          : `## 正文\n${note.freeContent || '(空)'}`

      const ai = note.aiSummary
        ? `\n\n## AI 摘要\n${note.aiSummary}\n\n## AI 关键词\n${(note.aiKeywords ?? []).join(', ') || '(空)'}`
        : ''

      return `${header}\n\n${meta}\n\n${body}${ai}`
    })
    .join('\n\n---\n\n')
}

export function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
