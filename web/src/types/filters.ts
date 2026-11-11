export type ListingFilters = {
  maxPrice: number | null
  bedrooms: number[]
  bathrooms: number[]
  cities: string[]
  propertyTypes: string[]
}

export type FilterOption<T extends string | number = string> = {
  value: T
  count: number
}

/** The choices present in the scraped data. */
export type FilterOptions = {
  cities: FilterOption[]
  propertyTypes: FilterOption[]
  bedrooms: FilterOption<number>[]
  bathrooms: FilterOption<number>[]
  minPrice: number | null
  maxPrice: number | null
}
