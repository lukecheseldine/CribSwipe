import { ListingPrice } from '../../../components/listing/ListingPrice'
import { Card } from '../../../components/ui/Card'
import { ExternalButtonLink } from '../../../components/ui/ExternalButtonLink'
import { Icon } from '../../../components/ui/Icon'
import { pluralize } from '../../../lib/format'
import type { Listing } from '../../../types/listing'

type RentCardProps = {
  listing: Listing
  onOpenPhotos: () => void
}

export function RentCard({ listing, onOpenPhotos }: RentCardProps) {
  const photoCount = listing.photos.length

  return (
    <Card as="section" aria-label="Rent" className="sticky top-6 flex flex-col gap-5 p-7">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wider text-muted uppercase">Monthly rent</p>
        {listing.priceCad === null ? (
          <p className="text-xl">Not listed</p>
        ) : (
          <ListingPrice listing={listing} />
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <ExternalButtonLink
          href={listing.url}
          icon="arrowUpRight"
          variant="primary"
          className="w-full"
        >
          View original listing
        </ExternalButtonLink>
        <p className="text-center text-xs text-muted">Opens the original post on Craigslist.</p>
      </div>

      {photoCount > 0 && (
        <button
          type="button"
          onClick={onOpenPhotos}
          className="flex cursor-pointer items-start gap-3 border-t border-line pt-5 text-left"
        >
          <Icon name="images" className="text-brand" />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold">See every photo</span>
            <span className="text-xs text-muted">
              Open the full-screen viewer to explore all {pluralize(photoCount, 'photo')} in detail.
            </span>
          </span>
        </button>
      )}
    </Card>
  )
}
