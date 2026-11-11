import type { User } from '../../types/user'
import { AccountMenu } from './AccountMenu'
import { BrandLogo } from './BrandLogo'
import { PrimaryNav } from './PrimaryNav'

type AppHeaderProps = {
  user: User | null
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex h-22 items-center justify-between border-b border-line bg-white px-16">
      <BrandLogo />
      <PrimaryNav />
      <AccountMenu user={user} />
    </header>
  )
}
