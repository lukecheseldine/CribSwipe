import { Badge } from '../../../components/ui/Badge'
import { ExternalButtonLink } from '../../../components/ui/ExternalButtonLink'
import { formatCurrency } from '../../../lib/format'
import { getLocality } from '../../../lib/listing'
import type { Listing } from '../../../types/listing'
import { ListingFacts } from './ListingFacts'

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

      {listing.priceCad !== null && (
        <p>
          <span className="text-display">{formatCurrency(listing.priceCad, 'CAD')}</span>
          <span className="text-sm text-muted"> / month</span>
        </p>
      )}

      <hr className="w-full border-line" />

      <ListingFacts listing={listing} />

      {listing.description && (
        <p className="line-clamp-2 text-sm leading-normal text-muted">{listing.description}</p>
      )}

      <ExternalButtonLink href={listing.url} icon="arrowRight" className="w-full">
        View on Craigslist
      </ExternalButtonLink>
    </div>
  )
}
