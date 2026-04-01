import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import type { Category, NoteDraft } from '../lib/types'
import { parseTagInput } from '../features/notes/utils'

interface NoteFormProps {
  draft: NoteDraft
  categories: Category[]
  allTags: string[]
  onChange: (next: NoteDraft) => void
  compact?: boolean
}

export function NoteForm({ draft, categories, allTags, onChange, compact = false }: NoteFormProps) {
  const tagInputValue = useMemo(() => draft.tags.map((tag) => `#${tag}`).join(' '), [draft.tags])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`rounded-full border px-3 py-1 text-sm ${draft.mode === 'structured' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
          onClick={() =>
            onChange({
              ...draft,
              mode: 'structured',
            })
          }
        >
          结构化模式
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 text-sm ${draft.mode === 'free' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
          onClick={() =>
            onChange({
              ...draft,
              mode: 'free',
            })
          }
        >
          自由 Markdown
        </button>
      </div>

      {draft.mode === 'structured' ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">核心结论/要点</label>
            <textarea
              rows={compact ? 3 : 5}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-sky-300 transition focus:ring"
              value={draft.conclusion}
              onChange={(event) => onChange({ ...draft, conclusion: event.target.value })}
              placeholder="写下核心结论..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">自己的思考/疑问</label>
            <textarea
              rows={compact ? 2 : 4}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-sky-300 transition focus:ring"
              value={draft.question}
              onChange={(event) => onChange({ ...draft, question: event.target.value })}
              placeholder="可以记录疑问或后续验证点..."
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">自由 Markdown 内容</label>
          <CodeMirror
            value={draft.freeContent}
            height={compact ? '220px' : '360px'}
            extensions={[markdown()]}
            onChange={(value) => onChange({ ...draft, freeContent: value })}
            className="overflow-hidden rounded-lg border border-slate-300"
          />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">来源（可选）</label>
          <input
            value={draft.source}
            onChange={(event) => onChange({ ...draft, source: event.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="论文名 / 课程名 / URL"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">分类（可选）</label>
          <select
            value={draft.categoryId ?? ''}
            onChange={(event) => onChange({ ...draft, categoryId: event.target.value || null })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 transition focus:ring"
          >
            <option value="">未分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">标签</label>
        <input
          value={tagInputValue}
          list="tag-suggestions"
          onChange={(event) => onChange({ ...draft, tags: parseTagInput(event.target.value) })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-300 transition focus:ring"
          placeholder="#rag #gcn，支持空格或逗号分隔"
        />
        <datalist id="tag-suggestions">
          {allTags.map((tag) => (
            <option key={tag} value={`#${tag}`} />
          ))}
        </datalist>
      </div>
    </div>
  )
}
