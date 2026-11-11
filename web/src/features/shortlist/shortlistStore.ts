import { addShortlistItem, removeShortlistItem, type Account } from '../../api/account'
import { createStorageStore } from '../../lib/createStorageStore'
import type { Listing } from '../../types/listing'
import type { SavedListing } from './types'

// Guest likes stay on this device. A signed-in shortlist is kept on the account.
const local = createStorageStore<SavedListing[]>({
  key: 'cribswipe.shortlist.v1',
  fallback: [],
  isValid: Array.isArray,
})

const listeners = new Set<() => void>()
let remote: SavedListing[] | null = null

function emit() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  return remote ?? local.getSnapshot()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const unsubscribe = local.subscribe(() => {
    if (remote === null) listener()
  })
  return () => {
    listeners.delete(listener)
    unsubscribe()
  }
}

function showAccount(items: Account['shortlist']) {
  remote = items
  emit()
}

function showGuest() {
  remote = null
  emit()
}

function guestItems() {
  return local.getSnapshot()
}

function clearGuest() {
  local.set(() => [])
}

function save(listing: Listing) {
  if (remote) {
    if (remote.some((item) => item.listing.id === listing.id)) return
    remote = [{ listing, savedAt: new Date().toISOString() }, ...remote]
    emit()
    void addShortlistItem(listing).then(
      (account) => {
        remote = account.shortlist
        emit()
      },
      () => {
        remote = remote?.filter((item) => item.listing.id !== listing.id) ?? null
        emit()
      }
    )
    return
  }
  local.set((saved) =>
    saved.some((item) => item.listing.id === listing.id)
      ? saved
      : [{ listing, savedAt: new Date().toISOString() }, ...saved]
  )
}

function remove(listingId: string) {
  if (remote) {
    const previous = remote
    remote = remote.filter((item) => item.listing.id !== listingId)
    emit()
    void removeShortlistItem(listingId).catch(() => {
      remote = previous
      emit()
    })
    return
  }
  local.set((saved) => saved.filter((item) => item.listing.id !== listingId))
}

export const shortlistStore = {
  getSnapshot,
  subscribe,
  save,
  remove,
  showAccount,
  showGuest,
  guestItems,
  clearGuest,
}
