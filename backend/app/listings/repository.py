"""Queries against the data collector's schema (data-collector/collector/store.py)."""
import sqlite3

LISTING_COLUMNS = (
    "id, url, title, price_cad, bedrooms, bathrooms, sqft, property_type, "
    "address, city, postal_code, body, posted_at"
)


def list_listings(conn: sqlite3.Connection, limit: int) -> list[dict]:
    """Newest distinct listings with their photo URLs in posting order.

    Reposts (rows with a canonical_id) are excluded so each unit appears once.
    """
    rows = conn.execute(
        f"""SELECT {LISTING_COLUMNS}
            FROM listings
            WHERE canonical_id IS NULL
            ORDER BY COALESCE(posted_at, first_seen) DESC
            LIMIT ?""",
        (limit,),
    ).fetchall()
    listings = [{**dict(row), "photos": []} for row in rows]
    if not listings:
        return listings

    by_id = {listing["id"]: listing for listing in listings}
    placeholders = ", ".join("?" for _ in by_id)
    photos = conn.execute(
        f"""SELECT listing_id, url FROM photos
            WHERE listing_id IN ({placeholders})
            ORDER BY listing_id, position""",
        tuple(by_id),
    )
    for photo in photos:
        by_id[photo["listing_id"]]["photos"].append(photo["url"])
    return listings
