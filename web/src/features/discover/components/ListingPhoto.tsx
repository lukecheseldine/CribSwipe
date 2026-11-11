import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../lib/cn'
import { pluralize } from '../../../lib/format'
import { isJustListed } from '../../../lib/listing'
import type { Listing } from '../../../types/listing'

type ListingPhotoProps = {
  listing: Listing
  className?: string
}

export function ListingPhoto({ listing, className }: ListingPhotoProps) {
  const [cover] = listing.photos

  return (
    <div className={cn('relative min-w-0 bg-canvas', className)}>
      {cover ? (
        <img
          src={cover}
          alt={`Photo of ${listing.title}`}
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
      {listing.photos.length > 0 && (
        <Button icon="maximize" className="absolute right-6 bottom-6">
          Full-screen · {pluralize(listing.photos.length, 'photo')}
        </Button>
      )}
    </div>
  )
}
