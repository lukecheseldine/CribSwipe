import type { ListingFilters } from '../types/filters'

export const emptyFilters: ListingFilters = {
  maxPrice: null,
  bedrooms: [],
  bathrooms: [],
  minSqft: null,
  cities: [],
  propertyTypes: [],
  moveInDate: null,
  petFriendly: false,
  amenities: [],
}

// Short, readable keys for the page URL, e.g. /?beds=1&beds=2&city=Burnaby
const searchKeys = {
  maxPrice: 'maxPrice',
  bedrooms: 'beds',
  bathrooms: 'baths',
  minSqft: 'sqft',
  cities: 'city',
  propertyTypes: 'type',
  moveInDate: 'moveIn',
  petFriendly: 'pets',
  amenities: 'amenity',
} as const satisfies Record<keyof ListingFilters, string>

const numberFields = ['maxPrice', 'minSqft'] as const
const listFields = ['bedrooms', 'bathrooms', 'cities', 'propertyTypes', 'amenities'] as const

const isCount = (value: number) => Number.isFinite(value) && value >= 0
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

function readNumber(params: URLSearchParams, key: string) {
  const raw = params.get(key)?.trim()
  if (!raw) return null
  const value = Number(raw)
  return isCount(value) ? value : null
}

function readNumbers(params: URLSearchParams, key: string) {
  return readStrings(params, key).map(Number).filter(isCount)
}

function readStrings(params: URLSearchParams, key: string) {
  return params.getAll(key).filter((value) => value.trim() !== '')
}

export function parseFilters(params: URLSearchParams): ListingFilters {
  const moveIn = params.get(searchKeys.moveInDate)
  return {
    maxPrice: readNumber(params, searchKeys.maxPrice),
    bedrooms: readNumbers(params, searchKeys.bedrooms),
    bathrooms: readNumbers(params, searchKeys.bathrooms),
    minSqft: readNumber(params, searchKeys.minSqft),
    cities: readStrings(params, searchKeys.cities),
    propertyTypes: readStrings(params, searchKeys.propertyTypes),
    moveInDate: moveIn && isIsoDate(moveIn) ? moveIn : null,
    petFriendly: params.get(searchKeys.petFriendly) === '1',
    amenities: readStrings(params, searchKeys.amenities),
  }
}

export function toSearchParams(filters: ListingFilters) {
  const params = new URLSearchParams()
  for (const field of numberFields) {
    const value = filters[field]
    if (value !== null) params.set(searchKeys[field], String(value))
  }
  for (const field of listFields) {
    filters[field].forEach((value) => params.append(searchKeys[field], String(value)))
  }
  if (filters.moveInDate) params.set(searchKeys.moveInDate, filters.moveInDate)
  if (filters.petFriendly) params.set(searchKeys.petFriendly, '1')
  return params
}

/** "?beds=1&city=Burnaby", or "" when nothing is set. */
export function toSearch(filters: ListingFilters) {
  const query = toSearchParams(filters).toString()
  return query ? `?${query}` : ''
}

/** How many filter groups are in use. */
export function countActiveFilters(filters: ListingFilters) {
  return [
    filters.maxPrice !== null,
    filters.minSqft !== null,
    filters.moveInDate !== null,
    filters.petFriendly,
    ...listFields.map((field) => filters[field].length > 0),
  ].filter(Boolean).length
}

export function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

export function describeLocation(filters: ListingFilters, fallback: string) {
  const [first, ...rest] = filters.cities
  if (!first) return fallback
  return rest.length === 0 ? first : `${first} + ${rest.length} more`
}
