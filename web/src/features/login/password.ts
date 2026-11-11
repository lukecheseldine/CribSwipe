/** The rule shown under the sign-up password field. */
export function passwordError(password: string, { required }: { required: string }) {
  if (!password) return required
  if (password.length < 8 || !/\d/.test(password)) {
    return 'Use at least 8 characters, including a number.'
  }
  return null
}
