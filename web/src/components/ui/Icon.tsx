import { cn } from '../../lib/cn'
import { icons, type IconName } from './icons'

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

// Icons take their color from the surrounding text color.
export function Icon({ name, size = 20, className }: IconProps) {
  const Component = icons[name]
  return (
    <Component
      aria-hidden
      size={size}
      strokeWidth={1.8}
      absoluteStrokeWidth
      className={cn('shrink-0', className)}
    />
  )
}
