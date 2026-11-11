import { NavLink, useNavigate } from 'react-router'
import { paths } from '../../../app/paths'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { Icon } from '../../../components/ui/Icon'
import type { IconName } from '../../../components/ui/icons'
import { Avatar } from '../../../components/ui/Avatar'
import { cn } from '../../../lib/cn'
import type { Profile } from '../types'

const sections: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: paths.account, label: 'Edit profile', icon: 'userRound', end: true },
  { to: `${paths.account}/filters`, label: 'Search filters', icon: 'slidersHorizontal' },
  { to: `${paths.account}/privacy`, label: 'Privacy & security', icon: 'shield' },
]

type AccountSidebarProps = {
  profile: Profile | null
  onSignOut: () => void | Promise<void>
}

export function AccountSidebar({ profile, onSignOut }: AccountSidebarProps) {
  const navigate = useNavigate()
  const contact = profile?.email || profile?.phone

  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-3xl bg-brand-soft p-4">
        <Avatar name={profile?.name} src={profile?.photo} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile?.name || 'Your account'}</p>
          {contact && <p className="truncate text-xs text-brand">{contact}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="px-3 text-xs font-medium tracking-wider text-muted uppercase">Account</p>
        <nav aria-label="Account settings" className="flex flex-col gap-1.5">
          {sections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm',
                  isActive ? 'bg-brand-soft font-medium text-brand' : 'hover:bg-white'
                )
              }
            >
              <Icon name={section.icon} size={18} />
              <span className="flex-1">{section.label}</span>
              <Icon name="chevronRight" size={16} className="text-muted" />
            </NavLink>
          ))}
        </nav>
      </div>

      {profile && (
        <button
          type="button"
          onClick={() => {
            void Promise.resolve(onSignOut()).then(() => navigate(paths.discover))
          }}
          className={buttonClasses('secondary', 'text-pass')}
        >
          <Icon name="logOut" />
          Sign out
        </button>
      )}

      <p className="px-1 text-xs leading-relaxed text-muted">
        Made for your next chapter
        <br />
        Version 1.0.0
      </p>
    </aside>
  )
}
