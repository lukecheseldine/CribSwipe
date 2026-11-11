import { cn } from '../../lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        checked ? 'bg-brand' : 'bg-line'
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}
