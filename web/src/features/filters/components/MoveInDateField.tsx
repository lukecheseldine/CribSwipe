import { useId } from 'react'
import { fieldClasses } from '../../../components/ui/fieldStyles'
import { FilterField } from './FilterField'

type MoveInDateFieldProps = {
  value: string | null
  onChange: (date: string | null) => void
}

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

export function MoveInDateField({ value, onChange }: MoveInDateFieldProps) {
  const id = useId()

  return (
    <FilterField label="Move-in date" htmlFor={id}>
      <input
        id={id}
        type="date"
        min={today()}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className={fieldClasses('cursor-pointer')}
      />
    </FilterField>
  )
}
