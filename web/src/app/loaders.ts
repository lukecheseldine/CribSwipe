import { data, redirect, type LoaderFunctionArgs } from 'react-router'
import { getFilterOptions, getListing, getListingCount, getListings } from '../api/listings'
import { accountStore } from '../features/account/accountStore'
import { defaultsAreSkipped } from '../features/account/defaultFilters'
import { discoverPath } from './paths'
import { countActiveFilters, parseFilters } from '../lib/filters'

const filtersFrom = (request: Request) => parseFilters(new URL(request.url).searchParams)

export async function discoverLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const defaults = accountStore.getSnapshot().defaultFilters
  if (url.search === '' && !defaultsAreSkipped() && countActiveFilters(defaults) > 0) {
    throw redirect(discoverPath(defaults))
  }
  return { listings: await getListings(filtersFrom(request)) }
}

export async function accountLoader() {
  return getFilterOptions()
}

export async function filtersLoader({ request }: LoaderFunctionArgs) {
  const [options, count] = await Promise.all([
    getFilterOptions(),
    getListingCount(filtersFrom(request)),
  ])
  return { options, count }
}

export async function loginLoader() {
  try {
    const listings = await getListings()
    return listings.find((listing) => listing.photos.length > 0)?.photos[0] ?? null
  } catch {
    return null
  }
}

export async function listingLoader({ params }: LoaderFunctionArgs) {
  const listing = await getListing(params.listingId ?? '')
  if (!listing) throw data('Listing not found', { status: 404 })
  return listing
}
