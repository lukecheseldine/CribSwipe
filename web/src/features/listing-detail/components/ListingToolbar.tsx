import { Button } from '../../../components/ui/Button'
import { ButtonLink } from '../../../components/ui/ButtonLink'

type ListingToolbarProps = {
  back: { to: string; label: string }
  saved: boolean
  onToggleSaved: () => void
  onShare: () => void
  shareCopied: boolean
}

export function ListingToolbar({
  back,
  saved,
  onToggleSaved,
  onShare,
  shareCopied,
}: ListingToolbarProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
      <ButtonLink to={back.to} icon="arrowLeft" className="justify-self-start">
        {back.label}
      </ButtonLink>
      <p className="text-label">Your next chapter</p>
      <div className="flex gap-3 justify-self-end">
        <Button icon="share" onClick={onShare}>
          {shareCopied ? 'Link copied' : 'Share'}
        </Button>
        <Button
          icon="heart"
          variant={saved ? 'primary' : 'secondary'}
          aria-pressed={saved}
          onClick={onToggleSaved}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
