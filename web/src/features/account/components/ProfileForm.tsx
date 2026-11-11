import { useRef, useState, type FormEvent } from 'react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Avatar } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import { fieldClasses } from '../../../components/ui/fieldStyles'
import { cn } from '../../../lib/cn'
import { isEmail, isMobileNumber } from '../../../lib/identifier'
import type { Profile } from '../types'

const maxPhotoCharacters = 400_000

type ProfileFormProps = {
  profile: Profile | null
  onSave: (profile: Profile) => void
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(profile?.name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [photo, setPhoto] = useState<string | null>(profile?.photo ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const onPhoto = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (!result || result.length > maxPhotoCharacters) {
        setError('Choose a smaller photo.')
        return
      }
      setPhoto(result)
      setError(null)
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim().split(/\s+/).filter(Boolean).length < 2) {
      setError('Enter your first and last name.')
      setSaved(false)
      return
    }
    if (email.trim() && !isEmail(email)) {
      setError('Enter a valid email address.')
      setSaved(false)
      return
    }
    if (phone.trim() && !isMobileNumber(phone)) {
      setError('Enter a valid mobile number.')
      setSaved(false)
      return
    }
    if (!email.trim() && !phone.trim()) {
      setError('Add an email or a mobile number.')
      setSaved(false)
      return
    }
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), photo })
    setError(null)
    setSaved(true)
  }

  return (
    <Card as="section" aria-label="Edit profile" className="flex flex-col gap-7 p-8">
      <div className="flex flex-col gap-2">
        <p className="text-label font-medium text-brand">Edit profile</p>
        <h2 className="text-3xl leading-heading">A little about you.</h2>
        <p className="text-sm text-muted">Give your next chapter a familiar face.</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="relative">
          <Avatar name={name} src={photo} size="lg" />
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-brand text-white">
            <Icon name="camera" size={14} />
          </span>
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="h-11 cursor-pointer rounded-full border border-line bg-white px-4 text-sm font-medium hover:bg-canvas"
        >
          Change photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => onPhoto(event.target.files?.[0])}
        />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <h3 className="border-t border-line pt-6 text-base font-semibold">
          Personal & contact information
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <Field
            id="profile-name"
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={setName}
            className="col-span-2"
          />
          <Field
            id="profile-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            icon="mail"
          />
          <Field
            id="profile-phone"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={setPhone}
            icon="phone"
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
          <p className="flex items-center gap-2 text-xs text-muted">
            <Icon name="lock" size={14} />
            Your contact details are never shown publicly.
          </p>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </div>
        {error && <p className="text-xs text-pass">{error}</p>}
        {saved && (
          <p role="status" className="text-xs text-brand">
            Saved on this device. It will move to your account once sign-in is connected.
          </p>
        )}
      </form>
    </Card>
  )
}

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  icon?: 'mail' | 'phone'
  className?: string
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  icon,
  className,
}: FieldProps) {
  return (
    <label htmlFor={id} className={cn('flex flex-col gap-2 text-sm font-medium', className)}>
      {label}
      <span className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClasses(icon ? 'pr-12' : undefined)}
        />
        {icon && (
          <Icon
            name={icon}
            size={18}
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
          />
        )}
      </span>
    </label>
  )
}
