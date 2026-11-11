import { ChoiceChip } from '../../../components/ui/ChoiceChip'
import type { FilterOption } from '../../../types/filters'

type OptionChipsProps<T extends string | number> = {
  name: string
  options: FilterOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  formatLabel?: (value: T) => string
  /** Off for numeric choices, where "1" beside its count of 9 would read as "19". */
  showCounts?: boolean
}

/** Multi-select chips, led by an "Any" chip that clears them. */
export function OptionChips<T extends string | number>({
  name,
  options,
  selected,
  onChange,
  formatLabel = String,
  showCounts = true,
}: OptionChipsProps<T>) {
  // A value can be selected (e.g. from a shared link) after it's gone from the data.
  const missing = selected
    .filter((value) => !options.some((option) => option.value === value))
    .map((value) => ({ value, count: 0 }))
  const chipClass = showCounts ? undefined : 'min-w-12 justify-center'

  const toggle = (value: T) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  return (
    <div className="flex flex-wrap gap-2">
      <ChoiceChip
        type="checkbox"
        checked={selected.length === 0}
        onChange={() => onChange([])}
        className={chipClass}
      >
        Any
      </ChoiceChip>
      {[...options, ...missing].map((option) => (
        <ChoiceChip
          key={option.value}
          type="checkbox"
          name={name}
          value={option.value}
          checked={selected.includes(option.value)}
          onChange={() => toggle(option.value)}
          className={chipClass}
        >
          {formatLabel(option.value)}
          {showCounts && <span className="text-muted">{option.count}</span>}
        </ChoiceChip>
      ))}
    </div>
  )
}
