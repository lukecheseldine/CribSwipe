import { useSyncExternalStore } from 'react'
import { shortlistStore } from '../shortlistStore'

export function useShortlist() {
  const saved = useSyncExternalStore(shortlistStore.subscribe, shortlistStore.getSnapshot)
  return { saved, save: shortlistStore.save, remove: shortlistStore.remove }
}
