import { isRouteErrorResponse, useLoaderData, useLocation, useRouteError } from 'react-router'
import type { listingLoader } from '../app/loaders'
import { paths, type ListingLinkState } from '../app/paths'
import { PhotoLightbox } from '../components/ui/PhotoLightbox'
import {
  ListingDescription,
  ListingGallery,
  ListingMessage,
  ListingOverview,
  ListingToolbar,
  RentCard,
} from '../features/listing-detail'
import { useShortlist } from '../features/shortlist'
import { usePhotoViewer } from '../hooks/usePhotoViewer'
import { useShare } from '../hooks/useShare'

const backLinks = {
  discover: { to: paths.discover, label: 'Back to discovery' },
  shortlist: { to: paths.shortlist, label: 'Back to shortlist' },
}

export function ListingPage() {
  const listing = useLoaderData<typeof listingLoader>()
  const linkState = useLocation().state as ListingLinkState | null
  const shortlist = useShortlist()
  const viewer = usePhotoViewer(listing.photos.length)
  const { share, copied } = useShare()

  const saved = shortlist.saved.some((item) => item.listing.id === listing.id)
  const toggleSaved = () => (saved ? shortlist.remove(listing.id) : shortlist.save(listing))

  return (
    <div className="flex flex-col gap-6">
      <ListingToolbar
        back={backLinks[linkState?.from ?? 'discover']}
        saved={saved}
        onToggleSaved={toggleSaved}
        onShare={() => share({ title: listing.title, url: window.location.href })}
        shareCopied={copied}
      />
      <ListingGallery listing={listing} onOpenPhoto={viewer.open} />
      <div className="grid grid-cols-[1fr_27rem] items-start gap-16">
        <div className="flex flex-col gap-8">
          <ListingOverview listing={listing} />
          <ListingDescription description={listing.description} />
        </div>
        <RentCard listing={listing} onOpenPhotos={() => viewer.open(0)} />
      </div>
      <PhotoLightbox
        open={viewer.isOpen}
        onClose={viewer.close}
        photos={listing.photos}
        carousel={viewer.carousel}
        title={listing.title}
      />
    </div>
  )
}

export function ListingLoading() {
  return <ListingMessage>Loading this apartment&hellip;</ListingMessage>
}

export function ListingError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <ListingMessage>
      {notFound
        ? 'This listing isn’t available anymore.'
        : 'We couldn’t load this listing. Try again in a moment.'}
    </ListingMessage>
  )
}
