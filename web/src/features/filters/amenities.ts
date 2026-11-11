import type { IconName } from '../../components/ui/icons'

// Fixed for now; replace with values from the data once the scraper collects amenities.
export const amenities: { value: string; label: string; icon: IconName }[] = [
  { value: 'laundry', label: 'In-unit laundry', icon: 'washingMachine' },
  { value: 'dishwasher', label: 'Dishwasher', icon: 'utensils' },
  { value: 'elevator', label: 'Elevator', icon: 'arrowUpDown' },
  { value: 'outdoor', label: 'Outdoor space', icon: 'trees' },
  { value: 'parking', label: 'Parking', icon: 'car' },
  { value: 'gym', label: 'Gym', icon: 'dumbbell' },
]
