import { useSyncExternalStore } from 'react'
import { accountStore } from '../accountStore'

export function useAccount() {
  const record = useSyncExternalStore(accountStore.subscribe, accountStore.getSnapshot)
  return {
    profile: record.profile,
    defaultFilters: record.defaultFilters,
    saveProfile: accountStore.saveProfile,
    saveDefaultFilters: accountStore.saveDefaultFilters,
    signOut: accountStore.signOut,
  }
}
