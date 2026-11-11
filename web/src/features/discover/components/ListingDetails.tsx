import { listingPath, type ListingLinkState } from '../../../app/paths'
import { ListingFacts } from '../../../components/listing/ListingFacts'
import { ListingPrice } from '../../../components/listing/ListingPrice'
import { Badge } from '../../../components/ui/Badge'
import { ButtonLink } from '../../../components/ui/ButtonLink'
import { getLocality } from '../../../lib/listing'
import type { Listing } from '../../../types/listing'

type ListingDetailsProps = {
  listing: Listing
}

export function ListingDetails({ listing }: ListingDetailsProps) {
  const locality = getLocality(listing)

  return (
    <div className="flex flex-col items-start gap-5">
      {listing.propertyType && <Badge>{listing.propertyType}</Badge>}

      <div className="flex w-full flex-col gap-2.5">
        <h2 title={listing.title} className="line-clamp-1 text-3xl leading-heading">
          {listing.title}
        </h2>
        {(listing.address || locality) && (
          <address className="text-sm leading-normal text-muted not-italic">
            {listing.address}
            {listing.address && locality && <br />}
            {locality}
          </address>
        )}
      </div>

      <ListingPrice listing={listing} />

      <hr className="w-full border-line" />

      <ListingFacts listing={listing} />

      {listing.description && (
        <p className="line-clamp-2 text-sm leading-normal text-muted">{listing.description}</p>
      )}

      <ButtonLink
        to={listingPath(listing.id)}
        state={{ from: 'discover' } satisfies ListingLinkState}
        icon="arrowRight"
        className="w-full"
      >
        View apartment
      </ButtonLink>
    </div>
  )
}
