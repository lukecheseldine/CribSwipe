import { useLoaderData } from 'react-router'
import type { loginLoader } from '../app/loaders'
import { AuthSplit, LoginForm } from '../features/login'

export function LoginPage() {
  const photo = useLoaderData<typeof loginLoader>()
  return (
    <AuthSplit photo={photo}>
      <LoginForm />
    </AuthSplit>
  )
}
