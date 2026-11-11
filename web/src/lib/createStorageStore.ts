type StorageStoreOptions<T> = {
  key: string
  fallback: T
  isValid: (value: unknown) => value is T
  storage?: () => Storage
}

/**
 * A JSON value kept in Web Storage, shaped for `useSyncExternalStore`.
 * Changes made in other tabs arrive through the `storage` event (localStorage only).
 */
export function createStorageStore<T>({
  key,
  fallback,
  isValid,
  storage = () => localStorage,
}: StorageStoreOptions<T>) {
  const listeners = new Set<() => void>()
  let snapshot: T | undefined

  function read(): T {
    try {
      const raw = storage().getItem(key)
      const parsed: unknown = raw === null ? fallback : JSON.parse(raw)
      return isValid(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }

  function getSnapshot() {
    snapshot ??= read()
    return snapshot
  }

  function set(update: (current: T) => T) {
    const current = getSnapshot()
    const next = update(current)
    if (next === current) return
    snapshot = next
    try {
      storage().setItem(key, JSON.stringify(next))
    } catch {
      // Storage can be full or disabled; the value still lives for this page load.
    }
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      snapshot = undefined
      listener()
    }
    listeners.add(listener)
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  }

  return { getSnapshot, subscribe, set }
}
