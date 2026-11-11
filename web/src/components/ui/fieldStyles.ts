import { cn } from '../../lib/cn'

/** Text inputs, selects, and date pickers share one look. */
export function fieldClasses(className?: string) {
  return cn(
    'h-13 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none',
    className
  )
}
