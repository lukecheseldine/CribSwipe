import type { ReactNode } from 'react'

type FilterFieldProps = {
  label: string
  htmlFor: string
  children: ReactNode
}

/** A single labelled input (text, select, date). */
export function FilterField({ label, htmlFor, children }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-label">
        {label}
      </label>
      {children}
    </div>
  )
}
