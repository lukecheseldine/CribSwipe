import { useLoaderData } from 'react-router'
import type { loginLoader } from '../app/loaders'
import { AuthSplit, SignupForm } from '../features/login'

export function SignupPage() {
  const photo = useLoaderData<typeof loginLoader>()
  return (
    <AuthSplit photo={photo}>
      <SignupForm />
    </AuthSplit>
  )
}
