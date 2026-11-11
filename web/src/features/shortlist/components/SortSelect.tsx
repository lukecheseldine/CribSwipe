import { useEffect, useRef, useState } from 'react'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { Icon } from '../../../components/ui/Icon'
import { cn } from '../../../lib/cn'
import { sortOptions } from '../sorting'
import type { SortOrder } from '../types'

type SortSelectProps = {
  value: SortOrder
  onChange: (order: SortOrder) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const current = sortOptions.find((option) => option.value === value) ?? sortOptions[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    rootRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
  }, [open])

  const moveFocus = (direction: 1 | -1) => {
    const items = [
      ...(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []),
    ]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    items[(index + direction + items.length) % items.length]?.focus()
  }

  const choose = (order: SortOrder) => {
    onChange(order)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Sort saved places, ${current.label}`}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className={buttonClasses('secondary')}
      >
        <Icon name="sortDescending" />
        {current.label}
        <Icon
          name="chevronDown"
          size={16}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Sort saved places"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              moveFocus(event.key === 'ArrowDown' ? 1 : -1)
            }
          }}
          className="absolute top-full right-0 z-10 mt-3 w-56 rounded-2xl border border-line bg-white p-1.5 shadow-card"
        >
          {sortOptions.map((option) => {
            const selected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => choose(option.value)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand',
                  selected
                    ? 'bg-brand-soft font-semibold text-brand'
                    : 'hover:bg-canvas focus-visible:bg-canvas'
                )}
              >
                {option.label}
                {selected && <Icon name="check" size={16} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
