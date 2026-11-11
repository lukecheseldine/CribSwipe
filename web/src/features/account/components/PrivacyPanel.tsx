import { Link } from 'react-router'
import { paths } from '../../../app/paths'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'

export function PrivacyPanel() {
  return (
    <Card as="section" aria-label="Privacy and security" className="flex flex-col gap-5 p-8">
      <div className="flex flex-col gap-2">
        <p className="text-label font-medium text-brand">Privacy & security</p>
        <h2 className="text-3xl leading-heading">Kept to yourself.</h2>
      </div>
      <p className="flex items-start gap-2 text-sm text-muted">
        <Icon name="lock" size={16} className="mt-0.5 text-brand" />
        Your name, email, and phone number stay on this device and are never shown on a listing.
      </p>
      <p className="text-sm text-muted">
        Password changes and texted verification codes will be available once accounts are
        connected. Read the{' '}
        <Link to={paths.privacy} className="font-medium text-brand hover:underline">
          privacy policy
        </Link>
        .
      </p>
    </Card>
  )
}
