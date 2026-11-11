import { emptyFilters } from '../lib/filters'
import type { ListingFilters } from '../types/filters'
import type { Listing } from '../types/listing'

type Profile = {
  name: string
  email: string
  phone: string
  photo: string | null
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
  }
}

type ApiFilters = {
  max_price: number | null
  bedrooms: number[]
  bathrooms: number[]
  min_sqft: number | null
  cities: string[]
  property_types: string[]
  move_in_date: string | null
  pet_friendly: boolean
  amenities: string[]
}

type ApiAccount = {
  id: string
  name: string
  email: string
  phone: string
  photo: string | null
  default_filters: ApiFilters
  shortlist: { saved_at: string; listing: Listing }[]
}

export type Account = {
  id: string
  profile: Profile
  defaultFilters: ListingFilters
  shortlist: { listing: Listing; savedAt: string }[]
}

function toFilters(filters: ApiFilters): ListingFilters {
  return {
    maxPrice: filters.max_price,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    minSqft: filters.min_sqft,
    cities: filters.cities,
    propertyTypes: filters.property_types,
    moveInDate: filters.move_in_date,
    petFriendly: filters.pet_friendly,
    amenities: filters.amenities,
  }
}

function fromFilters(filters: ListingFilters): ApiFilters {
  return {
    max_price: filters.maxPrice,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    min_sqft: filters.minSqft,
    cities: filters.cities,
    property_types: filters.propertyTypes,
    move_in_date: filters.moveInDate,
    pet_friendly: filters.petFriendly,
    amenities: filters.amenities,
  }
}

function toAccount(body: ApiAccount): Account {
  return {
    id: body.id,
    profile: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      photo: body.photo,
    },
    defaultFilters: { ...emptyFilters, ...toFilters(body.default_filters) },
    shortlist: body.shortlist
      .filter((item) => item.listing && typeof item.listing.id === 'string')
      .map((item) => ({ listing: item.listing, savedAt: item.saved_at })),
  }
}

async function send(path: string, method: string, body?: unknown): Promise<Account> {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    let message = 'Something went wrong. Try again.'
    try {
      const payload: { detail?: unknown } = await response.json()
      if (typeof payload.detail === 'string') message = payload.detail
    } catch {
      // The response had no JSON body.
    }
    throw new ApiError(message)
  }
  return toAccount(await response.json())
}

/** The signed-in account, or null when the session cookie is missing. */
export async function getAccount(): Promise<Account | null> {
  let response: Response
  try {
    response = await fetch('/api/account')
  } catch {
    return null
  }
  if (response.status === 401) return null
  if (!response.ok) throw new ApiError('We couldn’t load your account.')
  return toAccount(await response.json())
}

export function signup(input: { name: string; identifier: string; password: string }) {
  return send('/api/auth/signup', 'POST', input)
}

export function login(input: { identifier: string; password: string }) {
  return send('/api/auth/login', 'POST', input)
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export function updateProfile(profile: Profile) {
  return send('/api/account/profile', 'PUT', profile)
}

export function updateFilters(filters: ListingFilters) {
  return send('/api/account/filters', 'PUT', fromFilters(filters))
}

export function addShortlistItem(listing: Listing) {
  return send('/api/account/shortlist', 'POST', { listing })
}

export function removeShortlistItem(listingId: string) {
  return send(`/api/account/shortlist/${encodeURIComponent(listingId)}`, 'DELETE')
}
