export type NoteMode = 'structured' | 'free'

export interface Note {
  id: string
  createdAt: number
  updatedAt: number
  conclusion: string
  question: string
  freeContent: string
  mode: NoteMode
  tags: string[]
  source?: string
  aiSummary?: string
  aiKeywords?: string[]
  relatedNoteIds?: string[]
  aiCacheFingerprint?: string
}

export interface ReviewCard {
  question: string
  answer: string
}

export interface ReviewCardsCache {
  id: string
  hash: string
  createdAt: number
  cards: ReviewCard[]
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
  tags: string[]
  source: string
}

export interface NoteFilters {
  search: string
  tags: string[]
}
