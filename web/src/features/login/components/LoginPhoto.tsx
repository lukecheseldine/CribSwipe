import { paths } from '../../../app/paths'
import { ButtonLink } from '../../../components/ui/ButtonLink'

type LoginPhotoProps = {
  src: string | null
}

export function LoginPhoto({ src }: LoginPhotoProps) {
  return (
    <div className="relative min-h-160 overflow-hidden rounded-[2rem] bg-brand-soft">
      {src && <img src={src} alt="" className="absolute inset-0 size-full object-cover" />}
      <ButtonLink to={paths.discover} className="absolute bottom-6 left-6">
        Find your place.
      </ButtonLink>
    </div>
  )
}
