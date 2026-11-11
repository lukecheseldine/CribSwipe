import { useAccount } from '../features/account'
import type { User } from '../types/user'

export function useCurrentUser(): User | null {
  const { signedIn, userId, profile } = useAccount()
  if (!signedIn || !userId || !profile) return null
  return { id: userId, name: profile.name, photo: profile.photo }
}
