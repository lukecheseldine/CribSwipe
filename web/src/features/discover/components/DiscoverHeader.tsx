import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'

type DiscoverHeaderProps = {
  location: string
}

export function DiscoverHeader({ location }: DiscoverHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-haspopup="listbox"
          className="flex cursor-pointer items-center gap-1.5 text-label text-muted"
        >
          <Icon name="mapPin" />
          {location}
          <Icon name="chevronDownSm" />
        </button>
        <h1 className="text-4xl leading-heading">Find your place.</h1>
      </div>
      <Button icon="slidersHorizontal">Filters</Button>
    </div>
  )
}
