import type { ButtonHTMLAttributes } from 'react'
import type { IconName } from '../../assets/icons'
import { buttonClasses, type ButtonVariant } from './buttonStyles'
import { Icon } from './Icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName
  variant?: ButtonVariant
}

export function Button({
  icon,
  variant = 'secondary',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, className)} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}
