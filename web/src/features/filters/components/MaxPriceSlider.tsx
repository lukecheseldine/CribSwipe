import { formatCurrency } from '../../../lib/format'
import { FilterSlider } from './FilterSlider'

const STEP = 50

type MaxPriceSliderProps = {
  value: number | null
  bounds: { min: number; max: number }
  onChange: (maxPrice: number | null) => void
}

/** Caps the monthly rent; dragging all the way right removes the cap. */
export function MaxPriceSlider({ value, bounds, onChange }: MaxPriceSliderProps) {
  const min = Math.floor(bounds.min / STEP) * STEP
  const max = Math.ceil(bounds.max / STEP) * STEP
  const current = value === null ? max : Math.min(Math.max(value, min), max)
  const label = current >= max ? 'Any price' : `Up to ${formatCurrency(current, 'CAD')} a month`

  return (
    <FilterSlider
      min={min}
      max={max}
      step={STEP}
      value={current}
      label={label}
      ariaLabel="Maximum monthly rent"
      fill="toThumb"
      minLabel={formatCurrency(min, 'CAD')}
      maxLabel={formatCurrency(max, 'CAD')}
      onChange={(next) => onChange(next >= max ? null : next)}
    />
  )
}
