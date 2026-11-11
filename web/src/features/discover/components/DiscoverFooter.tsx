import { IconButton } from '../../../components/ui/IconButton'

type DiscoverFooterProps = {
  canUndo: boolean
  onUndo: () => void
}

export function DiscoverFooter({ canUndo, onUndo }: DiscoverFooterProps) {
  return (
    <div className="flex items-center justify-between text-xs text-muted">
      <div className="flex items-center gap-2.5">
        <IconButton icon="undo" label="Undo last pass" disabled={!canUndo} onClick={onUndo} />
        <span aria-hidden>Undo last pass</span>
      </div>
      <p className="leading-normal">
        Want a closer look? Open Full-screen to browse listing photos.
      </p>
    </div>
  )
}
