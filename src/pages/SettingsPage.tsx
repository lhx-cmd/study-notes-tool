import { useState } from 'react'
import type { Note } from '../lib/types'
import { getSettings, saveSettings } from '../features/settings/storage'
import { exportJson, exportMarkdown, triggerDownload } from '../features/settings/export'

interface SettingsPageProps {
  notes: Note[]
}

export function SettingsPage({ notes }: SettingsPageProps) {
  const [settings, setSettings] = useState(() => getSettings())
  const [message, setMessage] = useState('')

  function persistSettings() {
    saveSettings(settings)
    setMessage('设置已保存。')
  }

  function handleExportJson() {
    const content = exportJson(notes)
    triggerDownload(`study-notes-${new Date().toISOString().slice(0, 10)}.json`, content, 'application/json')
  }

  function handleExportMarkdown() {
    const content = exportMarkdown(notes)
    triggerDownload(`study-notes-${new Date().toISOString().slice(0, 10)}.md`, content, 'text/markdown')
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
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">导出</h2>
        <p className="text-sm text-slate-600">分类功能已移除，当前仅按标签管理；导出会保留标签、来源和 AI 结果。</p>
        <div className="mt-2 flex gap-2">
          <button className="rounded border border-slate-300 px-3 py-1 text-sm" onClick={handleExportJson}>
            导出 JSON
          </button>
          <button className="rounded border border-slate-300 px-3 py-1 text-sm" onClick={handleExportMarkdown}>
            导出 Markdown
          </button>
        </div>
      </section>

      {message ? <p className="xl:col-span-2 text-sm text-sky-700">{message}</p> : null}
    </div>
  )
}
