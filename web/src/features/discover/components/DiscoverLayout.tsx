import type { ReactNode } from 'react'
import { DiscoverHeader } from './DiscoverHeader'

type DiscoverLayoutProps = {
  location: string
  deck: ReactNode
  footer?: ReactNode
}

export function DiscoverLayout({ location, deck, footer }: DiscoverLayoutProps) {
  return (
    <div className="flex flex-col gap-7">
      <DiscoverHeader location={location} />
      <div className="h-156.5">{deck}</div>
      {footer}
    </div>
  )
}
