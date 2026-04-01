import type { Note, NoteFilters } from '../../lib/types'
import { matchFilters } from '../notes/utils'

export function filterNotes(notes: Note[], filters: NoteFilters): Note[] {
  return matchFilters(notes, filters)
}
