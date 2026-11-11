import { useAccount } from '../features/account'
import type { User } from '../types/user'

export function useCurrentUser(): User | null {
  const { profile } = useAccount()
  if (!profile) return null
  return { id: 'local', name: profile.name, photo: profile.photo }
}
