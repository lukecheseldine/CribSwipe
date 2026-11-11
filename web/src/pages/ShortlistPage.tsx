import { useState } from 'react'
import {
  ShortlistCard,
  ShortlistEmpty,
  ShortlistFooter,
  ShortlistHeader,
  ShortlistToolbar,
  sortSavedListings,
  useShortlist,
  type SortOrder,
} from '../features/shortlist'

export function ShortlistPage() {
  const { saved, remove } = useShortlist()
  const [order, setOrder] = useState<SortOrder>('newest')

  return (
    <div className="flex flex-col gap-8">
      <ShortlistHeader count={saved.length} />

      {saved.length === 0 ? (
        <ShortlistEmpty />
      ) : (
        <section aria-label="Saved places" className="flex flex-col gap-6">
          <ShortlistToolbar count={saved.length} order={order} onOrderChange={setOrder} />
          <ul className="grid grid-cols-2 gap-8">
            {sortSavedListings(saved, order).map(({ listing }) => (
              <li key={listing.id}>
                <ShortlistCard listing={listing} onRemove={() => remove(listing.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ShortlistFooter />
    </div>
  )
}
