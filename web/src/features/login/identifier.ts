import type { IconName } from '../../components/ui/icons'
import { isEmail, isMobileNumber } from '../../lib/identifier'

export { isEmail, isMobileNumber }

export function isAccountIdentifier(value: string) {
  const trimmed = value.trim()
  return isEmail(trimmed) || isMobileNumber(trimmed)
}

/** Phone icon once the field is clearly a number; mail icon otherwise. */
export function identifierIcon(value: string): IconName {
  const trimmed = value.trim()
  if (!trimmed || trimmed.includes('@')) return 'mail'
  return /\d/.test(trimmed) ? 'smartphone' : 'mail'
}
