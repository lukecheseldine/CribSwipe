import { useSyncExternalStore } from 'react'
import { accountStore } from '../accountStore'

export function useAccount() {
  const record = useSyncExternalStore(accountStore.subscribe, accountStore.getSnapshot)
  const signedIn = useSyncExternalStore(accountStore.subscribe, accountStore.isSignedIn)
  return {
    signedIn,
    userId: record.id,
    profile: record.profile,
    defaultFilters: record.defaultFilters,
    saveProfile: accountStore.saveProfile,
    saveDefaultFilters: accountStore.saveDefaultFilters,
  }
}
