import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function useAppData() {
  const notes = useLiveQuery(() => db.notes.toArray(), [], [])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    ;(notes ?? []).forEach((note) => {
      note.tags.forEach((tag) => set.add(tag))
    })

    return Array.from(set).sort()
  }, [notes])

  return {
    notes: notes ?? [],
    allTags,
    loading: !notes,
  }
}
