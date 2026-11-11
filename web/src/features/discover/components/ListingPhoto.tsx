import { preload } from 'react-dom'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { CarouselArrows } from '../../../components/ui/CarouselArrows'
import type { Carousel } from '../../../hooks/useCarousel'
import { cn } from '../../../lib/cn'
import { pluralize } from '../../../lib/format'
import { isJustListed } from '../../../lib/listing'
import type { Listing } from '../../../types/listing'

type ListingPhotoProps = {
  listing: Listing
  carousel: Carousel
  onOpenFullscreen: () => void
  className?: string
}

export function ListingPhoto({
  listing,
  carousel,
  onOpenFullscreen,
  className,
}: ListingPhotoProps) {
  const photo = listing.photos[carousel.index]
  const nextPhoto = listing.photos[carousel.nextIndex]
  if (carousel.canNavigate && nextPhoto) preload(nextPhoto, { as: 'image' })

  return (
    <div className={cn('relative min-w-0 bg-canvas', className)}>
      {photo ? (
        <img
          src={photo}
          alt={`Photo ${carousel.index + 1} of ${listing.title}`}
          draggable={false}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <p className="flex size-full items-center justify-center text-sm text-muted">
          No photos provided
        </p>
      )}
      {isJustListed(listing) && (
        <div className="absolute top-6 left-6">
          <Badge icon="sparkles">Just listed</Badge>
        </div>
      )}
      <CarouselArrows carousel={carousel} itemLabel="photo" />
      {listing.photos.length > 0 && (
        <Button icon="maximize" onClick={onOpenFullscreen} className="absolute right-6 bottom-6">
          Full-screen · {pluralize(listing.photos.length, 'photo')}
        </Button>
      )}
    </div>
  )
}
