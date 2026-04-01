import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Dexie, { type Table } from 'dexie'
import type { Note } from '../lib/types'

class TestDB extends Dexie {
  notes!: Table<Note, string>

  constructor() {
    super('test-db')
    this.version(1).stores({ notes: 'id, updatedAt, categoryId, *tags' })
  }
}

let db: TestDB

beforeEach(async () => {
  db = new TestDB()
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('dexie note ops', () => {
  it('stores and queries note records', async () => {
    const note: Note = {
      id: 'n1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      conclusion: 'test',
      question: 'q',
      freeContent: '',
      mode: 'structured',
      categoryId: null,
      tags: ['rag'],
      source: 'src',
    }

    await db.notes.add(note)
    const stored = await db.notes.get('n1')
    const byTag = await db.notes.where('tags').equals('rag').toArray()

    expect(stored?.id).toBe('n1')
    expect(byTag).toHaveLength(1)
  })
})
