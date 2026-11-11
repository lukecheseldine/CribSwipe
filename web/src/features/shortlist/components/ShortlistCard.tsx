import { listingPath, type ListingLinkState } from '../../../app/paths'
import { ListingFacts } from '../../../components/listing/ListingFacts'
import { ListingImage } from '../../../components/listing/ListingImage'
import { ListingPrice } from '../../../components/listing/ListingPrice'
import { Badge } from '../../../components/ui/Badge'
import { ButtonLink } from '../../../components/ui/ButtonLink'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { getFullAddress } from '../../../lib/listing'
import type { Listing } from '../../../types/listing'

type ShortlistCardProps = {
  listing: Listing
  onRemove: () => void
}

export function ShortlistCard({ listing, onRemove }: ShortlistCardProps) {
  const location = getFullAddress(listing)

  return (
    <Card as="article" className="overflow-hidden">
      <div className="relative h-81 bg-canvas">
        <ListingImage src={listing.photos[0]} alt={listing.title} />
        {listing.propertyType && (
          <div className="absolute top-5 left-5">
            <Badge>{listing.propertyType}</Badge>
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from shortlist"
          className="group absolute top-5 right-5 flex size-11 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-[#f8e8e6] hover:text-[#c44536] focus-visible:bg-[#f8e8e6] focus-visible:text-[#c44536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c44536]"
        >
          <Icon name="heart" className="group-hover:hidden group-focus-visible:hidden" />
          <Icon name="heartCrack" className="hidden group-hover:block group-focus-visible:block" />
        </button>
      </div>

      <div className="flex flex-col gap-5 p-7">
        <div className="flex flex-col gap-2">
          <h2 title={listing.title} className="line-clamp-1 text-title leading-heading">
            {listing.title}
          </h2>
          {location && <address className="text-label text-muted not-italic">{location}</address>}
        </div>

        <div className="flex flex-col gap-4">
          <ListingPrice listing={listing} />
          <ListingFacts listing={listing} />
        </div>

        <div className="flex items-center justify-between border-t border-line pt-5">
          <ButtonLink
            to={listingPath(listing.id)}
            state={{ from: 'shortlist' } satisfies ListingLinkState}
            icon="arrowRight"
          >
            View apartment
          </ButtonLink>
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer text-label text-brand hover:underline"
          >
            Remove from shortlist
          </button>
        </div>
      </div>
    </Card>
  )
}
