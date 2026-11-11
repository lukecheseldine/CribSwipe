import { emptyFilters } from '../lib/filters'
import type { FilterOption, FilterOptions, ListingFilters } from '../types/filters'
import type { Listing } from '../types/listing'

export const listingsRegion = 'Vancouver, BC'

// These mirror backend/app/listings/schemas.py.
type ApiFilterOptions = {
  cities: FilterOption[]
  property_types: FilterOption[]
  bedrooms: FilterOption<number>[]
  bathrooms: FilterOption<number>[]
  min_price: number | null
  max_price: number | null
}

type ApiListing = {
  id: string
  url: string
  title: string | null
  price_cad: number | null
  bedrooms: string | null
  bathrooms: number | null
  sqft: number | null
  property_type: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  body: string | null
  posted_at: string | null
  photos: string[]
}

function blankToNull(value: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function parseCount(value: string | null) {
  const count = Number(value)
  return value !== null && Number.isFinite(count) ? count : null
}

function toListing(row: ApiListing): Listing {
  return {
    id: row.id,
    title: blankToNull(row.title) ?? 'Untitled listing',
    url: row.url,
    priceCad: row.price_cad,
    bedrooms: parseCount(row.bedrooms),
    bathrooms: row.bathrooms,
    sqft: row.sqft,
    propertyType: blankToNull(row.property_type),
    address: blankToNull(row.address),
    city: blankToNull(row.city),
    postalCode: blankToNull(row.postal_code),
    description: blankToNull(row.body),
    postedAt: row.posted_at,
    photos: row.photos,
  }
}

function toQuery(filters: ListingFilters) {
  const query = new URLSearchParams()
  if (filters.maxPrice !== null) query.set('max_price', String(filters.maxPrice))
  const lists = {
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    city: filters.cities,
    property_type: filters.propertyTypes,
  }
  for (const [key, values] of Object.entries(lists)) {
    values.forEach((value) => query.append(key, String(value)))
  }
  return query
}

export async function getListings(filters: ListingFilters = emptyFilters): Promise<Listing[]> {
  const query = toQuery(filters).toString()
  const response = await fetch(query ? `/api/listings?${query}` : '/api/listings')
  if (!response.ok) throw new Error(`Failed to load listings (${response.status})`)
  const body: { listings: ApiListing[] } = await response.json()
  return body.listings.map(toListing)
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await fetch('/api/listings/filter-options')
  if (!response.ok) throw new Error(`Failed to load filter options (${response.status})`)
  const body: ApiFilterOptions = await response.json()
  return {
    cities: body.cities,
    propertyTypes: body.property_types,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    minPrice: body.min_price,
    maxPrice: body.max_price,
  }
}

/** Resolves to null when the listing doesn't exist. */
export async function getListing(id: string): Promise<Listing | null> {
  const response = await fetch(`/api/listings/${encodeURIComponent(id)}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Failed to load listing (${response.status})`)
  return toListing(await response.json())
}
