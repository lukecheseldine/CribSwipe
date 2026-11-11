import type { AnchorHTMLAttributes } from 'react'
import type { IconName } from '../../assets/icons'
import { buttonClasses, type ButtonVariant } from './buttonStyles'
import { Icon } from './Icon'

type ExternalButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  icon?: IconName
  variant?: ButtonVariant
}

export function ExternalButtonLink({
  icon,
  variant = 'secondary',
  className,
  children,
  ...props
}: ExternalButtonLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses(variant, className)}
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
    </a>
  )
}
