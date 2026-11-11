import { createStorageStore } from '../../lib/createStorageStore'
import type { Listing } from '../../types/listing'
import type { SavedListing } from './types'

// Lives in this browser only until accounts exist; bump the version if SavedListing changes shape.
const store = createStorageStore<SavedListing[]>({
  key: 'cribswipe.shortlist.v1',
  fallback: [],
  isValid: Array.isArray,
})

function save(listing: Listing) {
  store.set((saved) =>
    saved.some((item) => item.listing.id === listing.id)
      ? saved
      : [{ listing, savedAt: new Date().toISOString() }, ...saved]
  )
}

function remove(listingId: string) {
  store.set((saved) => saved.filter((item) => item.listing.id !== listingId))
}

export const shortlistStore = {
  getSnapshot: store.getSnapshot,
  subscribe: store.subscribe,
  save,
  remove,
}
