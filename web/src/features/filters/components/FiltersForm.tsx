import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { pluralize } from '../../../lib/format'
import type { FilterOptions, ListingFilters } from '../../../types/filters'
import { bathroomChoices, bedroomChoices, priceBounds, sizeBounds } from '../bounds'
import { AmenityChips } from './AmenityChips'
import { FilterSection } from './FilterSection'
import { LocationField } from './LocationField'
import { MaxPriceSlider } from './MaxPriceSlider'
import { MoveInDateField } from './MoveInDateField'
import { OptionChips } from './OptionChips'
import { PetFriendlyToggle } from './PetFriendlyToggle'
import { MinSizeSlider } from './MinSizeSlider'

type FiltersFormProps = {
  draft: ListingFilters
  onChange: (patch: Partial<ListingFilters>) => void
  options: FilterOptions
  matchCount: number
  onSubmit: () => void
  submitLabel?: string
  footerNote?: string
}

const bedroomLabel = (count: number) => (count === 0 ? 'Studio' : String(count))

export function FiltersForm({
  draft,
  onChange,
  options,
  matchCount,
  onSubmit,
  submitLabel = `Apply filters · Show ${pluralize(matchCount, 'place')}`,
  footerNote = 'More of what you’re looking for.',
}: FiltersFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Card className="flex flex-col gap-7 p-8">
        <div className="grid grid-cols-2 gap-x-12">
          <div className="flex flex-col gap-7">
            <LocationField
              options={options.cities}
              selected={draft.cities}
              onChange={(cities) => onChange({ cities })}
            />
            <FilterSection title="Monthly rent">
              <MaxPriceSlider
                value={draft.maxPrice}
                bounds={priceBounds}
                onChange={(value) => onChange({ maxPrice: value })}
              />
            </FilterSection>
            <FilterSection title="Bedrooms">
              <OptionChips
                name="beds"
                options={bedroomChoices}
                selected={draft.bedrooms}
                onChange={(bedrooms) => onChange({ bedrooms })}
                formatLabel={bedroomLabel}
                showCounts={false}
              />
            </FilterSection>
            <FilterSection title="Bathrooms">
              <OptionChips
                name="baths"
                options={bathroomChoices}
                selected={draft.bathrooms}
                onChange={(bathrooms) => onChange({ bathrooms })}
                showCounts={false}
              />
            </FilterSection>
          </div>

          <div className="flex flex-col gap-7">
            <FilterSection title="Minimum size">
              <MinSizeSlider
                value={draft.minSqft}
                bounds={sizeBounds}
                onChange={(value) => onChange({ minSqft: value })}
              />
            </FilterSection>
            <MoveInDateField
              value={draft.moveInDate}
              onChange={(moveInDate) => onChange({ moveInDate })}
            />
            <PetFriendlyToggle
              checked={draft.petFriendly}
              onChange={(petFriendly) => onChange({ petFriendly })}
            />
            {options.propertyTypes.length > 0 && (
              <FilterSection title="Property type">
                <OptionChips
                  name="type"
                  options={options.propertyTypes}
                  selected={draft.propertyTypes}
                  onChange={(propertyTypes) => onChange({ propertyTypes })}
                />
              </FilterSection>
            )}
            <FilterSection title="The everyday extras">
              <AmenityChips
                selected={draft.amenities}
                onChange={(amenities) => onChange({ amenities })}
              />
            </FilterSection>
            <p className="text-xs text-muted">
              Move-in date, pet friendly, and extras are saved with your search but don&rsquo;t
              narrow results yet.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-6">
          <p className="text-label text-muted">{footerNote}</p>
          <Button type="submit" variant="primary" icon="arrowRight">
            {submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  )
}
