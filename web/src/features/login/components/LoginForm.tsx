import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError, login } from '../../../api/account'
import { paths } from '../../../app/paths'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { Icon } from '../../../components/ui/Icon'
import { identifierIcon, isAccountIdentifier } from '../identifier'
import { AuthField } from './AuthField'
import { ContinueWith } from './ContinueWith'
import { FormNotice } from './FormNotice'
import { PasswordField } from './PasswordField'

const unavailable = 'This isn’t connected yet.'

export function LoginForm() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})
  const [notice, setNotice] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (!identifier.trim()) next.identifier = 'Enter your email or mobile number.'
    else if (!isAccountIdentifier(identifier)) {
      next.identifier = 'Enter a valid email or mobile number.'
    }
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      setNotice(null)
      return
    }
    try {
      await login({ identifier, password })
      navigate(paths.discover)
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'Something went wrong. Try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="mb-2 flex flex-col gap-2">
        <h1 className="text-4xl leading-heading">Welcome home.</h1>
        <p className="text-sm text-muted">Your next chapter is just a swipe away.</p>
      </div>

      <AuthField
        id="identifier"
        label="Email or mobile number"
        type="text"
        autoComplete="username"
        placeholder="you@example.com or 604 555 0134"
        value={identifier}
        error={errors.identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        trailing={<Icon name={identifierIcon(identifier)} size={18} className="text-muted" />}
      />

      <div className="flex flex-col gap-2">
        <PasswordField
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          error={errors.password}
          onChange={setPassword}
        />
        <Link
          to={paths.forgotPassword}
          className="self-end text-label font-medium text-brand hover:underline"
        >
          Forget password?
        </Link>
      </div>

      <button type="submit" className={buttonClasses('primary', 'w-full')}>
        <Icon name="arrowRight" />
        Log in
      </button>
      {notice && <FormNotice>{notice}</FormNotice>}

      <ContinueWith onUnavailable={() => setNotice(unavailable)} />

      <p className="text-center text-sm text-muted">
        New around here?{' '}
        <Link to={paths.signup} className="font-semibold text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
