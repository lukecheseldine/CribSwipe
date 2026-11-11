const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value: string) {
  return emailPattern.test(value.trim())
}

/** A mobile number: 10 to 15 digits, with optional spaces, dashes, or a leading +. */
export function isMobileNumber(value: string) {
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15 && /^[+\d\s().-]+$/.test(trimmed)
}
