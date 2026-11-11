import { Link, Outlet } from 'react-router'
import { paths } from '../app/paths'
import { signOutSession } from '../app/session'
import { ButtonLink } from '../components/ui/ButtonLink'
import { AccountSidebar, useAccount } from '../features/account'

export function AccountPage() {
  const { signedIn, profile } = useAccount()

  if (!signedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 py-16 text-center">
        <h1 className="text-4xl leading-heading">Make it yours.</h1>
        <p className="text-sm text-muted">Log in to save your profile and default search.</p>
        <div className="flex justify-center gap-3">
          <ButtonLink to={paths.login} variant="primary">
            Log in
          </ButtonLink>
          <ButtonLink to={paths.signup}>Sign up</ButtonLink>
        </div>
        <Link to={paths.discover} className="text-sm text-brand hover:underline">
          Back to Discover
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl leading-heading">Make it yours.</h1>
        <p className="text-label text-muted">Settings</p>
      </header>
      <div className="grid grid-cols-[18rem_1fr] items-start gap-8">
        <AccountSidebar profile={profile} onSignOut={signOutSession} />
        <Outlet />
      </div>
    </div>
  )
}
