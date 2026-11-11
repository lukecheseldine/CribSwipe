import { cn } from '../../lib/cn'
import { pluralize } from '../../lib/format'
import type { Listing } from '../../types/listing'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/icons'

type ListingFactsProps = {
  listing: Listing
  className?: string
}

function getFacts({ bedrooms, bathrooms, sqft }: Listing) {
  const facts: { icon: IconName; label: string }[] = []
  if (bedrooms !== null) facts.push({ icon: 'bedDouble', label: pluralize(bedrooms, 'bedroom') })
  if (bathrooms !== null) facts.push({ icon: 'bath', label: pluralize(bathrooms, 'bathroom') })
  if (sqft !== null) facts.push({ icon: 'scan', label: `${sqft.toLocaleString('en-CA')} sq ft` })
  return facts
}

export function ListingFacts({ listing, className }: ListingFactsProps) {
  const facts = getFacts(listing)
  if (facts.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap gap-6 text-label text-muted', className)}>
      {facts.map(({ icon, label }) => (
        <li key={icon} className="flex items-center gap-1.75">
          <Icon name={icon} size={18} className="text-brand" />
          {label}
        </li>
      ))}
    </ul>
  )
}
