type ListingDescriptionProps = {
  description: string | null
}

export function ListingDescription({ description }: ListingDescriptionProps) {
  if (!description) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Room to make it yours.</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line text-muted">{description}</p>
    </section>
  )
}
