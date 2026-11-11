import { useState } from 'react'
import { useCarousel } from './useCarousel'

/** A photo carousel plus the open/closed state of its full-screen viewer. */
export function usePhotoViewer(photoCount: number) {
  const carousel = useCarousel(photoCount)
  const [isOpen, setIsOpen] = useState(false)

  const open = (index = carousel.index) => {
    carousel.goTo(index)
    setIsOpen(true)
  }

  return { carousel, isOpen, open, close: () => setIsOpen(false) }
}
