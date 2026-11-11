"""SQLite storage for scraped listings.

This module is the seam for the hosted-database migration: everything the
scraper knows about persistence goes through the functions here. Swapping
SQLite for Postgres later means rewriting this file, not the scraper.

Schema notes
------------
* `listings` holds one row per Craigslist posting id. Reposts get fresh
  ids from Craigslist, so heavy repost churn shows up as new rows — the
  near-duplicate matcher that collapses those is still TODO (see README).
* `content_hash` covers the cheap search-level fields (title/price/city).
  A hash change means "worth re-fetching the detail page".
* `first_seen` / `last_seen` let a future cron distinguish active
  listings from ones that disappeared off Craigslist.
* `canonical_id` points a repost at the original listing. Craigslist
  issues a fresh posting id on every repost, so the same unit would
  otherwise look like N listings; matcher.py links them and the swipe
  deck queries `WHERE canonical_id IS NULL`.
* Photos live in their own table: one listing -> many photos, which is
  exactly what relational databases are for.
"""
import hashlib
import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS listings (
    id           TEXT PRIMARY KEY,
    url          TEXT NOT NULL,
    title        TEXT,
    price_cad    INTEGER,
    bedrooms     TEXT,
    bathrooms    REAL,
    sqft         INTEGER,
    property_type TEXT,
    address      TEXT,
    city         TEXT,
    postal_code  TEXT,
    latitude     REAL,
    longitude    REAL,
    posted_at    TEXT,
    body         TEXT,
    photo_count  INTEGER DEFAULT 0,
    content_hash TEXT,
    canonical_id TEXT REFERENCES listings(id),
    first_seen   TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS photos (
    listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL,
    url        TEXT NOT NULL,
    PRIMARY KEY (listing_id, position)
);
CREATE INDEX IF NOT EXISTS idx_listings_last_seen ON listings(last_seen);
CREATE INDEX IF NOT EXISTS idx_listings_canonical ON listings(canonical_id);
"""


def _migrate(conn: sqlite3.Connection) -> None:
    """Bring databases created before canonical_id existed up to date."""
    cols = {row["name"] for row in conn.execute("PRAGMA table_info(listings)")}
    if "canonical_id" not in cols:
        conn.execute("ALTER TABLE listings ADD COLUMN canonical_id TEXT REFERENCES listings(id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_canonical ON listings(canonical_id)")


def connect(db_path: str | Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    _migrate(conn)
    return conn


def search_content_hash(hit: dict) -> str:
    raw = "|".join(str(hit.get(k) or "") for k in ("title", "price_cad", "city"))
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()


def record_search_hit(conn: sqlite3.Connection, hit: dict) -> str:
    """Record a search-result hit. Returns 'new', 'changed' or 'unchanged'.

    'new'/'changed' mean the caller should fetch the detail page;
    'unchanged' means the DB row is already fresh and only last_seen moves.
    """
    content_hash = search_content_hash(hit)
    row = conn.execute(
        "SELECT content_hash FROM listings WHERE id = ?", (hit["id"],)
    ).fetchone()
    if row is None:
        conn.execute(
            """INSERT INTO listings (id, url, title, price_cad, city, content_hash)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (hit["id"], hit["url"], hit["title"], hit["price_cad"], hit["city"], content_hash),
        )
        return "new"
    conn.execute("UPDATE listings SET last_seen = datetime('now') WHERE id = ?", (hit["id"],))
    if row["content_hash"] != content_hash:
        conn.execute(
            """UPDATE listings
               SET title = ?, price_cad = ?, city = ?, content_hash = ?
               WHERE id = ?""",
            (hit["title"], hit["price_cad"], hit["city"], content_hash, hit["id"]),
        )
        return "changed"
    return "unchanged"


def save_detail(conn: sqlite3.Connection, listing_id: str, data: dict) -> None:
    """Upsert a fully scraped detail page, replacing its photo set."""
    conn.execute(
        """INSERT INTO listings
               (id, url, title, price_cad, bedrooms, bathrooms, sqft,
                property_type, address, city, postal_code, latitude, longitude,
                posted_at, body, photo_count, last_seen)
           VALUES
               (:id, :url, :title, :price_cad, :bedrooms, :bathrooms, :sqft,
                :property_type, :address, :city, :postal_code, :latitude, :longitude,
                :posted_at, :body, :photo_count, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
               url = excluded.url, title = excluded.title,
               price_cad = excluded.price_cad, bedrooms = excluded.bedrooms,
               bathrooms = excluded.bathrooms, sqft = excluded.sqft,
               property_type = excluded.property_type, address = excluded.address,
               city = excluded.city, postal_code = excluded.postal_code,
               latitude = excluded.latitude, longitude = excluded.longitude,
               posted_at = excluded.posted_at, body = excluded.body,
               photo_count = excluded.photo_count, last_seen = datetime('now')""",
        {"id": listing_id, **data, "photos": None},
    )
    conn.execute("DELETE FROM photos WHERE listing_id = ?", (listing_id,))
    conn.executemany(
        "INSERT INTO photos (listing_id, position, url) VALUES (?, ?, ?)",
        [(listing_id, i, url) for i, url in enumerate(data.get("photos") or [])],
    )


def stats(conn: sqlite3.Connection) -> dict:
    row = conn.execute(
        """SELECT COUNT(*) AS listings,
                  SUM(CASE WHEN canonical_id IS NULL THEN 1 ELSE 0 END) AS distinct_units,
                  SUM(CASE WHEN photo_count > 0 THEN 1 ELSE 0 END) AS with_photos,
                  SUM(photo_count) AS photos
           FROM listings"""
    ).fetchone()
    return dict(row)


def link_canonical(conn: sqlite3.Connection, listing_id: str, data: dict) -> str | None:
    """Point a new/changed listing at the older posting it reposts, if any."""
    from . import matcher

    canonical_id = matcher.find_canonical_id(conn, listing_id, data)
    conn.execute(
        "UPDATE listings SET canonical_id = ? WHERE id = ?",
        (canonical_id, listing_id),
    )
    return canonical_id
