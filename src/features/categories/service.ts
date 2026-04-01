import { v4 as uuidv4 } from 'uuid'
import { db } from '../../db/db'
import type { Category } from '../../lib/types'

export async function createCategory(name: string, parentId: string | null): Promise<void> {
  const siblings = await db.categories.where({ parentId }).toArray()
  const maxOrder = siblings.reduce((max, current) => Math.max(max, current.order), -1)

  await db.categories.add({
    id: uuidv4(),
    name: name.trim(),
    parentId,
    order: maxOrder + 1,
  })
}

export async function moveCategory(categoryId: string, direction: 'up' | 'down'): Promise<void> {
  const category = await db.categories.get(categoryId)
  if (!category) {
    return
  }

  const siblings = (await db.categories.where({ parentId: category.parentId }).toArray()).sort(
    (a, b) => a.order - b.order,
  )

  const index = siblings.findIndex((item) => item.id === categoryId)
  if (index < 0) {
    return
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return
  }

  const target = siblings[swapIndex]

  await db.transaction('rw', db.categories, async () => {
    await db.categories.update(category.id, { order: target.order })
    await db.categories.update(target.id, { order: category.order })
  })
}

export async function deleteCategoryAndDetachNotes(categoryId: string): Promise<void> {
  const categories = await db.categories.toArray()
  const byParent = new Map<string, string[]>()

  categories.forEach((category) => {
    if (!category.parentId) {
      return
    }
    const list = byParent.get(category.parentId) ?? []
    list.push(category.id)
    byParent.set(category.parentId, list)
  })

  const queue = [categoryId]
  const allIds: string[] = []

  while (queue.length > 0) {
    const current = queue.pop() as string
    allIds.push(current)
    queue.push(...(byParent.get(current) ?? []))
  }

  await db.transaction('rw', db.categories, db.notes, async () => {
    await db.categories.bulkDelete(allIds)
    const impacted = await db.notes.where('categoryId').anyOf(allIds).toArray()
    await Promise.all(impacted.map((note) => db.notes.update(note.id, { categoryId: null })))
  })
}

export function findCategoryPath(categoryId: string | null, categories: Category[]): string {
  if (!categoryId) {
    return '未分类'
  }

  const map = new Map(categories.map((item) => [item.id, item]))
  const path: string[] = []
  let currentId: string | null = categoryId

  while (currentId) {
    const category = map.get(currentId)
    if (!category) {
      break
    }
    path.push(category.name)
    currentId = category.parentId
  }

  return path.reverse().join(' > ') || '未分类'
}
