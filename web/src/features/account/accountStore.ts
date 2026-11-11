import { updateFilters, updateProfile, type Account } from '../../api/account'
import { emptyFilters } from '../../lib/filters'
import type { ListingFilters } from '../../types/filters'
import { clearDefaultSkip } from './defaultFilters'
import type { Profile } from './types'

type AccountRecord = {
  id: string | null
  profile: Profile | null
  defaultFilters: ListingFilters
}

const guest: AccountRecord = { id: null, profile: null, defaultFilters: emptyFilters }

const listeners = new Set<() => void>()
let signedIn = false
let snapshot: AccountRecord = guest

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  return snapshot
}

function isSignedIn() {
  return signedIn
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function showAccount(account: Account) {
  signedIn = true
  snapshot = {
    id: account.id,
    profile: account.profile,
    defaultFilters: account.defaultFilters,
  }
  emit()
}

function showGuest() {
  signedIn = false
  snapshot = guest
  emit()
}

async function saveProfile(profile: Profile) {
  const account = await updateProfile(profile)
  showAccount(account)
}

async function saveDefaultFilters(defaultFilters: ListingFilters) {
  clearDefaultSkip()
  const account = await updateFilters(defaultFilters)
  showAccount(account)
}

export const accountStore = {
  getSnapshot,
  isSignedIn,
  subscribe,
  showAccount,
  showGuest,
  saveProfile,
  saveDefaultFilters,
}
