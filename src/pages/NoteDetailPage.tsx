import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Note } from '../lib/types'
import { noteToDraft } from '../lib/drafts'
import { NoteForm } from '../components/NoteForm'
import { deleteNote, saveAIResult, updateNote } from '../features/notes/service'
import { summarizeNote } from '../features/ai/glm'
import { getSettings } from '../features/settings/storage'
import { isHttpUrl, toNavigableUrl } from '../lib/url'

interface NoteDetailPageProps {
  notes: Note[]
  allTags: string[]
}

function SourceDetail({ source }: { source?: string }) {
  if (!source?.trim()) {
    return <span className="hint">无来源</span>
  }

  const trimmed = source.trim()
  if (!isHttpUrl(trimmed)) {
    return <span className="hint">{trimmed}</span>
  }

  return (
    <a
      href={toNavigableUrl(trimmed)}
      target="_blank"
      rel="noopener noreferrer"
      className="hint max-w-full truncate text-sky-700 underline-offset-2 hover:underline"
      title={trimmed}
    >
      {trimmed}
    </a>
  )
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
      <div className="state-empty">
        <p className="hint">笔记不存在或已删除。</p>
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
      <section className="surface p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="section-title">笔记详情</h2>
          <div className="flex gap-2">
            <button className="btn-secondary border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => void handleDelete()}>
              删除
            </button>
            <Link to="/" className="btn-secondary">
              返回列表
            </Link>
          </div>
        </div>

        <div className="surface-muted mb-4 px-3 py-2.5 text-sm">
          <span className="mr-2 font-medium text-slate-700">来源:</span>
          <SourceDetail source={currentNote.source} />
        </div>

        <NoteForm draft={draft} allTags={allTags} onChange={setDraft} />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn-primary" disabled={saving} onClick={() => void handleSave()}>
            {saving ? '保存中...' : '保存修改'}
          </button>
          <span className="hint-xs">上次更新: {new Date(currentNote.updatedAt).toLocaleString()}</span>
        </div>

        {error ? <p className="status-error mt-3">{error}</p> : null}
      </section>

      <aside className="space-y-4">
        <section className="surface p-4">
          <h3 className="section-label">AI 提炼</h3>
          <button className="btn-primary mt-2 w-full" onClick={() => void handleSummarize()} disabled={summarizing}>
            {summarizing ? '提炼中...' : currentNote.aiSummary ? '重新提炼' : 'AI 提炼'}
          </button>
          {currentNote.aiSummary ? (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">摘要</p>
                <p className="hint mt-1">{currentNote.aiSummary}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">关键词</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(currentNote.aiKeywords ?? []).map((keyword) => (
                    <span key={keyword} className="chip">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="hint mt-2">暂无 AI 结果。</p>
          )}
        </section>

        <section className="surface p-4">
          <h3 className="section-label">关联笔记</h3>
          <div className="mt-2 space-y-2">
            {relatedNotes.length === 0 ? <p className="hint">暂无推荐。</p> : null}
            {relatedNotes.map((item) => (
              <Link key={item.id} to={`/note/${item.id}`} className="surface-muted block p-2.5 text-sm hover:bg-slate-50">
                {item.mode === 'structured' ? item.conclusion.slice(0, 40) : item.freeContent.slice(0, 40)}
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}
