import type { AnchorHTMLAttributes } from 'react'
import type { IconName } from '../../assets/icons'
import { buttonClasses, type ButtonVariant } from './buttonStyles'
import { Icon } from './Icon'

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  icon?: IconName
  variant?: ButtonVariant
  external?: boolean
}

export function ButtonLink({
  icon,
  variant = 'secondary',
  external = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={buttonClasses(variant, className)}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
    </a>
  )
}
