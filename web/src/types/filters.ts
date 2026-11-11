export type ListingFilters = {
  maxPrice: number | null
  bedrooms: number[]
  bathrooms: number[]
  minSqft: number | null
  cities: string[]
  propertyTypes: string[]
  // Saved with the search but not applied yet: the scraper doesn't collect these.
  moveInDate: string | null
  petFriendly: boolean
  amenities: string[]
}

export type FilterOption<T extends string | number = string> = {
  value: T
  count: number
}

/** Cities and property types currently in the listings. Numeric scales are fixed separately. */
export type FilterOptions = {
  cities: FilterOption[]
  propertyTypes: FilterOption[]
}
