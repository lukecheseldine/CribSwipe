import { paths } from '../../../app/paths'
import { ButtonLink } from '../../../components/ui/ButtonLink'
import { pluralize } from '../../../lib/format'

type ShortlistHeaderProps = {
  count: number
}

function getSubtitle(count: number) {
  if (count === 0) return 'Places you like will be saved here.'
  return `${pluralize(count, 'place')} that ${count === 1 ? 'feels' : 'feel'} like you.`
}

export function ShortlistHeader({ count }: ShortlistHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl leading-heading">Your shortlist.</h1>
        <p className="text-label text-muted">{getSubtitle(count)}</p>
      </div>
      <ButtonLink to={paths.discover} icon="layers">
        Keep discovering
      </ButtonLink>
    </header>
  )
}
