import { createStorageStore } from '../../lib/createStorageStore'
import { emptyFilters } from '../../lib/filters'
import type { ListingFilters } from '../../types/filters'
import { clearDefaultSkip } from './defaultFilters'
import type { Profile } from './types'

type AccountRecord = {
  profile: Profile | null
  defaultFilters: ListingFilters
}

const fallback: AccountRecord = { profile: null, defaultFilters: emptyFilters }

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isNumberList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number')
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isFilters(value: unknown): value is ListingFilters {
  if (!value || typeof value !== 'object') return false
  const filters = value as ListingFilters
  return (
    isNullableNumber(filters.maxPrice) &&
    isNumberList(filters.bedrooms) &&
    isNumberList(filters.bathrooms) &&
    isNullableNumber(filters.minSqft) &&
    isStringList(filters.cities) &&
    isStringList(filters.propertyTypes) &&
    (filters.moveInDate === null || typeof filters.moveInDate === 'string') &&
    typeof filters.petFriendly === 'boolean' &&
    isStringList(filters.amenities)
  )
}

function isProfile(value: unknown): value is Profile | null {
  if (value === null) return true
  if (!value || typeof value !== 'object') return false
  const profile = value as Profile
  return (
    typeof profile.name === 'string' &&
    typeof profile.email === 'string' &&
    typeof profile.phone === 'string' &&
    (profile.photo === null || typeof profile.photo === 'string')
  )
}

const store = createStorageStore<AccountRecord>({
  key: 'cribswipe.account.v1',
  fallback,
  isValid: (value): value is AccountRecord => {
    if (!value || typeof value !== 'object') return false
    const record = value as AccountRecord
    return isProfile(record.profile) && isFilters(record.defaultFilters)
  },
})

function saveProfile(profile: Profile) {
  store.set((current) => ({ ...current, profile }))
}

function saveDefaultFilters(defaultFilters: ListingFilters) {
  clearDefaultSkip()
  store.set((current) => ({ ...current, defaultFilters }))
}

function signOut() {
  store.set((current) => ({ ...current, profile: null }))
}

export const accountStore = {
  getSnapshot: store.getSnapshot,
  subscribe: store.subscribe,
  saveProfile,
  saveDefaultFilters,
  signOut,
}
