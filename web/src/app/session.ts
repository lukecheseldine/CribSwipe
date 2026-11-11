import { addShortlistItem, getAccount, logout } from '../api/account'
import { accountStore } from '../features/account/accountStore'
import { shortlistStore } from '../features/shortlist/shortlistStore'
import type { Listing } from '../types/listing'

let loading: Promise<void> | null = null

/** Loads the session cookie into the account and shortlist, and keeps guest likes. */
export function loadSession() {
  loading ??= load().finally(() => {
    loading = null
  })
  return loading
}

async function load() {
  const account = await getAccount()
  if (!account) {
    accountStore.showGuest()
    shortlistStore.showGuest()
    return
  }

  const guest = shortlistStore.guestItems()
  if (guest.length > 0) {
    for (const item of guest) await keepGuestLike(item.listing)
    shortlistStore.clearGuest()
  }

  const current = (await getAccount()) ?? account
  accountStore.showAccount(current)
  shortlistStore.showAccount(current.shortlist)
}

async function keepGuestLike(listing: Listing) {
  try {
    await addShortlistItem(listing)
  } catch {
    // Skip a guest like the account could not store.
  }
}

export async function signOutSession() {
  await logout()
  accountStore.showGuest()
  shortlistStore.showGuest()
}
