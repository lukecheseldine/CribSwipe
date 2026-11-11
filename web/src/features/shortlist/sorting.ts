import type { SavedListing, SortOrder } from './types'

export const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'priceLow', label: 'Price: low to high' },
  { value: 'priceHigh', label: 'Price: high to low' },
]

const bySavedAt = (a: SavedListing, b: SavedListing) => a.savedAt.localeCompare(b.savedAt)

// Listings without a price sort last in both directions.
const byPrice = (direction: 1 | -1) => (a: SavedListing, b: SavedListing) => {
  const priceA = a.listing.priceCad
  const priceB = b.listing.priceCad
  if (priceA === null || priceB === null)
    return (priceA === null ? 1 : 0) - (priceB === null ? 1 : 0)
  return (priceA - priceB) * direction
}

const comparators: Record<SortOrder, (a: SavedListing, b: SavedListing) => number> = {
  newest: (a, b) => bySavedAt(b, a),
  oldest: bySavedAt,
  priceLow: byPrice(1),
  priceHigh: byPrice(-1),
}

export function sortSavedListings(saved: SavedListing[], order: SortOrder) {
  return saved.toSorted(comparators[order])
}
