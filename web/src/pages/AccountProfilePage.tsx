import { ProfileForm, useAccount } from '../features/account'

export function AccountProfilePage() {
  const { profile, saveProfile } = useAccount()
  return <ProfileForm profile={profile} onSave={saveProfile} />
}
