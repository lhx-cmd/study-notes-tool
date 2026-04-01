import Dexie, { type EntityTable } from 'dexie'
import type { Note, ReviewCardsCache } from '../lib/types'

class StudyDB extends Dexie {
  notes!: EntityTable<Note, 'id'>
  reviewCardsCache!: EntityTable<ReviewCardsCache, 'id'>

  constructor() {
    super('study-notes-db')

    this.version(1).stores({
      notes: 'id, createdAt, updatedAt, *tags',
    })

    this.version(2)
      .stores({
        notes: 'id, createdAt, updatedAt, *tags',
        reviewCardsCache: 'id, hash, createdAt',
      })
      .upgrade((tx) =>
        tx
          .table('notes')
          .toCollection()
          .modify((note) => {
            delete (note as { categoryId?: unknown }).categoryId
          }),
      )
  }
}

export const db = new StudyDB()
