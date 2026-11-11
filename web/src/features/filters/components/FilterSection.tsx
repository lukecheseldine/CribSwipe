import type { ReactNode } from 'react'

type FilterSectionProps = {
  title: string
  children: ReactNode
}

/** A titled group of related controls (chips, a slider, ...). */
export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-medium">{title}</legend>
      {children}
    </fieldset>
  )
}
