import type { User } from '../../types/user'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'

type AccountMenuProps = {
  user: User | null
}

export function AccountMenu({ user }: AccountMenuProps) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-label={user ? undefined : 'Account menu'}
      className="flex cursor-pointer items-center gap-2.5 text-label"
    >
      <Avatar name={user?.name} />
      {user?.name}
      <Icon name="chevronDown" size={16} />
    </button>
  )
}
