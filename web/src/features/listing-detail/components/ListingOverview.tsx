import { ListingFacts } from '../../../components/listing/ListingFacts'
import { Badge } from '../../../components/ui/Badge'
import { getFullAddress } from '../../../lib/listing'
import type { Listing } from '../../../types/listing'

type ListingOverviewProps = {
  listing: Listing
}

export function ListingOverview({ listing }: ListingOverviewProps) {
  const address = getFullAddress(listing)

  return (
    <div className="flex flex-col items-start gap-8">
      <div className="flex flex-col items-start gap-4">
        {listing.propertyType && <Badge>{listing.propertyType}</Badge>}
        <div className="flex flex-col gap-2.5">
          <h1 className="text-4xl leading-heading">{listing.title}</h1>
          {address && <address className="text-label text-muted not-italic">{address}</address>}
        </div>
      </div>
      <ListingFacts
        listing={listing}
        className="w-full rounded-2xl border border-line bg-white px-5 py-5"
      />
    </div>
  )
}
