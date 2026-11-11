import { Outlet } from 'react-router'
import { AccountSidebar, useAccount } from '../features/account'

export function AccountPage() {
  const { profile, signOut } = useAccount()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl leading-heading">Make it yours.</h1>
        <p className="text-label text-muted">Settings</p>
      </header>
      <div className="grid grid-cols-[18rem_1fr] items-start gap-8">
        <AccountSidebar profile={profile} onSignOut={signOut} />
        <Outlet />
      </div>
    </div>
  )
}
