import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './icons'

type BadgeProps = {
  icon?: IconName
  children: ReactNode
}

export function Badge({ icon, children }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.75 rounded-full border border-brand-soft bg-brand-soft px-3.5 py-2.25 text-label font-medium text-brand">
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  )
}
