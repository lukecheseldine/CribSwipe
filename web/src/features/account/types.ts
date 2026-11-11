export type Profile = {
  name: string
  email: string
  phone: string
  /** A data URL chosen on this device. Never a sample photo. */
  photo: string | null
}
