import { Link } from 'react-router'
import { ButtonLink } from '../../../components/ui/ButtonLink'
import { Icon } from '../../../components/ui/Icon'

type DiscoverHeaderProps = {
  location: string
  /** The filters page, carrying the current filters so it opens with them. */
  filtersHref: string
  activeFilterCount?: number
}

export function DiscoverHeader({
  location,
  filtersHref,
  activeFilterCount = 0,
}: DiscoverHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Link
          to={filtersHref}
          aria-label={`Location: ${location}. Change location`}
          className="flex items-center gap-1.5 self-start text-label text-muted"
        >
          <Icon name="mapPin" size={16} className="text-brand" />
          {location}
          <Icon name="chevronDown" size={14} className="text-ink" />
        </Link>
        <h1 className="text-4xl leading-heading">Find your place.</h1>
      </div>
      <ButtonLink to={filtersHref} icon="slidersHorizontal">
        {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}
      </ButtonLink>
    </div>
  )
}
