import type { ReactNode } from 'react'

type DiscoverLayoutProps = {
  header: ReactNode
  deck: ReactNode
  footer?: ReactNode
}

export function DiscoverLayout({ header, deck, footer }: DiscoverLayoutProps) {
  return (
    <div className="flex flex-col gap-7">
      {header}
      <div className="h-156.5">{deck}</div>
      {footer}
    </div>
  )
}
