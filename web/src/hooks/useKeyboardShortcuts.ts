import { useEffect, useEffectEvent } from 'react'

type Shortcuts = Partial<Record<KeyboardEvent['key'], () => void>>

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, select, [contenteditable]')) return
    shortcuts[event.key]?.()
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
