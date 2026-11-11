import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_db
from . import repository
from .display import display_body, display_photo_urls
from .schemas import Listing, ListingsResponse

router = APIRouter(prefix="/api/listings", tags=["listings"])


def _for_display(listing: dict) -> dict:
    return {
        **listing,
        "body": display_body(listing["body"]),
        "photos": display_photo_urls(listing["photos"]),
    }


@router.get("", response_model=ListingsResponse)
def list_listings(
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
) -> ListingsResponse:
    listings = repository.list_listings(conn, limit)
    return ListingsResponse(listings=[_for_display(listing) for listing in listings])


@router.get("/{listing_id}", response_model=Listing)
def get_listing(
    listing_id: str,
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
) -> dict:
    listing = repository.get_listing(conn, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return _for_display(listing)
