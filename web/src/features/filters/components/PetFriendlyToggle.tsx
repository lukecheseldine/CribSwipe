import { Icon } from '../../../components/ui/Icon'
import { Switch } from '../../../components/ui/Switch'

type PetFriendlyToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function PetFriendlyToggle({ checked, onChange }: PetFriendlyToggleProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-canvas p-5">
      <Icon name="pawPrint" className="text-brand" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium">Pet friendly</p>
        <p className="text-xs text-muted">A home for your best friend, too.</p>
      </div>
      <Switch checked={checked} onChange={onChange} label="Pet friendly" />
    </div>
  )
}
