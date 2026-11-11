import { getInitials } from '../../lib/format'
import { Icon } from './Icon'

type AvatarProps = {
  name?: string
}

export function Avatar({ name }: AvatarProps) {
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-label text-brand"
    >
      {name ? getInitials(name) : <Icon name="userRound" className="text-muted" />}
    </span>
  )
}
