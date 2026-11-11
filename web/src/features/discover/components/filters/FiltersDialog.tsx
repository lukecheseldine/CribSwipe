import { useState } from 'react'
import { Button } from '../../../../components/ui/Button'
import { Dialog } from '../../../../components/ui/Dialog'
import { IconButton } from '../../../../components/ui/IconButton'
import { countActiveFilters, emptyFilters } from '../../../../lib/filters'
import type { FilterOptions, ListingFilters } from '../../../../types/filters'
import { FilterSection } from './FilterSection'
import { MaxPriceSlider } from './MaxPriceSlider'
import { OptionChips } from './OptionChips'

type FiltersDialogProps = {
  open: boolean
  onClose: () => void
  filters: ListingFilters
  options: FilterOptions
  onApply: (filters: ListingFilters) => void
}

export function FiltersDialog({ open, onClose, ...formProps }: FiltersDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Filters"
      className="ml-auto h-dvh w-120 bg-white backdrop:bg-ink/30"
    >
      <FiltersForm onClose={onClose} {...formProps} />
    </Dialog>
  )
}

const toggleValue = <T,>(values: T[], value: T) =>
  values.includes(value) ? values.filter((v) => v !== value) : [...values, value]

const bedroomLabel = (count: number) => (count === 0 ? 'Studio' : String(count))

// Mounted only while the dialog is open, so each opening starts from the applied filters.
function FiltersForm({ filters, options, onApply, onClose }: Omit<FiltersDialogProps, 'open'>) {
  const [draft, setDraft] = useState(filters)
  const update = (patch: Partial<ListingFilters>) =>
    setDraft((current) => ({ ...current, ...patch }))
  const { minPrice, maxPrice } = options

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        onApply(draft)
      }}
    >
      <header className="flex items-center justify-between border-b border-line px-8 py-6">
        <h2 className="text-2xl leading-heading">Filters</h2>
        <IconButton icon="x" label="Close filters" onClick={onClose} />
      </header>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-7">
        {minPrice !== null && maxPrice !== null && (
          <FilterSection title="Monthly rent">
            <MaxPriceSlider
              value={draft.maxPrice}
              bounds={{ min: minPrice, max: maxPrice }}
              onChange={(value) => update({ maxPrice: value })}
            />
          </FilterSection>
        )}
        {options.bedrooms.length > 0 && (
          <FilterSection title="Bedrooms">
            <OptionChips
              name="beds"
              options={options.bedrooms}
              selected={draft.bedrooms}
              onToggle={(value) => update({ bedrooms: toggleValue(draft.bedrooms, value) })}
              formatLabel={bedroomLabel}
              showCounts={false}
            />
          </FilterSection>
        )}
        {options.bathrooms.length > 0 && (
          <FilterSection title="Bathrooms">
            <OptionChips
              name="baths"
              options={options.bathrooms}
              selected={draft.bathrooms}
              onToggle={(value) => update({ bathrooms: toggleValue(draft.bathrooms, value) })}
              showCounts={false}
            />
          </FilterSection>
        )}
        {options.propertyTypes.length > 0 && (
          <FilterSection title="Property type">
            <OptionChips
              name="type"
              options={options.propertyTypes}
              selected={draft.propertyTypes}
              onToggle={(value) =>
                update({ propertyTypes: toggleValue(draft.propertyTypes, value) })
              }
            />
          </FilterSection>
        )}
        {options.cities.length > 0 && (
          <FilterSection title="Location">
            <OptionChips
              name="city"
              options={options.cities}
              selected={draft.cities}
              onToggle={(value) => update({ cities: toggleValue(draft.cities, value) })}
            />
          </FilterSection>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-line px-8 py-5">
        <button
          type="button"
          onClick={() => setDraft(emptyFilters)}
          disabled={countActiveFilters(draft) === 0}
          className="cursor-pointer text-label text-brand hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
        >
          Clear all
        </button>
        <Button type="submit" variant="primary">
          Show results
        </Button>
      </footer>
    </form>
  )
}
