import { Card } from '../../../components/ui/Card'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'
import { useSwipe } from '../../../hooks/useSwipe'
import type { Listing } from '../../../types/listing'
import type { Decision } from '../types'
import { DecisionControls } from './DecisionControls'
import { ListingDetails } from './ListingDetails'
import { ListingPhoto } from './ListingPhoto'

type ListingCardProps = {
  listing: Listing
  onDecision: (decision: Decision) => void
}

export function ListingCard({ listing, onDecision }: ListingCardProps) {
  const { swipe, handlers, style } = useSwipe({
    onSwipe: (direction) => onDecision(direction === 'right' ? 'like' : 'pass'),
  })
  const pass = () => swipe('left')
  const like = () => swipe('right')

  useKeyboardShortcuts({ ArrowLeft: pass, ArrowRight: like })

  return (
    <Card
      as="article"
      aria-label={listing.title}
      style={style}
      {...handlers}
      className="flex h-full touch-pan-y overflow-hidden select-none"
    >
      <ListingPhoto listing={listing} className="flex-1" />
      <div className="flex w-117 shrink-0 flex-col justify-between gap-4 p-9">
        <ListingDetails listing={listing} />
        <DecisionControls onPass={pass} onLike={like} />
      </div>
    </Card>
  )
}
