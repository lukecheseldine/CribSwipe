import { useEffect, useEffectEvent } from 'react'

type Shortcuts = Partial<Record<KeyboardEvent['key'], () => void>>

export function useKeyboardShortcuts(shortcuts: Shortcuts, { enabled = true } = {}) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!enabled) return
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, select, [contenteditable]')) return
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
