import { Button } from '../../../components/ui/Button'

type DecisionControlsProps = {
  onPass: () => void
  onLike: () => void
}

export function DecisionControls({ onPass, onLike }: DecisionControlsProps) {
  return (
    <div className="flex flex-col gap-4 text-xs leading-normal text-muted">
      <p>Could this be your next chapter?</p>
      <div className="flex gap-3">
        <Button icon="x" variant="destructive" className="flex-1" onClick={onPass}>
          Pass
        </Button>
        <Button icon="heartWhite" variant="primary" className="flex-1" onClick={onLike}>
          Like
        </Button>
      </div>
      <p className="text-center">Swipe left to pass · right to like an apartment.</p>
    </div>
  )
}
