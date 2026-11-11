import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import Field

from ..db import get_db
from . import repository
from .display import display_body, display_photo_urls
from .schemas import FilterOptions, Listing, ListingCount, ListingsResponse

router = APIRouter(prefix="/api/listings", tags=["listings"])


def _for_display(listing: dict) -> dict:
    return {
        **listing,
        "body": display_body(listing["body"]),
        "photos": display_photo_urls(listing["photos"]),
    }


def listing_filters(
    min_price: Annotated[int | None, Query(ge=0)] = None,
    max_price: Annotated[int | None, Query(ge=0)] = None,
    bedrooms: Annotated[list[Annotated[int, Field(ge=0)]], Query()] = [],
    bathrooms: Annotated[list[Annotated[float, Field(ge=0)]], Query()] = [],
    min_sqft: Annotated[int | None, Query(ge=0)] = None,
    city: Annotated[list[str], Query()] = [],
    property_type: Annotated[list[str], Query()] = [],
) -> repository.ListingFilters:
    return repository.ListingFilters(
        min_price=min_price,
        max_price=max_price,
        bedrooms=tuple(bedrooms),
        bathrooms=tuple(bathrooms),
        min_sqft=min_sqft,
        cities=tuple(city),
        property_types=tuple(property_type),
    )


Db = Annotated[sqlite3.Connection, Depends(get_db)]
Filters = Annotated[repository.ListingFilters, Depends(listing_filters)]


@router.get("", response_model=ListingsResponse)
def list_listings(
    conn: Db, filters: Filters, limit: Annotated[int, Query(ge=1, le=500)] = 100
) -> ListingsResponse:
    listings = repository.list_listings(conn, limit, filters)
    return ListingsResponse(listings=[_for_display(listing) for listing in listings])


# Fixed paths are declared before /{listing_id} so they aren't read as ids.
@router.get("/count", response_model=ListingCount)
def count_listings(conn: Db, filters: Filters) -> ListingCount:
    return ListingCount(count=repository.count_listings(conn, filters))


@router.get("/filter-options", response_model=FilterOptions)
def filter_options(conn: Db) -> dict:
    return repository.filter_options(conn)


@router.get("/{listing_id}", response_model=Listing)
def get_listing(listing_id: str, conn: Db) -> dict:
    listing = repository.get_listing(conn, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return _for_display(listing)
