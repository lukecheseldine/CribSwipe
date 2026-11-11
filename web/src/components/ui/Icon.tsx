import { icons, type IconName } from '../../assets/icons'
import { cn } from '../../lib/cn'

type IconProps = {
  name: IconName
  className?: string
}

export function Icon({ name, className }: IconProps) {
  const { src, size } = icons[name]
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      className={cn('shrink-0', className)}
    />
  )
}
