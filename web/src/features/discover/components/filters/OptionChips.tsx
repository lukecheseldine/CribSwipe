import { ChoiceChip } from '../../../../components/ui/ChoiceChip'
import type { FilterOption } from '../../../../types/filters'

type OptionChipsProps<T extends string | number> = {
  name: string
  options: FilterOption<T>[]
  selected: T[]
  onToggle: (value: T) => void
  formatLabel?: (value: T) => string
  /** Off for numeric choices, where "1" beside its count of 9 would read as "19". */
  showCounts?: boolean
}

/** A multi-choice group of the values found in the data, optionally with listing counts. */
export function OptionChips<T extends string | number>({
  name,
  options,
  selected,
  onToggle,
  formatLabel = String,
  showCounts = true,
}: OptionChipsProps<T>) {
  // A value can be selected (e.g. from a shared link) after it's gone from the data.
  const missing = selected
    .filter((value) => !options.some((option) => option.value === value))
    .map((value) => ({ value, count: 0 }))

  return (
    <div className="flex flex-wrap gap-2">
      {[...options, ...missing].map((option) => (
        <ChoiceChip
          key={option.value}
          type="checkbox"
          name={name}
          value={option.value}
          checked={selected.includes(option.value)}
          onChange={() => onToggle(option.value)}
          className={showCounts ? undefined : 'min-w-12 justify-center'}
        >
          {formatLabel(option.value)}
          {showCounts && <span className="text-muted">{option.count}</span>}
        </ChoiceChip>
      ))}
    </div>
  )
}
