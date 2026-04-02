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
      <section className="surface space-y-3 p-4 md:p-6">
        <h2 className="section-title">AI 设置</h2>
        <label className="text-sm font-medium text-slate-700">GLM API Key</label>
        <input
          value={settings.glmApiKey}
          onChange={(event) => setSettings((previous) => ({ ...previous, glmApiKey: event.target.value }))}
          type="password"
          className="input-base"
          placeholder="填写你的智谱 API Key"
        />
        <label className="text-sm font-medium text-slate-700">模型名</label>
        <input
          value={settings.glmModel}
          onChange={(event) => setSettings((previous) => ({ ...previous, glmModel: event.target.value }))}
          className="input-base"
          placeholder="例如 glm-5"
        />
        <button className="btn-primary" onClick={persistSettings}>
          保存设置
        </button>
      </section>

      <section className="surface space-y-3 p-4 md:p-6">
        <h2 className="section-title">导出</h2>
        <p className="hint">当前按标签管理；导出会保留标签、来源和 AI 结果。</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={handleExportJson}>
            导出 JSON
          </button>
          <button className="btn-secondary" onClick={handleExportMarkdown}>
            导出 Markdown
          </button>
        </div>
      </section>

      {message ? <p className="status-ok xl:col-span-2">{message}</p> : null}
    </div>
  )
}
