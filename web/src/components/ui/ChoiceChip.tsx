import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ChoiceChipProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type: 'radio' | 'checkbox'
  children: ReactNode
}

/** A radio or checkbox drawn as a pill; the native input keeps keyboard and form behavior. */
export function ChoiceChip({ children, className, ...input }: ChoiceChipProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-label transition-colors hover:bg-canvas has-checked:border-brand has-checked:bg-brand-soft has-checked:font-medium has-checked:text-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
        className
      )}
    >
      <input className="sr-only" {...input} />
      {children}
    </label>
  )
}
