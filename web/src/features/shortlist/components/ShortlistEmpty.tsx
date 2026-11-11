import { Card } from '../../../components/ui/Card'

export function ShortlistEmpty() {
  return (
    <Card className="flex flex-col items-center gap-2 px-8 py-20 text-center">
      <p className="text-xl">Nothing saved yet.</p>
      <p className="text-sm text-muted">Like a place on Discover and it&rsquo;ll show up here.</p>
    </Card>
  )
}
