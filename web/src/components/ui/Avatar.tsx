import { getInitials } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type AvatarProps = {
  name?: string
  src?: string | null
  size?: 'sm' | 'lg'
}

const sizes = {
  sm: 'size-9 text-label',
  lg: 'size-20 text-2xl',
}

export function Avatar({ name, src, size = 'sm' }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-medium text-brand',
        sizes[size]
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : name ? (
        getInitials(name)
      ) : (
        <Icon name="userRound" className="text-muted" size={size === 'lg' ? 32 : 20} />
      )}
    </span>
  )
}
