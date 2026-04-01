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
    return <span>无来源</span>
  }

  const trimmed = source.trim()
  if (!isHttpUrl(trimmed)) {
    return <span className="truncate">{trimmed}</span>
  }

  return (
    <a
      href={toNavigableUrl(trimmed)}
      target="_blank"
      rel="noopener noreferrer"
      className="max-w-[240px] truncate text-sky-700 underline-offset-2 hover:underline"
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
    <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
      <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">标签过滤</h2>
          <p className="mt-1 text-xs text-slate-500">已移除分类功能，统一用标签管理内容。</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chips.length === 0 ? <span className="text-sm text-slate-400">暂无标签</span> : null}
            {chips.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  className={`rounded-full border px-2 py-1 text-xs ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
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

        <Link to="/review" className="block rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
          进入复习模式
        </Link>
      </aside>

      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="全局全文搜索（支持模糊匹配）"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 transition focus:ring"
          />
          <p className="mt-2 text-xs text-slate-500">
            当前结果: {filteredNotes.length} 条 · 标签 {selectedTags.length} 个
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-base font-semibold text-slate-900">还没有学习笔记</h3>
            <p className="mt-2 text-sm text-slate-600">点击右上角“快速录入”或按 Ctrl/Cmd + K 先创建第一条。</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {filteredNotes.length === 0 && notes.length > 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              没有匹配笔记，尝试清空筛选或调整关键词。
            </div>
          ) : null}
          {filteredNotes.map((note) => (
            <article key={note.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow">
              <div className="mb-2 flex items-center justify-between gap-4 text-xs text-slate-500">
                <SourceView source={note.source} />
                <span>{new Date(note.updatedAt).toLocaleString()}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {note.mode === 'structured'
                  ? note.conclusion.slice(0, 80) || '未命名结构化笔记'
                  : note.freeContent.slice(0, 80) || '未命名自由笔记'}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {note.mode === 'structured' ? note.question : note.freeContent.slice(0, 160)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <Link
                  to={`/note/${note.id}`}
                  className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white"
                >
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
