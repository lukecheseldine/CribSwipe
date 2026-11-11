# data-collector

Scrapes Vancouver Craigslist rentals into a local SQLite database. One
command does the whole job:

```bash
pip install -r data-collector/requirements.txt
python data-collector/main.py
```

The database lands at `data-collector/listings.db` (gitignored).

## How a run works

1. **Search sweep (cheap):** fetches the metro-Vancouver apartments search
   page and parses every result (title, price, city, posting URL). Craigslist
   embeds a static SEO fallback in the page, so this needs no browser.
2. **Change detection:** each hit is hashed (title + price + city) and
   compared against the DB. New or changed listings are flagged; unchanged
   ones just get their `last_seen` bumped.
3. **Detail fetch (expensive, incremental):** only new/changed listings get
   their posting page fetched — full attributes (beds/baths/sqft, address,
   lat/lng, body) plus up to 25 photo URLs. This keeps runs fast and polite,
   and it's exactly the shape the future cron job wants.

```
python data-collector/main.py --limit 10      # smoke test: 10 listings
python data-collector/main.py --no-details    # search-level fields only
python data-collector/main.py --db /tmp/x.db  # custom database path
```

## Schema

`listings` — one row per Craigslist posting id (title, price_cad,
bedrooms, bathrooms, sqft, property_type, address/city/postal_code,
latitude/longitude, posted_at, body, photo_count, content_hash,
first_seen, last_seen).

`photos` — `(listing_id, position, url)`, one row per photo.

All persistence goes through `collector/store.py` — that module is the
seam for the hosted-database migration. Swapping SQLite for Postgres later
means rewriting `store.py`, not the scraper.

## Repost handling

Craigslist issues a fresh posting id on every repost, so the same unit
re-listed weekly would look like N different listings. After each detail
page is fetched, `collector/matcher.py` compares it against listings seen
in the last 90 days and links probable reposts via `listings.canonical_id`.
A match requires all four signals: equal price, equal bedrooms, nearby
location (< 0.5 km, else same postal code, else same city), and title
similarity >= 0.85 after normalization. The swipe deck should query
`WHERE canonical_id IS NULL`; repost rows are kept because they can carry
fresher photos. Thresholds live at the top of `matcher.py` — tune them as
real data comes in.

## Known limitations / TODO

- **Politeness:** one request per `--delay` seconds (default 1.0), browser
  User-Agent, no concurrency. Keep it that way.
