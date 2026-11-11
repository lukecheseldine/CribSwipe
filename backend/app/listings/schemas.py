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


class CountOption(BaseModel):
    value: int
    count: int


class BathroomOption(BaseModel):
    value: float
    count: int


class FilterOptions(BaseModel):
    cities: list[FilterOption]
    property_types: list[FilterOption]
    bedrooms: list[CountOption]
    bathrooms: list[BathroomOption]
    min_price: int | None
    max_price: int | None
    min_sqft: int | None
    max_sqft: int | None
