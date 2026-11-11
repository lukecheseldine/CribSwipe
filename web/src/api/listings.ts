import type { Listing } from '../types/listing'

export const listingsRegion = 'Vancouver, BC'

// Mirrors backend/app/listings/schemas.py.
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

export async function getListings(): Promise<Listing[]> {
  const response = await fetch('/api/listings')
  if (!response.ok) throw new Error(`Failed to load listings (${response.status})`)
  const body: { listings: ApiListing[] } = await response.json()
  return body.listings.map(toListing)
}
