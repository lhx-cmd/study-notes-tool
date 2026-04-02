import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import type { NoteDraft } from '../lib/types'
import { parseTagInput } from '../features/notes/utils'

interface NoteFormProps {
  draft: NoteDraft
  allTags: string[]
  onChange: (next: NoteDraft) => void
  compact?: boolean
}

export function NoteForm({ draft, allTags, onChange, compact = false }: NoteFormProps) {
  const tagInputValue = useMemo(() => draft.tags.map((tag) => `#${tag}`).join(' '), [draft.tags])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`chip ${draft.mode === 'structured' ? 'chip-active' : ''}`}
          onClick={() => onChange({ ...draft, mode: 'structured' })}
        >
          结构化模式
        </button>
        <button
          type="button"
          className={`chip ${draft.mode === 'free' ? 'chip-active' : ''}`}
          onClick={() => onChange({ ...draft, mode: 'free' })}
        >
          自由 Markdown
        </button>
      </div>

      {draft.mode === 'structured' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">核心结论/要点</label>
            <textarea
              rows={compact ? 4 : 7}
              className="input-base"
              value={draft.conclusion}
              onChange={(event) => onChange({ ...draft, conclusion: event.target.value })}
              placeholder="写下核心结论..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">自己的思考/疑问</label>
            <textarea
              rows={compact ? 4 : 7}
              className="input-base"
              value={draft.question}
              onChange={(event) => onChange({ ...draft, question: event.target.value })}
              placeholder="可以记录疑问或后续验证点..."
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">自由 Markdown 内容</label>
          <CodeMirror
            value={draft.freeContent}
            height={compact ? '250px' : '380px'}
            extensions={[markdown()]}
            onChange={(value) => onChange({ ...draft, freeContent: value })}
            className="overflow-hidden rounded-xl border border-slate-300"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">来源（可选）</label>
          <input
            value={draft.source}
            onChange={(event) => onChange({ ...draft, source: event.target.value })}
            className="input-base"
            placeholder="论文名 / 课程名 / URL"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">标签（唯一分类方式）</label>
          <input
            value={tagInputValue}
            list="tag-suggestions"
            onChange={(event) => onChange({ ...draft, tags: parseTagInput(event.target.value) })}
            className="input-base"
            placeholder="#rag #gcn，支持空格或逗号分隔"
          />
          <datalist id="tag-suggestions">
            {allTags.map((tag) => (
              <option key={tag} value={`#${tag}`} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  )
}
