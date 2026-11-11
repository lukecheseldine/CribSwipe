# CribSwipe API

FastAPI service that serves scraped listings to the web and mobile apps. It reads the SQLite
database written by [`data-collector/`](../data-collector) (read-only; the collector owns the
schema) and turns stored rows into display-ready data — one full-size photo URL per image and
post bodies without Craigslist boilerplate.

```sh
python3 -m venv venv
./venv/bin/pip install -r requirements-dev.txt

python ../data-collector/main.py --limit 25   # populate data-collector/listings.db first
./venv/bin/uvicorn app.main:app --reload      # http://127.0.0.1:8000, docs at /docs
./venv/bin/python -m pytest
```

Set `CRIBSWIPE_DB_PATH` to point at a different listings database. Accounts live in
`backend/cribswipe.db` (gitignored); set `CRIBSWIPE_APP_DB_PATH` to move that file.

The web dev server (`npm run dev` in `web/`) proxies `/api` to this service.

## Endpoints

- `GET /api/listings?limit=100` — newest distinct listings (reposts excluded), each with its
  photo URLs in posting order. Returns `503` until the collector has created the database.
  Optional filters: `min_price`, `max_price`, `min_sqft`, and repeatable exact-match `bedrooms`,
  `bathrooms`, `city`, and `property_type` (e.g. `?bedrooms=1&bedrooms=2&city=Burnaby`). Listings
  with an unknown value for a filtered field are left out.
- `GET /api/listings/count` — `{"count": n}` for the same filters, e.g. for "Show 12 places".
- `GET /api/listings/filter-options` — the cities and property types present in the data,
  each with how many listings have it. Rent, size, and room-count scales are fixed in the
  clients so a saved search does not move when listings change.
- `GET /api/listings/{id}` — one listing in the same shape, or `404` if the id is unknown.
- `POST /api/auth/signup` and `POST /api/auth/login` — email or mobile number plus a password.
  A session cookie is set. Apple, Google, and texted verification codes are not connected.
- `POST /api/auth/logout` — clears the session cookie.
- `GET /api/account` — the signed-in profile, default filters, and shortlist. `401` when signed out.
- `PUT /api/account/profile`, `PUT /api/account/filters`, `POST /api/account/shortlist`, and
  `DELETE /api/account/shortlist/{listing_id}` — update that account. Move-in date, pet friendly,
  and amenities are stored with the default search and are not applied to listings until the
  scraper collects them.

## Layout

```
app/
  main.py               FastAPI app; mounts feature routers
  config.py             Environment-driven settings
  db.py                 Read-only SQLite connection dependency
  accounts/             Users, sessions, default filters, and shortlists
  listings/
    routes.py           HTTP layer
    repository.py       SQL against the collector's schema
    display.py          Stored data -> what clients display
    schemas.py          Response models (the API contract)
tests/                  Builds databases with the collector's own store.py
```
