import { Link, type LinkProps } from 'react-router'
import { buttonClasses, type ButtonVariant } from './buttonStyles'
import { Icon } from './Icon'
import type { IconName } from './icons'

type ButtonLinkProps = LinkProps & {
  icon?: IconName
  variant?: ButtonVariant
}

export function ButtonLink({
  icon,
  variant = 'secondary',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, className)} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  )
}
