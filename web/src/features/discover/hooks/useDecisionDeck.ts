import { useState } from 'react'
import type { Listing } from '../../../types/listing'
import type { Decision } from '../types'

type DecisionRecord = {
  listingId: string
  decision: Decision
}

export function useDecisionDeck(listings: Listing[]) {
  const [history, setHistory] = useState<DecisionRecord[]>([])

  const decidedIds = new Set(history.map((record) => record.listingId))
  const [current, upcoming] = listings.filter((listing) => !decidedIds.has(listing.id))
  const canUndoPass = history.some((record) => record.decision === 'pass')

  const decide = (listingId: string, decision: Decision) => {
    setHistory((previous) => [...previous, { listingId, decision }])
  }

  const undoLastPass = () => {
    setHistory((previous) => {
      const index = previous.findLastIndex((record) => record.decision === 'pass')
      return index === -1 ? previous : previous.toSpliced(index, 1)
    })
  }

  return { current, upcoming, decide, canUndoPass, undoLastPass }
}
