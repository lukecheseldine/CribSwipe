const skippedKey = 'cribswipe.filters.skipped'

/** This visit asked for an unfiltered Discover, so saved defaults stay out of the way. */
export function skipDefaultFilters() {
  sessionStorage.setItem(skippedKey, '1')
}

export function clearDefaultSkip() {
  sessionStorage.removeItem(skippedKey)
}

export function defaultsAreSkipped() {
  try {
    return sessionStorage.getItem(skippedKey) === '1'
  } catch {
    return false
  }
}
