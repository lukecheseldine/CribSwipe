import type { Listing } from '../types/listing'

const JUST_LISTED_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

export function isJustListed(listing: Listing, now = Date.now()) {
  if (!listing.postedAt) return false
  return now - new Date(listing.postedAt).getTime() < JUST_LISTED_WINDOW_MS
}

export function getLocality(listing: Listing) {
  return [listing.city, listing.postalCode].filter(Boolean).join(', ') || null
}

/** Street address and locality on one line, e.g. "369 Dollarton Hwy · North Vancouver, V7G 2A2". */
export function getFullAddress(listing: Listing) {
  return [listing.address, getLocality(listing)].filter(Boolean).join(' · ') || null
}
