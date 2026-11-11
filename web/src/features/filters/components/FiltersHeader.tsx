import { ButtonLink } from '../../../components/ui/ButtonLink'

type FiltersHeaderProps = {
  backTo: string
  onReset: () => void
  canReset: boolean
}

export function FiltersHeader({ backTo, onReset, canReset }: FiltersHeaderProps) {
  return (
    <header className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <ButtonLink to={backTo} icon="arrowLeft">
          Back to discovery
        </ButtonLink>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          className="cursor-pointer text-label font-medium text-brand hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl leading-heading">Your kind of place.</h1>
        <p className="text-label text-muted">
          Keep the things that matter. We&rsquo;ll do the looking.
        </p>
      </div>
    </header>
  )
}
