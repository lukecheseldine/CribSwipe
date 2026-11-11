import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { paths } from '../../app/paths'
import { useAccount } from '../../features/account'
import { cn } from '../../lib/cn'
import type { User } from '../../types/user'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'

type AccountMenuProps = {
  user: User | null
}

const guestLinks = [
  { to: paths.login, label: 'Log in' },
  { to: paths.signup, label: 'Sign up' },
]

export function AccountMenu({ user }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { signOut } = useAccount()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const items = user ? [{ to: paths.account, label: 'Settings' }] : guestLinks

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? `${user.name}, account menu` : 'Account menu'}
        onClick={() => setOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-2.5 text-label"
      >
        <Avatar name={user?.name} src={user?.photo} />
        {user?.name}
        <Icon name="chevronDown" size={16} className={cn(open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-10 mt-3 w-44 rounded-2xl border border-line bg-white p-1.5 shadow-card"
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3.5 py-2.5 text-sm hover:bg-canvas"
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                signOut()
                setOpen(false)
                navigate(paths.discover)
              }}
              className="block w-full rounded-xl px-3.5 py-2.5 text-left text-sm text-pass hover:bg-canvas"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  )
}
