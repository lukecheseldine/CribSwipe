import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'
import type { IconName } from './icons'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  label: string
}

export function IconButton({ icon, label, type = 'button', className, ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <Icon name={icon} />
    </button>
  )
}
