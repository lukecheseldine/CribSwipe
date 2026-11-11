import type { Carousel } from '../../hooks/useCarousel'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { CarouselArrows } from './CarouselArrows'
import { Dialog } from './Dialog'
import { IconButton } from './IconButton'

type PhotoLightboxProps = {
  open: boolean
  onClose: () => void
  photos: string[]
  carousel: Carousel
  title: string
}

export function PhotoLightbox({ open, onClose, photos, carousel, title }: PhotoLightboxProps) {
  useKeyboardShortcuts(
    { ArrowLeft: carousel.previous, ArrowRight: carousel.next },
    { enabled: open, withinDialogs: true }
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      label={`${title} photos`}
      className="h-dvh w-dvw bg-ink backdrop:bg-transparent"
    >
      <img
        src={photos[carousel.index]}
        alt={`Photo ${carousel.index + 1} of ${title}`}
        className="absolute inset-0 m-auto max-h-[calc(100%-10rem)] max-w-[calc(100%-12rem)] object-contain"
      />
      <p className="absolute top-8 left-8 text-sm text-white">
        {carousel.index + 1} / {carousel.count}
      </p>
      <IconButton
        icon="x"
        label="Close full-screen"
        onClick={onClose}
        className="absolute top-6 right-6"
      />
      <CarouselArrows carousel={carousel} itemLabel="photo" />
    </Dialog>
  )
}
