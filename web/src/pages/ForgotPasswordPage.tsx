import { AuthNotice } from '../features/login'

export function ForgotPasswordPage() {
  return (
    <AuthNotice title="Forget password?">
      Password reset isn&rsquo;t available yet. It will use the same email or mobile number you log
      in with.
    </AuthNotice>
  )
}
