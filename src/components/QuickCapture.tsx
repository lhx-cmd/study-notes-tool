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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-3 py-8" onKeyDown={onKeyDown}>
      <div className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">快速录入（Ctrl/Cmd + K）</h2>
          <button className="rounded border border-slate-300 px-2 py-1 text-sm" onClick={onClose}>
            关闭
          </button>
        </div>
        <NoteForm draft={draft} allTags={allTags} onChange={setDraft} compact />
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={onClose}>
            取消
          </button>
          <button
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={saving}
            onClick={() => void handleSubmit()}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
