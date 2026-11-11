import { Outlet } from 'react-router'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const user = useCurrentUser()

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="px-16 py-9">
        <Outlet />
      </main>
    </div>
  )
}
