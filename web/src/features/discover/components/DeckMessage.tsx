import type { ReactNode } from 'react'
import { Card } from '../../../components/ui/Card'

type DeckMessageProps = {
  children: ReactNode
  action?: ReactNode
}

export function DeckMessage({ children, action }: DeckMessageProps) {
  return (
    <Card className="flex h-full flex-col items-center justify-center gap-5 text-sm text-muted">
      <p>{children}</p>
      {action}
    </Card>
  )
}
