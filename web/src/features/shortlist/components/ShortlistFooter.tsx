import { Icon } from '../../../components/ui/Icon'

export function ShortlistFooter() {
  return (
    <footer className="flex items-center justify-center gap-2 text-xs text-muted">
      <Icon name="heart" size={16} className="text-brand" />
      Good things are worth coming back to.
    </footer>
  )
}
