import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Note } from '../lib/types'
import { noteToDraft } from '../lib/drafts'
import { NoteForm } from '../components/NoteForm'
import { deleteNote, saveAIResult, updateNote } from '../features/notes/service'
import { summarizeNote } from '../features/ai/glm'
import { getSettings } from '../features/settings/storage'

interface NoteDetailPageProps {
  notes: Note[]
  allTags: string[]
}

export function NoteDetailPage({ notes, allTags }: NoteDetailPageProps) {
  const params = useParams()
  const navigate = useNavigate()
  const note = notes.find((item) => item.id === params.noteId)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [draft, setDraft] = useState(note ? noteToDraft(note) : null)

  useEffect(() => {
    setDraft(note ? noteToDraft(note) : null)
  }, [note])

  if (!note || !draft) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        笔记不存在或已删除。
      </div>
    )
  }

  const currentNote = note

  const relatedNotes = useMemo(() => {
    if (!currentNote.relatedNoteIds || currentNote.relatedNoteIds.length === 0) {
      return []
    }

    const map = new Map(notes.map((item) => [item.id, item]))
    return currentNote.relatedNoteIds.map((id) => map.get(id)).filter(Boolean) as Note[]
  }, [currentNote.relatedNoteIds, notes])

  async function handleSave() {
    const currentDraft = draft
    if (!currentDraft) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const next = await updateNote(currentNote, currentDraft)
      setDraft(noteToDraft(next))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('确定删除这条笔记吗？')
    if (!confirmed) {
      return
    }

    await deleteNote(currentNote.id)
    navigate('/')
  }

  async function handleSummarize() {
    const settings = getSettings()
    if (!settings.glmApiKey.trim()) {
      setError('请先在设置页填写 GLM API Key。')
      return
    }

    setSummarizing(true)
    setError('')

    try {
      const result = await summarizeNote(currentNote, notes, settings.glmApiKey, settings.glmModel)
      await saveAIResult(currentNote.id, {
        aiSummary: result.summary,
        aiKeywords: result.keywords,
        relatedNoteIds: result.relatedIds,
      })
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : 'AI 提炼失败')
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">笔记详情</h2>
          <div className="flex gap-2">
            <button className="rounded border border-rose-300 px-3 py-1 text-sm text-rose-700" onClick={() => void handleDelete()}>
              删除
            </button>
            <Link to="/" className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700">
              返回列表
            </Link>
          </div>
        </div>

        <NoteForm draft={draft} allTags={allTags} onChange={setDraft} />

        <div className="mt-3 flex items-center gap-2">
          <button
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
          <span className="text-xs text-slate-500">上次更新: {new Date(currentNote.updatedAt).toLocaleString()}</span>
        </div>

        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </section>

      <aside className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">AI 提炼</h3>
          <button
            className="mt-2 w-full rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={() => void handleSummarize()}
            disabled={summarizing}
          >
            {summarizing ? '提炼中...' : currentNote.aiSummary ? '重新提炼' : 'AI 提炼'}
          </button>
          {currentNote.aiSummary ? (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900">摘要</p>
                <p>{currentNote.aiSummary}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">关键词</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(currentNote.aiKeywords ?? []).map((keyword) => (
                    <span key={keyword} className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">暂无 AI 结果。</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">关联笔记</h3>
          <div className="mt-2 space-y-2">
            {relatedNotes.length === 0 ? <p className="text-sm text-slate-500">暂无推荐。</p> : null}
            {relatedNotes.map((item) => (
              <Link key={item.id} to={`/note/${item.id}`} className="block rounded border border-slate-200 p-2 text-sm hover:bg-slate-50">
                {item.mode === 'structured' ? item.conclusion.slice(0, 40) : item.freeContent.slice(0, 40)}
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}
