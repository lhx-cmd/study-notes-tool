import Fuse from 'fuse.js'
import { v4 as uuidv4 } from 'uuid'
import type { Note, NoteDraft, NoteFilters } from '../../lib/types'

export function normalizeTags(input: string[]): string[] {
  return Array.from(
    new Set(
      input
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean)
        .map((tag) => tag.toLowerCase()),
    ),
  )
}

export function buildFingerprint(draft: Pick<NoteDraft, 'mode' | 'conclusion' | 'question' | 'freeContent' | 'source'>): string {
  return JSON.stringify({
    mode: draft.mode,
    conclusion: draft.conclusion.trim(),
    question: draft.question.trim(),
    freeContent: draft.freeContent.trim(),
    source: draft.source.trim(),
  })
}

export function createNoteFromDraft(draft: NoteDraft): Note {
  const now = Date.now()
  const normalized: NoteDraft = {
    ...draft,
    tags: normalizeTags(draft.tags),
  }

  return {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    mode: normalized.mode,
    conclusion: normalized.mode === 'structured' ? normalized.conclusion.trim() : '',
    question: normalized.mode === 'structured' ? normalized.question.trim() : '',
    freeContent: normalized.mode === 'free' ? normalized.freeContent.trim() : '',
    tags: normalized.tags,
    source: normalized.source.trim() || undefined,
    aiSummary: undefined,
    aiKeywords: undefined,
    relatedNoteIds: undefined,
    aiCacheFingerprint: buildFingerprint(normalized),
  }
}

export function patchNoteWithDraft(existing: Note, draft: NoteDraft): Note {
  const normalizedTags = normalizeTags(draft.tags)
  const next: Note = {
    ...existing,
    mode: draft.mode,
    conclusion: draft.mode === 'structured' ? draft.conclusion.trim() : '',
    question: draft.mode === 'structured' ? draft.question.trim() : '',
    freeContent: draft.mode === 'free' ? draft.freeContent.trim() : '',
    tags: normalizedTags,
    source: draft.source.trim() || undefined,
    updatedAt: Date.now(),
  }

  const previousFingerprint = existing.aiCacheFingerprint
  const currentFingerprint = buildFingerprint(draft)

  if (previousFingerprint !== currentFingerprint) {
    next.aiSummary = undefined
    next.aiKeywords = undefined
    next.relatedNoteIds = undefined
    next.aiCacheFingerprint = currentFingerprint
  }

  return next
}

export function matchFilters(notes: Note[], filters: NoteFilters): Note[] {
  let filtered = notes

  if (filters.tags.length > 0) {
    filtered = filtered.filter((note) =>
      filters.tags.every((tag) => note.tags.includes(tag.toLowerCase())),
    )
  }

  if (filters.search.trim()) {
    const fuse = new Fuse(filtered, {
      includeScore: true,
      keys: ['conclusion', 'question', 'freeContent', 'source', 'tags'],
      threshold: 0.4,
      ignoreLocation: true,
    })

    filtered = fuse.search(filters.search.trim()).map((result) => result.item)
  }

  return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
}

export function parseTagInput(input: string): string[] {
  return normalizeTags(
    input
      .split(/[\s,]+/)
      .map((piece) => piece.trim())
      .filter(Boolean),
  )
}

export function buildNotesHash(notes: Note[]): string {
  return notes
    .map((note) => `${note.id}:${note.updatedAt}:${note.aiCacheFingerprint ?? ''}`)
    .sort()
    .join('|')
}
