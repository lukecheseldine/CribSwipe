import { buttonClasses } from '../../../components/ui/buttonStyles'
import { Icon } from '../../../components/ui/Icon'
import { sortOptions } from '../sorting'
import type { SortOrder } from '../types'

type SortSelectProps = {
  value: SortOrder
  onChange: (order: SortOrder) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="relative flex">
      <span className="sr-only">Sort saved places</span>
      <Icon
        name="sortDescending"
        className="pointer-events-none absolute top-1/2 left-5.5 -translate-y-1/2"
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOrder)}
        className={buttonClasses('secondary', 'field-sizing-content appearance-none pl-13')}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
