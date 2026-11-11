import { useId, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { fieldClasses } from '../../../components/ui/fieldStyles'
import { Icon } from '../../../components/ui/Icon'
import { pluralize } from '../../../lib/format'
import type { FilterOption } from '../../../types/filters'
import { FilterField } from './FilterField'

type LocationFieldProps = {
  options: FilterOption[]
  selected: string[]
  onChange: (cities: string[]) => void
}

/** Search the areas found in the data; picked areas show as removable chips. */
export function LocationField({ options, selected, onChange }: LocationFieldProps) {
  const inputId = useId()
  const listId = useId()
  const [query, setQuery] = useState('')

  const find = (text: string) =>
    options.find((option) => option.value.toLowerCase() === text.trim().toLowerCase())

  const add = (city: string) => {
    if (!selected.includes(city)) onChange([...selected, city])
    setQuery('')
  }

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Picking a suggestion fires a plain Event; typing fires an InputEvent.
    const pickedSuggestion = !(event.nativeEvent instanceof InputEvent)
    const match = find(value)
    if (pickedSuggestion && match) add(match.value)
    else setQuery(value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const match = find(query)
    if (match) add(match.value)
  }

  return (
    <FilterField label="Location" htmlFor={inputId}>
      <div className="relative">
        <input
          id={inputId}
          list={listId}
          value={query}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder={selected.length > 0 ? 'Add another area' : 'Any area'}
          autoComplete="off"
          className={fieldClasses('pr-11 [&::-webkit-calendar-picker-indicator]:hidden')}
        />
        <Icon
          name="mapPin"
          size={18}
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
        />
        <datalist id={listId}>
          {options
            .filter((option) => !selected.includes(option.value))
            .map((option) => (
              <option
                key={option.value}
                value={option.value}
                label={pluralize(option.count, 'place')}
              />
            ))}
        </datalist>
      </div>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((city) => (
            <li
              key={city}
              className="flex items-center gap-1 rounded-full bg-brand-soft py-1.5 pr-2 pl-3.5 text-label font-medium text-brand"
            >
              {city}
              <button
                type="button"
                aria-label={`Remove ${city}`}
                onClick={() => onChange(selected.filter((c) => c !== city))}
                className="flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-white/60"
              >
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </FilterField>
  )
}
