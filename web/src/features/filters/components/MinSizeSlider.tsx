import { FilterSlider } from './FilterSlider'

const STEP = 50

type MinSizeSliderProps = {
  value: number | null
  bounds: { min: number; max: number }
  onChange: (minSqft: number | null) => void
}

const formatSqft = (sqft: number) => `${sqft.toLocaleString('en-CA')} sq ft`

/** Requires at least this much space; dragging all the way left removes the minimum. */
export function MinSizeSlider({ value, bounds, onChange }: MinSizeSliderProps) {
  const min = Math.floor(bounds.min / STEP) * STEP
  const max = Math.ceil(bounds.max / STEP) * STEP
  const current = value === null ? min : Math.min(Math.max(value, min), max)
  const label = current <= min ? 'Any size' : `At least ${formatSqft(current)}`

  return (
    <FilterSlider
      min={min}
      max={max}
      step={STEP}
      value={current}
      label={label}
      ariaLabel="Minimum size"
      fill="fromThumb"
      minLabel={formatSqft(min)}
      maxLabel={formatSqft(max)}
      onChange={(next) => onChange(next <= min ? null : next)}
    />
  )
}
