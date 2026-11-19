"""Account payloads. Filter fields use the web's names so a saved search round-trips."""
from typing import Any

from pydantic import BaseModel, Field


class AuthRequest(BaseModel):
    identifier: str
    password: str


class SignupRequest(AuthRequest):
    name: str


class FiltersPayload(BaseModel):
    max_price: int | None = Field(default=None, ge=0)
    bedrooms: list[int] = Field(default_factory=list)
    bathrooms: list[float] = Field(default_factory=list)
    min_sqft: int | None = Field(default=None, ge=0)
    cities: list[str] = Field(default_factory=list)
    property_types: list[str] = Field(default_factory=list)
    move_in_date: str | None = None
    pet_friendly: bool = False
    amenities: list[str] = Field(default_factory=list)


class ProfilePayload(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    photo: str | None = None


class ShortlistPayload(BaseModel):
    listing: dict[str, Any]


class ShortlistItem(BaseModel):
    saved_at: str
    listing: dict[str, Any]


class AccountResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    photo: str | None
    default_filters: FiltersPayload
    shortlist: list[ShortlistItem]
