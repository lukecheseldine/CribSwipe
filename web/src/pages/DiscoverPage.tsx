import { useState } from 'react'
import { preload } from 'react-dom'
import { useLoaderData, useSearchParams } from 'react-router'
import { listingsRegion } from '../api/listings'
import type { discoverLoader } from '../app/loaders'
import { Button } from '../components/ui/Button'
import {
  DeckMessage,
  DiscoverFooter,
  DiscoverHeader,
  DiscoverLayout,
  FiltersDialog,
  ListingCard,
  useDecisionDeck,
  type Decision,
} from '../features/discover'
import { useShortlist } from '../features/shortlist'
import {
  countActiveFilters,
  describeLocation,
  emptyFilters,
  parseFilters,
  toSearchParams,
} from '../lib/filters'
import type { ListingFilters } from '../types/filters'
import type { Listing } from '../types/listing'

export function DiscoverPage() {
  const { listings, filterOptions } = useLoaderData<typeof discoverLoader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  const applyFilters = (next: ListingFilters) => {
    setSearchParams(toSearchParams(next))
    setFiltersOpen(false)
  }

  const nextPhoto = upcoming?.photos[0]
  if (nextPhoto) preload(nextPhoto, { as: 'image' })

  const clearFilters = <Button onClick={() => applyFilters(emptyFilters)}>Clear filters</Button>

  return (
    <>
      <DiscoverLayout
        header={
          <DiscoverHeader
            location={describeLocation(filters, listingsRegion)}
            activeFilterCount={activeFilterCount}
            onOpenFilters={() => setFiltersOpen(true)}
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
      <FiltersDialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        options={filterOptions}
        onApply={applyFilters}
      />
    </>
  )
}

export function DiscoverLoading() {
  return (
    <DiscoverLayout
      header={<DiscoverHeader location={listingsRegion} />}
      deck={<DeckMessage>Loading apartments&hellip;</DeckMessage>}
    />
  )
}

export function DiscoverError() {
  return (
    <DiscoverLayout
      header={<DiscoverHeader location={listingsRegion} />}
      deck={<DeckMessage>We couldn&rsquo;t load apartments. Try again in a moment.</DeckMessage>}
    />
  )
}
