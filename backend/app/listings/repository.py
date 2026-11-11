"""Queries against the data collector's schema (data-collector/collector/store.py)."""
import sqlite3
from dataclasses import dataclass

LISTING_COLUMNS = (
    "id, url, title, price_cad, bedrooms, bathrooms, sqft, property_type, "
    "address, city, postal_code, body, posted_at"
)

# Reposts (rows with a canonical_id) are excluded so each unit appears once.
DISTINCT_UNITS = "canonical_id IS NULL"


@dataclass(frozen=True)
class ListingFilters:
    """Listings with an unknown value for a filtered field are excluded by that filter."""

    min_price: int | None = None
    max_price: int | None = None
    min_bedrooms: int | None = None
    min_bathrooms: float | None = None
    cities: tuple[str, ...] = ()
    property_types: tuple[str, ...] = ()


def list_listings(
    conn: sqlite3.Connection, limit: int, filters: ListingFilters = ListingFilters()
) -> list[dict]:
    """Newest distinct listings matching the filters, with photo URLs in posting order."""
    where, params = _where(filters)
    rows = conn.execute(
        f"""SELECT {LISTING_COLUMNS}
            FROM listings
            WHERE {where}
            ORDER BY COALESCE(posted_at, first_seen) DESC
            LIMIT ?""",
        (*params, limit),
    ).fetchall()
    return _with_photos(conn, rows)


def get_listing(conn: sqlite3.Connection, listing_id: str) -> dict | None:
    row = conn.execute(
        f"SELECT {LISTING_COLUMNS} FROM listings WHERE id = ?", (listing_id,)
    ).fetchone()
    if row is None:
        return None
    return _with_photos(conn, [row])[0]


def filter_options(conn: sqlite3.Connection) -> dict:
    """The values present in the data, so filters only offer choices that match something."""

    def counts(column: str) -> list[dict]:
        rows = conn.execute(
            f"""SELECT {column} AS value, COUNT(*) AS count
                FROM listings
                WHERE {DISTINCT_UNITS} AND TRIM(COALESCE({column}, '')) != ''
                GROUP BY {column}
                ORDER BY count DESC, value"""
        )
        return [dict(row) for row in rows]

    prices = conn.execute(
        f"SELECT MIN(price_cad), MAX(price_cad) FROM listings WHERE {DISTINCT_UNITS}"
    ).fetchone()
    return {
        "cities": counts("city"),
        "property_types": counts("property_type"),
        "min_price": prices[0],
        "max_price": prices[1],
    }


def _where(filters: ListingFilters) -> tuple[str, list]:
    clauses = [DISTINCT_UNITS]
    params: list = []

    def add(clause: str, *values) -> None:
        clauses.append(clause)
        params.extend(values)

    if filters.min_price is not None:
        add("price_cad >= ?", filters.min_price)
    if filters.max_price is not None:
        add("price_cad <= ?", filters.max_price)
    # The collector stores bedrooms as text (from the listing's JSON-LD).
    if filters.min_bedrooms is not None:
        add("CAST(bedrooms AS INTEGER) >= ?", filters.min_bedrooms)
    if filters.min_bathrooms is not None:
        add("bathrooms >= ?", filters.min_bathrooms)
    if filters.cities:
        add(f"city IN ({_placeholders(filters.cities)})", *filters.cities)
    if filters.property_types:
        add(f"property_type IN ({_placeholders(filters.property_types)})", *filters.property_types)
    return " AND ".join(clauses), params


def _placeholders(values: tuple) -> str:
    return ", ".join("?" for _ in values)


def _with_photos(conn: sqlite3.Connection, rows: list[sqlite3.Row]) -> list[dict]:
    listings = [{**dict(row), "photos": []} for row in rows]
    if not listings:
        return listings

    by_id = {listing["id"]: listing for listing in listings}
    photos = conn.execute(
        f"""SELECT listing_id, url FROM photos
            WHERE listing_id IN ({_placeholders(tuple(by_id))})
            ORDER BY listing_id, position""",
        tuple(by_id),
    )
    for photo in photos:
        by_id[photo["listing_id"]]["photos"].append(photo["url"])
    return listings
