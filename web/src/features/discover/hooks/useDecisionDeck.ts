import { useSyncExternalStore } from 'react'
import { createStorageStore } from '../../../lib/createStorageStore'
import type { Listing } from '../../../types/listing'
import type { Decision } from '../types'

type DecisionRecord = {
  listingId: string
  decision: Decision
}

// Session-scoped so leaving Discover (e.g. to view a listing) keeps your place in the deck.
const historyStore = createStorageStore<DecisionRecord[]>({
  key: 'cribswipe.decisions.v1',
  fallback: [],
  isValid: Array.isArray,
  storage: () => sessionStorage,
})

export function useDecisionDeck(listings: Listing[]) {
  const history = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot)

  const decidedIds = new Set(history.map((record) => record.listingId))
  const [current, upcoming] = listings.filter((listing) => !decidedIds.has(listing.id))
  const canUndoPass = history.some((record) => record.decision === 'pass')

  const decide = (listingId: string, decision: Decision) => {
    historyStore.set((previous) => [...previous, { listingId, decision }])
  }

  const undoLastPass = () => {
    historyStore.set((previous) => {
      const index = previous.findLastIndex((record) => record.decision === 'pass')
      return index === -1 ? previous : previous.toSpliced(index, 1)
    })
  }

  return { current, upcoming, decide, canUndoPass, undoLastPass }
}
