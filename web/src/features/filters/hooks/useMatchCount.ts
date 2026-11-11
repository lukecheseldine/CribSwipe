import { useEffect, useState } from 'react'
import { getListingCount } from '../../../api/listings'
import { parseFilters, toSearchParams } from '../../../lib/filters'
import type { ListingFilters } from '../../../types/filters'

const DEBOUNCE_MS = 250

/** How many listings match the filters, refreshed shortly after they stop changing. */
export function useMatchCount(filters: ListingFilters, initialCount: number) {
  const [count, setCount] = useState(initialCount)
  const query = toSearchParams(filters).toString()

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      getListingCount(parseFilters(new URLSearchParams(query)), controller.signal)
        .then(setCount)
        .catch(() => {
          // Keep the last count if a request is cancelled or fails.
        })
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return count
}
