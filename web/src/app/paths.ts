import { generatePath } from 'react-router'
import { toSearch } from '../lib/filters'
import type { ListingFilters } from '../types/filters'

export const paths = {
  discover: '/',
  filters: '/filters',
  shortlist: '/shortlist',
  account: '/account',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  terms: '/terms',
  privacy: '/privacy',
  listing: '/listings/:listingId',
} as const

/** Router state on links into a listing, so its page can offer the right way back. */
export type ListingLinkState = { from: 'discover' | 'shortlist' }

export function listingPath(listingId: string) {
  return generatePath(paths.listing, { listingId })
}

export function discoverPath(filters: ListingFilters) {
  return paths.discover + toSearch(filters)
}

export function filtersPath(filters: ListingFilters) {
  return paths.filters + toSearch(filters)
}
