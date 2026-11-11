import type { Listing } from '../../types/listing'

export type SavedListing = {
  listing: Listing
  savedAt: string
}

export type SortOrder = 'newest' | 'oldest' | 'priceLow' | 'priceHigh'
