import type { Category } from '../lib/types'
import { buildCategoryTree, type CategoryNode } from '../features/categories/utils'

interface CategoryTreeProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelect: (id: string | null) => void
}

function NodeView({
  node,
  selectedCategoryId,
  onSelect,
}: {
  node: CategoryNode
  selectedCategoryId: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <li className="space-y-1">
      <button
        className={`w-full rounded px-2 py-1 text-left text-sm transition ${selectedCategoryId === node.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
        onClick={() => onSelect(node.id)}
      >
        {node.name}
      </button>
      {node.children.length > 0 ? (
        <ul className="ml-3 space-y-1 border-l border-slate-200 pl-2">
          {node.children.map((child) => (
            <NodeView key={child.id} node={child} selectedCategoryId={selectedCategoryId} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CategoryTree({ categories, selectedCategoryId, onSelect }: CategoryTreeProps) {
  const tree = buildCategoryTree(categories)

  return (
    <div className="space-y-2">
      <button
        className={`w-full rounded px-2 py-1 text-left text-sm transition ${selectedCategoryId === null ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
        onClick={() => onSelect(null)}
      >
        全部分类
      </button>
      <ul className="space-y-1">
        {tree.map((node) => (
          <NodeView key={node.id} node={node} selectedCategoryId={selectedCategoryId} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  )
}
