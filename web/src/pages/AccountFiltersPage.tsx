import { useState } from 'react'
import { useRouteLoaderData } from 'react-router'
import { useAccount } from '../features/account'
import { FiltersForm, useMatchCount } from '../features/filters'
import type { FilterOptions, ListingFilters } from '../types/filters'

export function AccountFiltersPage() {
  const { defaultFilters, saveDefaultFilters } = useAccount()
  const options = useRouteLoaderData('account') as FilterOptions | undefined
  const [draft, setDraft] = useState(defaultFilters)
  const [saved, setSaved] = useState(false)
  const matchCount = useMatchCount(draft, 0)

  if (!options) return null

  const update = (patch: Partial<ListingFilters>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setSaved(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <FiltersForm
        draft={draft}
        options={options}
        matchCount={matchCount}
        onChange={update}
        onSubmit={() => {
          saveDefaultFilters(draft)
          setSaved(true)
        }}
        submitLabel="Save default filters"
        footerNote="Discover starts from these the next time you open it."
      />
      {saved && (
        <p role="status" className="text-xs text-brand">
          Saved. Your next visit to Discover uses this search.
        </p>
      )}
    </div>
  )
}
