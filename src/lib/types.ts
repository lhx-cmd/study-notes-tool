export type NoteMode = 'structured' | 'free'

export interface Note {
  id: string
  createdAt: number
  updatedAt: number
  conclusion: string
  question: string
  freeContent: string
  mode: NoteMode
  categoryId: string | null
  tags: string[]
  source?: string
  aiSummary?: string
  aiKeywords?: string[]
  relatedNoteIds?: string[]
  aiCacheFingerprint?: string
}

export interface Category {
  id: string
  name: string
  parentId: string | null
  order: number
}

export interface ReviewCard {
  question: string
  answer: string
}

export interface AppSettings {
  glmApiKey: string
  glmModel: string
}

export interface NoteDraft {
  mode: NoteMode
  conclusion: string
  question: string
  freeContent: string
  categoryId: string | null
  tags: string[]
  source: string
}

export interface NoteFilters {
  search: string
  categoryId: string | null
  tags: string[]
}
