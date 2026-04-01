import type { Note, ReviewCard } from '../../lib/types'

interface AIResult {
  summary: string
  keywords: string[]
  relatedIds: string[]
}

interface GLMMessage {
  role: 'system' | 'user'
  content: string
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

function extractJson(content: string): string {
  const cleaned = content.trim()
  const fenced = cleaned.match(/```json([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return cleaned.slice(start, end + 1)
  }

  return cleaned
}

async function callGLM(messages: GLMMessage[], apiKey: string, model: string): Promise<string> {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`AI 请求失败 (${response.status}): ${body}`)
  }

  const json = (await response.json()) as ChatCompletionResponse
  return json.choices?.[0]?.message?.content ?? ''
}

export async function summarizeNote(note: Note, allNotes: Note[], apiKey: string, model: string): Promise<AIResult> {
  const candidateNotes = allNotes
    .filter((item) => item.id !== note.id)
    .slice(0, 80)
    .map((item) => ({
      id: item.id,
      text: [item.conclusion, item.question, item.freeContent, item.tags.join(' ')].join('\n').trim(),
    }))

  const input = {
    id: note.id,
    content: [
      note.mode === 'structured' ? `结论: ${note.conclusion}` : '',
      note.mode === 'structured' ? `疑问: ${note.question}` : '',
      note.mode === 'free' ? `正文: ${note.freeContent}` : '',
      note.source ? `来源: ${note.source}` : '',
      note.tags.length > 0 ? `标签: ${note.tags.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    candidates: candidateNotes,
  }

  const content = await callGLM(
    [
      {
        role: 'system',
        content:
          '你是学习笔记整理助手。请返回严格 JSON：{"summary":"三句话以内","keywords":["k1"],"relatedIds":["id1"]}。keywords 最多 5 个，relatedIds 3 到 5 个。',
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
    apiKey,
    model,
  )

  const parsed = JSON.parse(extractJson(content)) as Partial<AIResult>

  return {
    summary: (parsed.summary ?? '').trim(),
    keywords: (parsed.keywords ?? []).slice(0, 5),
    relatedIds: (parsed.relatedIds ?? []).slice(0, 5),
  }
}

const reviewCache = new Map<string, ReviewCard[]>()

export async function generateReviewCards(
  notes: Note[],
  apiKey: string,
  model: string,
  cacheKey: string,
): Promise<ReviewCard[]> {
  const cached = reviewCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const compactNotes = notes.slice(0, 40).map((note) => ({
    id: note.id,
    text: note.mode === 'structured' ? `${note.conclusion}\n${note.question}` : note.freeContent,
    tags: note.tags,
  }))

  const content = await callGLM(
    [
      {
        role: 'system',
        content:
          '你是复习卡片生成助手。请严格返回 JSON：{"cards":[{"question":"...","answer":"..."}]}。生成 6 到 12 张卡片，问题简短，答案不超过 80 字。',
      },
      {
        role: 'user',
        content: JSON.stringify({ notes: compactNotes }),
      },
    ],
    apiKey,
    model,
  )

  const parsed = JSON.parse(extractJson(content)) as { cards?: ReviewCard[] }
  const cards = (parsed.cards ?? []).filter((item) => item.question && item.answer)
  reviewCache.set(cacheKey, cards)
  return cards
}
