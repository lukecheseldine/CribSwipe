import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'

export type SwipeDirection = 'left' | 'right'

type UseSwipeOptions = {
  onSwipe: (direction: SwipeDirection) => void
  thresholdPx?: number
  exitDurationMs?: number
}

export function useSwipe({ onSwipe, thresholdPx = 120, exitDurationMs = 250 }: UseSwipeOptions) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null)
  const dragStartX = useRef(0)

  const notifySwipe = useEffectEvent(onSwipe)

  useEffect(() => {
    if (!exitDirection) return
    const timer = window.setTimeout(() => notifySwipe(exitDirection), exitDurationMs)
    return () => window.clearTimeout(timer)
  }, [exitDirection, exitDurationMs])

  const swipe = (direction: SwipeDirection) => {
    if (!exitDirection) setExitDirection(direction)
  }

  const endDrag = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (Math.abs(dragX) >= thresholdPx) swipe(dragX < 0 ? 'left' : 'right')
    else setDragX(0)
  }

  const handlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (exitDirection || (event.target as HTMLElement).closest('button, a')) return
      dragStartX.current = event.clientX
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isDragging) setDragX(event.clientX - dragStartX.current)
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }

  const offsetX = exitDirection ? (exitDirection === 'right' ? 1 : -1) * window.innerWidth : dragX
  const style: CSSProperties = {
    transform: `translateX(${offsetX}px) rotate(${offsetX / 40}deg)`,
    transition: isDragging ? 'none' : `transform ${exitDurationMs}ms ease-out`,
  }

  return { swipe, handlers, style }
}
