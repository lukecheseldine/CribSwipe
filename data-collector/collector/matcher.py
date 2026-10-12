"""Near-duplicate detection: link Craigslist reposts to one canonical listing.

Craigslist issues a fresh opaque posting id on every repost, so the same
unit re-listed weekly looks like N different listings. For a swipe deck
that is actively bad UX (the same apartment five times in a row), so after
a detail page is fetched we try to match it against known listings and, on
a match, point the new row's `canonical_id` at the older one. Repost rows
are kept (they may carry fresher photos/body) but the deck queries
`WHERE canonical_id IS NULL`.

A match requires all four signals, per the agreed design:
  * price equal (exact)
  * bedrooms equal (when both known)
  * location close: < MAX_DISTANCE_KM apart, else same postal code, else
    same city — whichever precision the postings provide
  * title similarity >= TITLE_SIMILARITY_THRESHOLD after normalization

Only listings seen within MATCH_WINDOW_DAYS are candidates, and the
oldest match wins, so chains always point at the original posting.
"""
import difflib
import math
import re

TITLE_SIMILARITY_THRESHOLD = 0.85
MAX_DISTANCE_KM = 0.5
MATCH_WINDOW_DAYS = 90

_FILLER = re.compile(
    r"\b(for rent|for lease|available|avail\.?|new|just listed|price reduced|"
    r"reduced|must see|stunning|gorgeous|amazing|beautiful)\b",
    re.IGNORECASE,
)


def normalize_title(title: str | None) -> str:
    text = (title or "").lower()
    text = _FILLER.sub(" ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def title_similarity(a: str | None, b: str | None) -> float:
    na, nb = normalize_title(a), normalize_title(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    return difflib.SequenceMatcher(None, na, nb).ratio()


def normalize_beds(bedrooms) -> int | None:
    match = re.search(r"\d+", str(bedrooms or ""))
    return int(match.group()) if match else None


def haversine_km(lat1, lng1, lat2, lng2) -> float | None:
    if None in (lat1, lng1, lat2, lng2):
        return None
    lat1, lng1, lat2, lng2 = map(math.radians, (lat1, lng1, lat2, lng2))
    dlat, dlng = lat2 - lat1, lng2 - lng1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(h))


def _normalize_postal(code: str | None) -> str | None:
    return re.sub(r"\s+", "", (code or "").upper()) or None


def locations_match(candidate: dict, existing: dict) -> bool:
    distance = haversine_km(
        candidate.get("latitude"), candidate.get("longitude"),
        existing.get("latitude"), existing.get("longitude"),
    )
    if distance is not None:
        return distance <= MAX_DISTANCE_KM
    cand_postal = _normalize_postal(candidate.get("postal_code"))
    exist_postal = _normalize_postal(existing.get("postal_code"))
    if cand_postal and exist_postal:
        return cand_postal == exist_postal
    cand_city = (candidate.get("city") or "").strip().lower()
    exist_city = (existing.get("city") or "").strip().lower()
    return bool(cand_city and cand_city == exist_city)


def is_repost(candidate: dict, existing: dict) -> bool:
    """True when `candidate` looks like a repost of `existing`."""
    cand_price, exist_price = candidate.get("price_cad"), existing.get("price_cad")
    if cand_price is None or exist_price is None or cand_price != exist_price:
        return False
    cand_beds = normalize_beds(candidate.get("bedrooms"))
    exist_beds = normalize_beds(existing.get("bedrooms"))
    if cand_beds is not None and exist_beds is not None and cand_beds != exist_beds:
        return False
    if not locations_match(candidate, existing):
        return False
    return title_similarity(candidate.get("title"), existing.get("title")) >= TITLE_SIMILARITY_THRESHOLD


def find_canonical_id(conn, listing_id: str, data: dict) -> str | None:
    """Return the id of the older listing `data` reposts, or None.

    Candidates are canonical listings (not themselves reposts) seen within
    the match window, oldest first so the original posting always wins.
    """
    rows = conn.execute(
        """SELECT id, title, price_cad, bedrooms, city, postal_code, latitude, longitude
           FROM listings
           WHERE canonical_id IS NULL
             AND id != ?
             AND last_seen >= datetime('now', ?)
           ORDER BY first_seen ASC""",
        (listing_id, f"-{MATCH_WINDOW_DAYS} days"),
    ).fetchall()
    for row in rows:
        if is_repost(data, dict(row)):
            return row["id"]
    return None
