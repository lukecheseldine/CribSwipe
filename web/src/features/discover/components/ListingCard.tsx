import { Card } from '../../../components/ui/Card'
import { PhotoLightbox } from '../../../components/ui/PhotoLightbox'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'
import { usePhotoViewer } from '../../../hooks/usePhotoViewer'
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
  const viewer = usePhotoViewer(listing.photos.length)
  const { swipe, handlers, style } = useSwipe({
    onSwipe: (direction) => onDecision(direction === 'right' ? 'like' : 'pass'),
  })
  const pass = () => swipe('left')
  const like = () => swipe('right')

  useKeyboardShortcuts({ ArrowLeft: pass, ArrowRight: like }, { enabled: !viewer.isOpen })

  return (
    <>
      <Card
        as="article"
        aria-label={listing.title}
        style={style}
        {...handlers}
        className="flex h-full touch-pan-y overflow-hidden select-none"
      >
        <ListingPhoto
          listing={listing}
          carousel={viewer.carousel}
          onOpenFullscreen={() => viewer.open()}
          className="flex-1"
        />
        <div className="flex w-117 shrink-0 flex-col justify-between gap-4 p-9">
          <ListingDetails listing={listing} />
          <DecisionControls onPass={pass} onLike={like} />
        </div>
      </Card>
      <PhotoLightbox
        open={viewer.isOpen}
        onClose={viewer.close}
        photos={listing.photos}
        carousel={viewer.carousel}
        title={listing.title}
      />
    </>
  )
}
