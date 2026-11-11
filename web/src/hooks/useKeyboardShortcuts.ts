import { useEffect, useEffectEvent } from 'react'

type Shortcuts = Partial<Record<KeyboardEvent['key'], () => void>>

type Options = {
  enabled?: boolean
  /** Page-level shortcuts stay quiet while focus is inside a dialog unless this is set. */
  withinDialogs?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: Shortcuts,
  { enabled = true, withinDialogs = false }: Options = {}
) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled) return
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, select, [contenteditable]')) return
    if (!withinDialogs && target?.closest('dialog')) return
    const shortcut = shortcuts[event.key]
    if (!shortcut) return
    event.preventDefault()
    shortcut()
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
