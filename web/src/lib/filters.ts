import type { ListingFilters } from '../types/filters'

export const emptyFilters: ListingFilters = {
  maxPrice: null,
  bedrooms: [],
  bathrooms: [],
  cities: [],
  propertyTypes: [],
}

// Short, readable keys for the page URL, e.g. /?beds=1&beds=2&city=Burnaby
const searchKeys = {
  maxPrice: 'maxPrice',
  bedrooms: 'beds',
  bathrooms: 'baths',
  cities: 'city',
  propertyTypes: 'type',
} as const satisfies Record<keyof ListingFilters, string>

const isCount = (value: number) => Number.isFinite(value) && value >= 0

function readNumber(params: URLSearchParams, key: string) {
  const raw = params.get(key)?.trim()
  if (!raw) return null
  const value = Number(raw)
  return isCount(value) ? value : null
}

function readNumbers(params: URLSearchParams, key: string) {
  return params
    .getAll(key)
    .filter((raw) => raw.trim() !== '')
    .map(Number)
    .filter(isCount)
}

function readStrings(params: URLSearchParams, key: string) {
  return params.getAll(key).filter((value) => value.trim() !== '')
}

export function parseFilters(params: URLSearchParams): ListingFilters {
  return {
    maxPrice: readNumber(params, searchKeys.maxPrice),
    bedrooms: readNumbers(params, searchKeys.bedrooms),
    bathrooms: readNumbers(params, searchKeys.bathrooms),
    cities: readStrings(params, searchKeys.cities),
    propertyTypes: readStrings(params, searchKeys.propertyTypes),
  }
}

export function toSearchParams(filters: ListingFilters) {
  const params = new URLSearchParams()
  if (filters.maxPrice !== null) params.set(searchKeys.maxPrice, String(filters.maxPrice))
  const lists = ['bedrooms', 'bathrooms', 'cities', 'propertyTypes'] as const
  for (const field of lists) {
    filters[field].forEach((value) => params.append(searchKeys[field], String(value)))
  }
  return params
}

/** How many filter groups are in use. */
export function countActiveFilters(filters: ListingFilters) {
  return [
    filters.maxPrice !== null,
    filters.bedrooms.length > 0,
    filters.bathrooms.length > 0,
    filters.cities.length > 0,
    filters.propertyTypes.length > 0,
  ].filter(Boolean).length
}

export function describeLocation(filters: ListingFilters, fallback: string) {
  const [first, ...rest] = filters.cities
  if (!first) return fallback
  return rest.length === 0 ? first : `${first} + ${rest.length} more`
}
