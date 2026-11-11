import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError, signup } from '../../../api/account'
import { paths } from '../../../app/paths'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { Icon } from '../../../components/ui/Icon'
import { identifierIcon, isAccountIdentifier } from '../identifier'
import { passwordError } from '../password'
import { AuthField } from './AuthField'
import { ContinueWith } from './ContinueWith'
import { FormNotice } from './FormNotice'
import { PasswordField } from './PasswordField'

const unavailable = 'This isn’t connected yet.'

export function SignupForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; identifier?: string; password?: string }>(
    {}
  )
  const [notice, setNotice] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (name.trim().split(/\s+/).length < 2) next.name = 'Enter your first and last name.'
    if (!identifier.trim()) next.identifier = 'Enter your email or mobile number.'
    else if (!isAccountIdentifier(identifier)) {
      next.identifier = 'Enter a valid email or mobile number.'
    }
    const passwordMessage = passwordError(password, { required: 'Create a password.' })
    if (passwordMessage) next.password = passwordMessage
    setErrors(next)
    if (Object.keys(next).length > 0) {
      setNotice(null)
      return
    }
    try {
      await signup({ name, identifier, password })
      navigate(paths.discover)
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : 'Something went wrong. Try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="mb-1 flex flex-col gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon name="house" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl leading-heading">A place to begin.</h1>
          <p className="text-sm text-muted">Create an account. Find a home that feels like you.</p>
        </div>
      </div>

      <AuthField
        id="name"
        label="Full name"
        autoComplete="name"
        placeholder="Your first and last name"
        value={name}
        error={errors.name}
        onChange={(event) => setName(event.target.value)}
      />

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
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          error={errors.password}
          onChange={setPassword}
        />
        {!errors.password && (
          <p className="text-xs text-muted">Use at least 8 characters, including a number.</p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted">
        By signing up, you agree to our <LegalLink to={paths.terms}>Terms of service</LegalLink> and{' '}
        <LegalLink to={paths.privacy}>Privacy policy</LegalLink>.
      </p>

      <button type="submit" className={buttonClasses('primary', 'w-full')}>
        <Icon name="arrowRight" />
        Create account
      </button>
      {notice && <FormNotice>{notice}</FormNotice>}

      <ContinueWith onUnavailable={() => setNotice(unavailable)} />

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to={paths.login} className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}

function LegalLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="font-medium text-brand hover:underline">
      {children}
    </Link>
  )
}
