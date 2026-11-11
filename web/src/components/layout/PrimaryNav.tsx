import { NavLink } from 'react-router'
import { paths } from '../../app/paths'
import { cn } from '../../lib/cn'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/icons'

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: paths.discover, label: 'Discover', icon: 'layers' },
  { to: paths.shortlist, label: 'Your shortlist', icon: 'heart' },
  { to: paths.account, label: 'Account', icon: 'userRound' },
]

export function PrimaryNav() {
  return (
    <nav aria-label="Primary" className="flex gap-2">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-full px-4.5 py-3 text-sm transition-colors',
              isActive
                ? 'bg-brand-soft font-semibold text-brand'
                : 'bg-white text-muted hover:bg-canvas'
            )
          }
        >
          <Icon name={icon} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
