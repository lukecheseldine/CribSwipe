import { useState } from 'react'

export function useCarousel(count: number) {
  const [index, setIndex] = useState(0)
  const canNavigate = count > 1

  const step = (delta: number) => {
    if (canNavigate) setIndex((current) => (current + delta + count) % count)
  }

  return {
    index,
    count,
    canNavigate,
    nextIndex: canNavigate ? (index + 1) % count : index,
    next: () => step(1),
    previous: () => step(-1),
    goTo: (target: number) => setIndex(Math.min(Math.max(target, 0), Math.max(count - 1, 0))),
  }
}

export type Carousel = ReturnType<typeof useCarousel>
