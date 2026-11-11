import { generatePath } from 'react-router'

export const paths = {
  discover: '/',
  shortlist: '/shortlist',
  account: '/account',
  listing: '/listings/:listingId',
} as const

/** Router state on links into a listing, so its page can offer the right way back. */
export type ListingLinkState = { from: 'discover' | 'shortlist' }

export function listingPath(listingId: string) {
  return generatePath(paths.listing, { listingId })
}
