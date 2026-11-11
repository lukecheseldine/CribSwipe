import { cn } from '../../../lib/cn'

type FilterSliderProps = {
  min: number
  max: number
  step: number
  value: number
  label: string
  ariaLabel: string
  /** Brand color runs from the left up to the thumb, or from the thumb to the right. */
  fill: 'toThumb' | 'fromThumb'
  minLabel: string
  maxLabel: string
  onChange: (value: number) => void
}

export function FilterSlider({
  min,
  max,
  step,
  value,
  label,
  ariaLabel,
  fill,
  minLabel,
  maxLabel,
  onChange,
}: FilterSliderProps) {
  const at = max === min ? 100 : ((value - min) / (max - min)) * 100
  const brandUntil = fill === 'toThumb' ? at : 0
  const brandFrom = fill === 'fromThumb' ? at : 0
  const background =
    fill === 'toThumb'
      ? `linear-gradient(to right, var(--color-brand) ${brandUntil}%, var(--color-line) ${brandUntil}%)`
      : `linear-gradient(to right, var(--color-line) ${brandFrom}%, var(--color-brand) ${brandFrom}%)`

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">{label}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        aria-valuetext={label}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ background }}
        className={cn(
          'h-1 w-full cursor-pointer appearance-none rounded-full',
          '[&::-webkit-slider-thumb]:size-4.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
          '[&::-moz-range-thumb]:size-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm'
        )}
      />
      <div className="flex justify-between text-xs text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
