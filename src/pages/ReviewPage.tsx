import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Note, ReviewCard } from '../lib/types'
import { getSettings } from '../features/settings/storage'
import { generateReviewCards } from '../features/ai/glm'

interface ReviewPageProps {
  notes: Note[]
}

export function ReviewPage({ notes }: ReviewPageProps) {
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cacheKey = useMemo(() => notes.map((note) => note.id).sort().join('|'), [notes])

  async function handleGenerate() {
    const settings = getSettings()
    if (!settings.glmApiKey.trim()) {
      setError('请先在设置页填写 API Key。')
      return
    }

    setLoading(true)
    setError('')

    try {
      const generated = await generateReviewCards(notes, settings.glmApiKey, settings.glmModel, cacheKey)
      setCards(generated)
      setIndex(0)
      setShowAnswer(false)
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }

  const current = cards[index]

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">复习模式</h2>
          <Link to="/" className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700">
            返回
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-600">基于当前所有笔记生成问答卡片，支持逐张翻阅。</p>
        <button
          className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={() => void handleGenerate()}
          disabled={loading || notes.length === 0}
        >
          {loading ? '生成中...' : '生成复习卡'}
        </button>
        {notes.length === 0 ? <p className="mt-2 text-sm text-slate-500">暂无笔记可生成卡片。</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </div>

      {current ? (
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow">
          <div className="mb-4 text-xs text-slate-500">
            第 {index + 1} / {cards.length} 张
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{current.question}</h3>
          {showAnswer ? <p className="mt-3 rounded bg-slate-100 p-3 text-sm text-slate-700">{current.answer}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={() => setShowAnswer((prev) => !prev)}>
              {showAnswer ? '隐藏答案' : '显示答案'}
            </button>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              disabled={index === 0}
              onClick={() => {
                setIndex((prev) => Math.max(prev - 1, 0))
                setShowAnswer(false)
              }}
            >
              上一张
            </button>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              disabled={index >= cards.length - 1}
              onClick={() => {
                setIndex((prev) => Math.min(prev + 1, cards.length - 1))
                setShowAnswer(false)
              }}
            >
              下一张
            </button>
          </div>
        </article>
      ) : null}
    </section>
  )
}
