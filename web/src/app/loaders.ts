import { data, type LoaderFunctionArgs } from 'react-router'
import { getFilterOptions, getListing, getListings } from '../api/listings'
import { parseFilters } from '../lib/filters'

export async function discoverLoader({ request }: LoaderFunctionArgs) {
  const filters = parseFilters(new URL(request.url).searchParams)
  const [listings, filterOptions] = await Promise.all([getListings(filters), getFilterOptions()])
  return { listings, filterOptions }
}

export async function listingLoader({ params }: LoaderFunctionArgs) {
  const listing = await getListing(params.listingId ?? '')
  if (!listing) throw data('Listing not found', { status: 404 })
  return listing
}
