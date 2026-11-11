import { Link } from 'react-router'
import { paths } from '../../app/paths'
import brandMark from '../../assets/brand-mark.svg'

export function BrandLogo() {
  return (
    <Link to={paths.discover} aria-label="CribSwipe home" className="flex items-center gap-3">
      <img src={brandMark} alt="" width={42} height={42} />
      <span className="text-xl">Find your place.</span>
    </Link>
  )
}
