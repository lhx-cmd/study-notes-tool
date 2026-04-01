import Dexie, { type EntityTable } from 'dexie'
import type { Category, Note } from '../lib/types'

class StudyDB extends Dexie {
  notes!: EntityTable<Note, 'id'>
  categories!: EntityTable<Category, 'id'>

  constructor() {
    super('study-notes-db')
    this.version(1).stores({
      notes: 'id, createdAt, updatedAt, categoryId, *tags',
      categories: 'id, parentId, order',
    })
  }
}

export const db = new StudyDB()
