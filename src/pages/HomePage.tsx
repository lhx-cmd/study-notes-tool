import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Note } from '../lib/types'
import { filterNotes } from '../features/search/service'
import { isHttpUrl, toNavigableUrl } from '../lib/url'

interface HomePageProps {
  notes: Note[]
  allTags: string[]
}

function SourceView({ source }: { source?: string }) {
  if (!source?.trim()) {
    return <span className="hint-xs">无来源</span>
  }

  const trimmed = source.trim()
  if (!isHttpUrl(trimmed)) {
    return <span className="hint-xs max-w-[260px] truncate">{trimmed}</span>
  }

  return (
    <a
      href={toNavigableUrl(trimmed)}
      target="_blank"
      rel="noopener noreferrer"
      className="hint-xs max-w-[260px] truncate text-sky-700 underline-offset-2 hover:underline"
      title={trimmed}
    >
      {trimmed}
    </a>
  )
}

export function HomePage({ notes, allTags }: HomePageProps) {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredNotes = useMemo(
    () => filterNotes(notes, { search, tags: selectedTags }),
    [notes, search, selectedTags],
  )

  const chips = allTags.slice(0, 40)

  return (
    <div className="grid gap-4 lg:grid-cols-[290px,1fr]">
      <aside className="surface space-y-4 p-4 md:p-5">
        <div>
          <h2 className="section-label">标签筛选</h2>
          <p className="hint mt-1">单击标签可组合过滤。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.length === 0 ? <span className="hint-xs">暂无标签</span> : null}
            {chips.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  className={`chip ${active ? 'chip-active' : ''}`}
                  onClick={() =>
                    setSelectedTags((previous) =>
                      previous.includes(tag)
                        ? previous.filter((item) => item !== tag)
                        : [...previous, tag],
                    )
                  }
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        </div>

        <Link to="/review" className="btn-secondary w-full justify-center">
          进入复习模式
        </Link>
      </aside>

      <section className="space-y-4">
        <div className="surface p-4 md:p-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="全局全文搜索（支持模糊匹配）"
            className="input-base"
          />
          <p className="hint-xs mt-2">
            当前结果: {filteredNotes.length} 条 · 标签筛选: {selectedTags.length} 个
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="state-empty">
            <h3 className="section-title">还没有学习笔记</h3>
            <p className="hint mt-2">点击右上角“快速录入”或按 Ctrl/Cmd + K 先创建第一条。</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {filteredNotes.length === 0 && notes.length > 0 ? (
            <div className="state-empty">
              <p className="hint">没有匹配笔记，尝试清空筛选或调整关键词。</p>
            </div>
          ) : null}
          {filteredNotes.map((note) => (
            <article key={note.id} className="list-item">
              <div className="mb-2 flex items-center justify-between gap-4">
                <SourceView source={note.source} />
                <span className="hint-xs">{new Date(note.updatedAt).toLocaleString()}</span>
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">
                {note.mode === 'structured'
                  ? note.conclusion.slice(0, 80) || '未命名结构化笔记'
                  : note.freeContent.slice(0, 80) || '未命名自由笔记'}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm hint">
                {note.mode === 'structured' ? note.question : note.freeContent.slice(0, 160)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="chip">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Link to={`/note/${note.id}`} className="btn-primary">
                  查看详情
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
