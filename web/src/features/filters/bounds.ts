import type { FilterOption } from '../../types/filters'

/**
 * Fixed scales for the numeric filters. These do not follow the scraped listings, so a
 * saved search stays put when a listing is added or taken down.
 * Rent and size are multiples of the slider step ($50 and 50 sq ft).
 */
export const priceBounds = { min: 100, max: 15_000 }
export const sizeBounds = { min: 200, max: 6_000 }

const bedroomCounts = [0, 1, 2, 3, 4, 5, 6]
const bathroomCounts = [1, 2, 3, 4, 5]

const asChoices = (counts: number[]): FilterOption<number>[] =>
  counts.map((value) => ({ value, count: 0 }))

export const bedroomChoices = asChoices(bedroomCounts)
export const bathroomChoices = asChoices(bathroomCounts)
