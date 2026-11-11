import { ListingImage } from '../../../components/listing/ListingImage'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../lib/cn'
import { pluralize } from '../../../lib/format'
import type { Listing } from '../../../types/listing'

const THUMBNAIL_COUNT = 2

type ListingGalleryProps = {
  listing: Listing
  onOpenPhoto: (index: number) => void
}

export function ListingGallery({ listing, onOpenPhoto }: ListingGalleryProps) {
  const { photos, title } = listing
  const [cover, ...rest] = photos
  const thumbnails = rest.slice(0, THUMBNAIL_COUNT)

  if (!cover) {
    return (
      <div className="relative h-103 rounded-3xl border border-line bg-white">
        <ListingImage src={undefined} alt="" />
      </div>
    )
  }

  return (
    <div
      className={cn('grid h-103 grid-rows-2 gap-4', thumbnails.length > 0 && 'grid-cols-[2fr_1fr]')}
    >
      <div className="relative row-span-2 overflow-hidden rounded-3xl bg-canvas">
        <GalleryPhoto
          src={cover}
          label={`Open photo 1 of ${title}`}
          onClick={() => onOpenPhoto(0)}
        />
        <Button
          icon="maximize"
          onClick={() => onOpenPhoto(0)}
          className="absolute right-6 bottom-6"
        >
          Full-screen · {pluralize(photos.length, 'photo')}
        </Button>
      </div>
      {thumbnails.map((src, offset) => (
        <div
          key={src}
          className={cn(
            'relative overflow-hidden rounded-3xl bg-canvas',
            thumbnails.length === 1 && 'row-span-2'
          )}
        >
          <GalleryPhoto
            src={src}
            label={`Open photo ${offset + 2} of ${title}`}
            onClick={() => onOpenPhoto(offset + 1)}
          />
        </div>
      ))}
    </div>
  )
}

type GalleryPhotoProps = {
  src: string
  label: string
  onClick: () => void
}

function GalleryPhoto({ src, label, onClick }: GalleryPhotoProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute inset-0 cursor-zoom-in transition-opacity hover:opacity-95"
    >
      <ListingImage src={src} alt="" />
    </button>
  )
}
