import { ChoiceChip } from '../../../components/ui/ChoiceChip'
import { Icon } from '../../../components/ui/Icon'
import { toggleValue } from '../../../lib/filters'
import { amenities } from '../amenities'

type AmenityChipsProps = {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function AmenityChips({ selected, onChange }: AmenityChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <ChoiceChip
          key={amenity.value}
          type="checkbox"
          name="amenity"
          value={amenity.value}
          checked={selected.includes(amenity.value)}
          onChange={() => onChange(toggleValue(selected, amenity.value))}
        >
          <Icon name={amenity.icon} size={16} />
          {amenity.label}
        </ChoiceChip>
      ))}
    </div>
  )
}
