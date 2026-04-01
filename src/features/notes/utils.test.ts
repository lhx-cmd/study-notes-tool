import { describe, expect, it } from 'vitest'
import type { NoteDraft } from '../../lib/types'
import { createNoteFromDraft, matchFilters, patchNoteWithDraft } from './utils'

const baseDraft: NoteDraft = {
  mode: 'structured',
  conclusion: 'RAG 的关键是检索质量',
  question: '如何降低幻觉?',
  freeContent: '',
  tags: ['RAG', 'LLM'],
  source: 'paper',
}

describe('notes utils', () => {
  it('creates a normalized note', () => {
    const note = createNoteFromDraft(baseDraft)
    expect(note.tags).toEqual(['rag', 'llm'])
    expect(note.mode).toBe('structured')
    expect(note.aiSummary).toBeUndefined()
  })

  it('invalidates ai cache when core content changes', () => {
    const note = createNoteFromDraft(baseDraft)
    const next = patchNoteWithDraft(note, {
      ...baseDraft,
      conclusion: 'RAG 的关键是召回 + 重排',
    })

    expect(next.aiSummary).toBeUndefined()
    expect(next.aiKeywords).toBeUndefined()
    expect(next.relatedNoteIds).toBeUndefined()
    expect(next.aiCacheFingerprint).not.toEqual(note.aiCacheFingerprint)
  })

  it('filters by search and tags', () => {
    const one = createNoteFromDraft(baseDraft)
    const two = createNoteFromDraft({
      ...baseDraft,
      conclusion: '图神经网络用于推荐系统',
      tags: ['gcn'],
    })

    const result = matchFilters([one, two], {
      search: '推荐',
      tags: ['gcn'],
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toEqual(two.id)
  })
})
