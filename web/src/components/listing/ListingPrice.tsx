import { formatCurrency } from '../../lib/format'
import type { Listing } from '../../types/listing'

type ListingPriceProps = {
  listing: Listing
}

export function ListingPrice({ listing }: ListingPriceProps) {
  if (listing.priceCad === null) return null

  return (
    <p>
      <span className="text-display">{formatCurrency(listing.priceCad, 'CAD')}</span>
      <span className="text-sm text-muted"> / month</span>
    </p>
  )
}
