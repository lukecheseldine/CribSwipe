import type { Carousel } from '../../hooks/useCarousel'
import { IconButton } from './IconButton'

type CarouselArrowsProps = {
  carousel: Carousel
  itemLabel: string
}

export function CarouselArrows({ carousel, itemLabel }: CarouselArrowsProps) {
  if (!carousel.canNavigate) return null

  return (
    <>
      <IconButton
        icon="chevronLeft"
        label={`Previous ${itemLabel}`}
        onClick={carousel.previous}
        className="absolute top-1/2 left-6 -translate-y-1/2"
      />
      <IconButton
        icon="chevronRight"
        label={`Next ${itemLabel}`}
        onClick={carousel.next}
        className="absolute top-1/2 right-6 -translate-y-1/2"
      />
    </>
  )
}
