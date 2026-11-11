import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'

type DiscoverHeaderProps = {
  location: string
  activeFilterCount?: number
  /** Omit while filters can't be used (loading or error states). */
  onOpenFilters?: () => void
}

export function DiscoverHeader({
  location,
  activeFilterCount = 0,
  onOpenFilters,
}: DiscoverHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`Location: ${location}. Change location`}
          onClick={onOpenFilters}
          disabled={!onOpenFilters}
          className="flex cursor-pointer items-center gap-1.5 self-start text-label text-muted disabled:cursor-default"
        >
          <Icon name="mapPin" size={16} className="text-brand" />
          {location}
          <Icon name="chevronDown" size={14} className="text-ink" />
        </button>
        <h1 className="text-4xl leading-heading">Find your place.</h1>
      </div>
      <Button
        icon="slidersHorizontal"
        aria-haspopup="dialog"
        onClick={onOpenFilters}
        disabled={!onOpenFilters}
      >
        {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}
      </Button>
    </div>
  )
}
