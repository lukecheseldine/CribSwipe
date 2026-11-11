type ListingImageProps = {
  src: string | undefined
  alt: string
}

export function ListingImage({ src, alt }: ListingImageProps) {
  if (!src) {
    return (
      <p className="flex size-full items-center justify-center text-sm text-muted">
        No photos provided
      </p>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="absolute inset-0 size-full object-cover"
    />
  )
}
