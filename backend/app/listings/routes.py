import sqlite3
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from ..db import get_db
from . import repository
from .display import display_body, display_photo_urls
from .schemas import ListingsResponse

router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.get("", response_model=ListingsResponse)
def list_listings(
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
) -> ListingsResponse:
    listings = repository.list_listings(conn, limit)
    return ListingsResponse(
        listings=[
            {
                **listing,
                "body": display_body(listing["body"]),
                "photos": display_photo_urls(listing["photos"]),
            }
            for listing in listings
        ]
    )
