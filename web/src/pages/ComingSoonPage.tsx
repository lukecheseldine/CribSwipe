type ComingSoonPageProps = {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-4xl leading-heading">{title}</h1>
      <p className="text-sm text-muted">This page hasn&rsquo;t been designed yet.</p>
    </div>
  )
}
