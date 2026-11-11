import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type DialogProps = {
  open: boolean
  onClose: () => void
  label: string
  className?: string
  children: ReactNode
}

export function Dialog({ open, onClose, label, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={closeOnBackdropClick}
      className={cn('m-0 max-h-none max-w-none border-0 p-0', className)}
    >
      {open && children}
    </dialog>
  )
}
