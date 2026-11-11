import type { InputHTMLAttributes, ReactNode } from 'react'
import { fieldClasses } from '../../../components/ui/fieldStyles'

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  trailing?: ReactNode
}

export function AuthField({ id, label, error, trailing, ...input }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={fieldClasses(trailing ? 'pr-12' : undefined)}
          {...input}
        />
        {trailing && (
          <span className="absolute top-1/2 right-4 flex -translate-y-1/2">{trailing}</span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-pass">
          {error}
        </p>
      )}
    </div>
  )
}
