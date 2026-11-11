import { preload } from 'react-dom'
import { useLoaderData } from 'react-router'
import { getListings, listingsRegion } from '../api/listings'
import {
  DeckMessage,
  DiscoverFooter,
  DiscoverLayout,
  ListingCard,
  useDecisionDeck,
} from '../features/discover'

export function DiscoverPage() {
  const listings = useLoaderData<typeof getListings>()
  const { current, upcoming, decide, canUndoPass, undoLastPass } = useDecisionDeck(listings)

  const nextPhoto = upcoming?.photos[0]
  if (nextPhoto) preload(nextPhoto, { as: 'image' })

  return (
    <DiscoverLayout
      location={listingsRegion}
      deck={
        current ? (
          <ListingCard
            key={current.id}
            listing={current}
            onDecision={(decision) => decide(current.id, decision)}
          />
        ) : (
          <DeckMessage>You&rsquo;ve seen every apartment here.</DeckMessage>
        )
      }
      footer={<DiscoverFooter canUndo={canUndoPass} onUndo={undoLastPass} />}
    />
  )
}

export function DiscoverLoading() {
  return (
    <DiscoverLayout
      location={listingsRegion}
      deck={<DeckMessage>Loading apartments&hellip;</DeckMessage>}
    />
  )
}

export function DiscoverError() {
  return (
    <DiscoverLayout
      location={listingsRegion}
      deck={<DeckMessage>We couldn&rsquo;t load apartments. Try again in a moment.</DeckMessage>}
    />
  )
}
