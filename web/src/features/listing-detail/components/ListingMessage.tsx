import type { ReactNode } from 'react'
import { paths } from '../../../app/paths'
import { ButtonLink } from '../../../components/ui/ButtonLink'
import { Card } from '../../../components/ui/Card'

type ListingMessageProps = {
  children: ReactNode
}

export function ListingMessage({ children }: ListingMessageProps) {
  return (
    <Card className="flex flex-col items-center gap-6 px-8 py-20 text-center">
      <p className="text-xl">{children}</p>
      <ButtonLink to={paths.discover} icon="arrowLeft">
        Back to discovery
      </ButtonLink>
    </Card>
  )
}
