import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'section'
}

export function Card({ as: Element = 'div', className, ...props }: CardProps) {
  return (
    <Element
      className={cn('rounded-3xl border border-line bg-white shadow-card', className)}
      {...props}
    />
  )
}
