import type { Category } from '../../lib/types'

export interface CategoryNode extends Category {
  children: CategoryNode[]
}

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  categories.forEach((category) => {
    map.set(category.id, { ...category, children: [] })
  })

  const roots: CategoryNode[] = []

  map.forEach((node) => {
    if (!node.parentId) {
      roots.push(node)
      return
    }

    const parent = map.get(node.parentId)
    if (!parent) {
      roots.push(node)
      return
    }

    parent.children.push(node)
  })

  const sortRecursively = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    nodes.forEach((node) => sortRecursively(node.children))
  }

  sortRecursively(roots)
  return roots
}

export function collectCategoryIds(rootId: string, categories: Category[]): string[] {
  const childrenMap = new Map<string, string[]>()
  categories.forEach((category) => {
    if (!category.parentId) {
      return
    }
    const list = childrenMap.get(category.parentId) ?? []
    list.push(category.id)
    childrenMap.set(category.parentId, list)
  })

  const ids: string[] = []
  const stack = [rootId]

  while (stack.length > 0) {
    const id = stack.pop() as string
    ids.push(id)
    const children = childrenMap.get(id) ?? []
    stack.push(...children)
  }

  return ids
}
