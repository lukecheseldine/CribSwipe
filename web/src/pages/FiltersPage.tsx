import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams } from 'react-router'
import type { filtersLoader } from '../app/loaders'
import { discoverPath } from '../app/paths'
import { clearDefaultSkip, skipDefaultFilters } from '../features/account'
import { FiltersForm, FiltersHeader, useMatchCount } from '../features/filters'
import { countActiveFilters, emptyFilters, parseFilters } from '../lib/filters'
import type { ListingFilters } from '../types/filters'

export function FiltersPage() {
  const { options, count } = useLoaderData<typeof filtersLoader>()
  const [searchParams] = useSearchParams()
  const applied = parseFilters(searchParams)
  const [draft, setDraft] = useState(applied)
  const matchCount = useMatchCount(draft, count)
  const navigate = useNavigate()

  const update = (patch: Partial<ListingFilters>) =>
    setDraft((current) => ({ ...current, ...patch }))

  return (
    <div className="mx-auto flex max-w-270 flex-col gap-8">
      <FiltersHeader
        backTo={discoverPath(applied)}
        onReset={() => setDraft(emptyFilters)}
        canReset={countActiveFilters(draft) > 0}
      />
      <FiltersForm
        draft={draft}
        onChange={update}
        options={options}
        matchCount={matchCount}
        onSubmit={() => {
          if (countActiveFilters(draft) === 0) skipDefaultFilters()
          else clearDefaultSkip()
          navigate(discoverPath(draft))
        }}
      />
    </div>
  )
}

export function FiltersLoading() {
  return <p className="text-center text-sm text-muted">Loading filters&hellip;</p>
}

export function FiltersError() {
  return (
    <p className="text-center text-sm text-muted">
      We couldn&rsquo;t load filters. Try again in a moment.
    </p>
  )
}
