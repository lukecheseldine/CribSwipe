import type { IconName } from '../../../assets/icons'
import { Icon } from '../../../components/ui/Icon'
import { pluralize } from '../../../lib/format'
import type { Listing } from '../../../types/listing'

type ListingFactsProps = {
  listing: Listing
}

function getFacts({ bedrooms, bathrooms, sqft }: Listing) {
  const facts: { icon: IconName; label: string }[] = []
  if (bedrooms !== null) facts.push({ icon: 'bedDouble', label: pluralize(bedrooms, 'bedroom') })
  if (bathrooms !== null) facts.push({ icon: 'bath', label: pluralize(bathrooms, 'bathroom') })
  if (sqft !== null) facts.push({ icon: 'scan', label: `${sqft.toLocaleString('en-CA')} sq ft` })
  return facts
}

export function ListingFacts({ listing }: ListingFactsProps) {
  const facts = getFacts(listing)
  if (facts.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-6 text-label text-muted">
      {facts.map(({ icon, label }) => (
        <li key={icon} className="flex items-center gap-1.75">
          <Icon name={icon} />
          {label}
        </li>
      ))}
    </ul>
  )
}
