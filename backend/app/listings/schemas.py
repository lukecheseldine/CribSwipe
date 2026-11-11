"""Response models for the listings API."""
from pydantic import BaseModel


class Listing(BaseModel):
    id: str
    url: str
    title: str | None
    price_cad: int | None
    bedrooms: str | None
    bathrooms: float | None
    sqft: int | None
    property_type: str | None
    address: str | None
    city: str | None
    postal_code: str | None
    body: str | None
    posted_at: str | None
    photos: list[str]


class ListingsResponse(BaseModel):
    listings: list[Listing]


class ListingCount(BaseModel):
    count: int


class FilterOption(BaseModel):
    value: str
    count: int


class FilterOptions(BaseModel):
    cities: list[FilterOption]
    property_types: list[FilterOption]
