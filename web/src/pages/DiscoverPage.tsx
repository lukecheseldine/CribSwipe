import { preload } from 'react-dom'
import { useLoaderData, useSearchParams } from 'react-router'
import { listingsRegion } from '../api/listings'
import type { discoverLoader } from '../app/loaders'
import { filtersPath, paths } from '../app/paths'
import { ButtonLink } from '../components/ui/ButtonLink'
import {
  DeckMessage,
  DiscoverFooter,
  DiscoverHeader,
  DiscoverLayout,
  ListingCard,
  useDecisionDeck,
  type Decision,
} from '../features/discover'
import { skipDefaultFilters } from '../features/account'
import { useShortlist } from '../features/shortlist'
import { countActiveFilters, describeLocation, emptyFilters, parseFilters } from '../lib/filters'
import type { Listing } from '../types/listing'

export function DiscoverPage() {
  const { listings } = useLoaderData<typeof discoverLoader>()
  const [searchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const activeFilterCount = countActiveFilters(filters)

  const shortlist = useShortlist()
  const savedIds = new Set(shortlist.saved.map(({ listing }) => listing.id))
  const unsaved = listings.filter((listing) => !savedIds.has(listing.id))
  const { current, upcoming, decide, canUndoPass, undoLastPass } = useDecisionDeck(unsaved)

  const onDecision = (listing: Listing, decision: Decision) => {
    if (decision === 'like') shortlist.save(listing)
    decide(listing.id, decision)
  }

  const nextPhoto = upcoming?.photos[0]
  if (nextPhoto) preload(nextPhoto, { as: 'image' })

  const clearFilters = (
    <ButtonLink to={paths.discover} onClick={() => skipDefaultFilters()}>
      Clear filters
    </ButtonLink>
  )

  return (
    <DiscoverLayout
      header={
        <DiscoverHeader
          location={describeLocation(filters, listingsRegion)}
          filtersHref={filtersPath(filters)}
          activeFilterCount={activeFilterCount}
        />
      }
      deck={
        current ? (
          <ListingCard
            key={current.id}
            listing={current}
            onDecision={(decision) => onDecision(current, decision)}
          />
        ) : activeFilterCount === 0 ? (
          <DeckMessage>You&rsquo;ve seen every apartment here.</DeckMessage>
        ) : listings.length === 0 ? (
          <DeckMessage action={clearFilters}>No apartments match these filters.</DeckMessage>
        ) : (
          <DeckMessage action={clearFilters}>
            You&rsquo;ve seen every apartment that matches these filters.
          </DeckMessage>
        )
      }
      footer={<DiscoverFooter canUndo={canUndoPass} onUndo={undoLastPass} />}
    />
  )
}

const defaultHeader = (
  <DiscoverHeader location={listingsRegion} filtersHref={filtersPath(emptyFilters)} />
)

export function DiscoverLoading() {
  return (
    <DiscoverLayout
      header={defaultHeader}
      deck={<DeckMessage>Loading apartments&hellip;</DeckMessage>}
    />
  )
}

export function DiscoverError() {
  return (
    <DiscoverLayout
      header={defaultHeader}
      deck={<DeckMessage>We couldn&rsquo;t load apartments. Try again in a moment.</DeckMessage>}
    />
  )
}
