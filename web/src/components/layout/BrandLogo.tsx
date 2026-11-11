import { Link } from 'react-router'
import { paths } from '../../app/paths'
import { Icon } from '../ui/Icon'

export function BrandLogo() {
  return (
    <Link to={paths.discover} aria-label="CribSwipe home" className="flex items-center gap-3">
      <Icon name="brandMark" />
      <span className="text-xl">Find your place.</span>
    </Link>
  )
}
