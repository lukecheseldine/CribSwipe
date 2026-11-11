import { Badge } from '../../../components/ui/Badge'
import type { SortOrder } from '../types'
import { SortSelect } from './SortSelect'

type ShortlistToolbarProps = {
  count: number
  order: SortOrder
  onOrderChange: (order: SortOrder) => void
}

export function ShortlistToolbar({ count, order, onOrderChange }: ShortlistToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <Badge>All saved · {count}</Badge>
      <SortSelect value={order} onChange={onOrderChange} />
    </div>
  )
}
