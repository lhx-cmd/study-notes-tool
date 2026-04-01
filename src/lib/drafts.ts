import type { Note, NoteDraft } from './types'

export const emptyDraft: NoteDraft = {
  mode: 'structured',
  conclusion: '',
  question: '',
  freeContent: '',
  tags: [],
  source: '',
}

export function noteToDraft(note: Note): NoteDraft {
  return {
    mode: note.mode,
    conclusion: note.conclusion,
    question: note.question,
    freeContent: note.freeContent,
    tags: note.tags,
    source: note.source ?? '',
  }
}
