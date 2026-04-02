import { useState, type KeyboardEvent } from 'react'
import type { NoteDraft } from '../lib/types'
import { emptyDraft } from '../lib/drafts'
import { NoteForm } from './NoteForm'

interface QuickCaptureProps {
  open: boolean
  allTags: string[]
  onClose: () => void
  onSubmit: (draft: NoteDraft) => Promise<void>
}

export function QuickCapture({ open, allTags, onClose, onSubmit }: QuickCaptureProps) {
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) {
    return null
  }

  async function handleSubmit() {
    const hasContent = draft.mode === 'structured' ? draft.conclusion.trim() : draft.freeContent.trim()
    if (!hasContent) {
      setError('请填写核心内容后再保存。')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSubmit(draft)
      setDraft(emptyDraft)
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      void handleSubmit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }

    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT') {
        event.preventDefault()
        void handleSubmit()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-3 py-8 md:py-12" onKeyDown={onKeyDown}>
      <div className="surface w-full max-w-4xl p-4 md:p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="section-title">快速录入</h2>
            <p className="hint-xs mt-1">Ctrl/Cmd + K 呼出，Ctrl/Cmd + Enter 保存</p>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            关闭
          </button>
        </div>

        <NoteForm draft={draft} allTags={allTags} onChange={setDraft} compact />

        {error ? <p className="status-error mt-3">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn-primary" disabled={saving} onClick={() => void handleSubmit()}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
