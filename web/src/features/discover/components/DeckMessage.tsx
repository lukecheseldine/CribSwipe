import type { ReactNode } from 'react'
import { Card } from '../../../components/ui/Card'

type DeckMessageProps = {
  children: ReactNode
}

export function DeckMessage({ children }: DeckMessageProps) {
  return (
    <Card className="flex h-full items-center justify-center text-sm text-muted">{children}</Card>
  )
}
