import { useMemo, useState } from 'react'
import type { Category, Note } from '../lib/types'
import { getSettings, saveSettings } from '../features/settings/storage'
import { exportJson, exportMarkdown, triggerDownload } from '../features/settings/export'
import { createCategory, deleteCategoryAndDetachNotes, moveCategory } from '../features/categories/service'

interface SettingsPageProps {
  notes: Note[]
  categories: Category[]
}

export function SettingsPage({ notes, categories }: SettingsPageProps) {
  const [settings, setSettings] = useState(() => getSettings())
  const [categoryName, setCategoryName] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [message, setMessage] = useState('')

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [categories],
  )

  function persistSettings() {
    saveSettings(settings)
    setMessage('设置已保存。')
  }

  function handleExportJson() {
    const content = exportJson(notes, categories)
    triggerDownload(`study-notes-${new Date().toISOString().slice(0, 10)}.json`, content, 'application/json')
  }

  function handleExportMarkdown() {
    const content = exportMarkdown(notes, categories)
    triggerDownload(`study-notes-${new Date().toISOString().slice(0, 10)}.md`, content, 'text/markdown')
  }

  async function handleAddCategory() {
    if (!categoryName.trim()) {
      setMessage('分类名称不能为空。')
      return
    }

    await createCategory(categoryName, parentId || null)
    setCategoryName('')
    setMessage('分类已创建。')
  }

  async function handleDeleteCategory(categoryId: string) {
    const confirmed = window.confirm('删除分类会把该分类下笔记转为未分类，是否继续？')
    if (!confirmed) {
      return
    }

    await deleteCategoryAndDetachNotes(categoryId)
    setMessage('分类已删除。')
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">AI 设置</h2>
        <label className="block text-sm font-medium text-slate-700">GLM API Key</label>
        <input
          value={settings.glmApiKey}
          onChange={(event) => setSettings((previous) => ({ ...previous, glmApiKey: event.target.value }))}
          type="password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="填写你的智谱 API Key"
        />
        <label className="block text-sm font-medium text-slate-700">模型名</label>
        <input
          value={settings.glmModel}
          onChange={(event) => setSettings((previous) => ({ ...previous, glmModel: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="例如 glm-5"
        />
        <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white" onClick={persistSettings}>
          保存设置
        </button>

        <div className="pt-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">导出</h3>
          <div className="mt-2 flex gap-2">
            <button className="rounded border border-slate-300 px-3 py-1 text-sm" onClick={handleExportJson}>
              导出 JSON
            </button>
            <button className="rounded border border-slate-300 px-3 py-1 text-sm" onClick={handleExportMarkdown}>
              导出 Markdown
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">分类管理</h2>
        <div className="grid gap-2 md:grid-cols-[1fr,180px,auto]">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="新分类名称"
          />
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">一级分类</option>
            {sortedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => void handleAddCategory()}>
            新建
          </button>
        </div>

        <div className="space-y-2">
          {sortedCategories.length === 0 ? <p className="text-sm text-slate-500">暂无分类。</p> : null}
          {sortedCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
              <span className="flex-1">{category.name}</span>
              <button className="rounded border border-slate-300 px-2 py-1" onClick={() => void moveCategory(category.id, 'up')}>
                上移
              </button>
              <button className="rounded border border-slate-300 px-2 py-1" onClick={() => void moveCategory(category.id, 'down')}>
                下移
              </button>
              <button className="rounded border border-rose-300 px-2 py-1 text-rose-700" onClick={() => void handleDeleteCategory(category.id)}>
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      {message ? <p className="xl:col-span-2 text-sm text-sky-700">{message}</p> : null}
    </div>
  )
}
