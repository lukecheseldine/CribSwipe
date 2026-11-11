import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AuthField } from './AuthField'

type PasswordFieldProps = {
  id?: string
  label?: string
  placeholder: string
  autoComplete: 'current-password' | 'new-password'
  value: string
  error?: string
  onChange: (value: string) => void
}

export function PasswordField({
  id = 'password',
  label = 'Password',
  placeholder,
  autoComplete,
  value,
  error,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <AuthField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      error={error}
      onChange={(event) => onChange(event.target.value)}
      trailing={
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="cursor-pointer text-muted"
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
        </button>
      }
    />
  )
}
