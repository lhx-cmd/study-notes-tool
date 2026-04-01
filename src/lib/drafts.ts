import type { Note, NoteDraft } from './types'

export const emptyDraft: NoteDraft = {
  mode: 'structured',
  conclusion: '',
  question: '',
  freeContent: '',
  categoryId: null,
  tags: [],
  source: '',
}

export function noteToDraft(note: Note): NoteDraft {
  return {
    mode: note.mode,
    conclusion: note.conclusion,
    question: note.question,
    freeContent: note.freeContent,
    categoryId: note.categoryId,
    tags: note.tags,
    source: note.source ?? '',
  }
}
