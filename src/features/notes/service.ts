import { db } from '../../db/db'
import type { Note, NoteDraft } from '../../lib/types'
import { createNoteFromDraft, patchNoteWithDraft } from './utils'

export async function createNote(draft: NoteDraft): Promise<Note> {
  const note = createNoteFromDraft(draft)
  await db.notes.add(note)
  return note
}

export async function updateNote(note: Note, draft: NoteDraft): Promise<Note> {
  const next = patchNoteWithDraft(note, draft)
  await db.notes.put(next)
  return next
}

export async function deleteNote(noteId: string): Promise<void> {
  await db.notes.delete(noteId)
}

export async function saveAIResult(noteId: string, payload: Pick<Note, 'aiSummary' | 'aiKeywords' | 'relatedNoteIds'>): Promise<void> {
  await db.notes.update(noteId, {
    ...payload,
    updatedAt: Date.now(),
  })
}
