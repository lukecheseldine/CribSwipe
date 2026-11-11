import { formatCurrency } from '../../../../lib/format'

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
    <div className="flex flex-col gap-3">
      <p className="text-sm">{label}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={STEP}
        value={current}
        aria-label="Maximum monthly rent"
        aria-valuetext={label}
        onChange={(event) => {
          const next = Number(event.target.value)
          onChange(next >= max ? null : next)
        }}
        className="w-full cursor-pointer accent-brand"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>{formatCurrency(min, 'CAD')}</span>
        <span>{formatCurrency(max, 'CAD')}</span>
      </div>
    </div>
  )
}
