export type Listing = {
  id: string
  title: string
  url: string
  priceCad: number | null
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  propertyType: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  description: string | null
  postedAt: string | null
  photos: string[]
}
