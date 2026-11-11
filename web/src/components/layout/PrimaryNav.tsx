import { NavLink, useLocation } from 'react-router'
import { paths } from '../../app/paths'
import { cn } from '../../lib/cn'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/icons'

type NavItem = {
  to: string
  label: string
  icon: IconName
  /** Other pages that belong to this section. */
  alsoActiveOn?: string[]
  /** False when child routes, such as account settings, should keep this item highlighted. */
  end?: boolean
}

const navItems: NavItem[] = [
  { to: paths.discover, label: 'Discover', icon: 'layers', alsoActiveOn: [paths.filters] },
  { to: paths.shortlist, label: 'Your shortlist', icon: 'heart' },
  { to: paths.account, label: 'Account', icon: 'userRound', end: false },
]

export function PrimaryNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Primary" className="flex gap-2">
      {navItems.map(({ to, label, icon, alsoActiveOn = [], end = true }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-full px-4.5 py-3 text-sm transition-colors',
              isActive || alsoActiveOn.includes(pathname)
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
