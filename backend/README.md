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

Set `CRIBSWIPE_DB_PATH` to point at a different database file.

The web dev server (`npm run dev` in `web/`) proxies `/api` to this service.

## Endpoints

- `GET /api/listings?limit=100` — newest distinct listings (reposts excluded), each with its
  photo URLs in posting order. Returns `503` until the collector has created the database.
  Optional filters: `min_price`, `max_price`, and repeatable exact-match `bedrooms`, `bathrooms`,
  `city`, and `property_type` (e.g. `?bedrooms=1&bedrooms=2&city=Burnaby`). Listings with an
  unknown value for a filtered field are left out.
- `GET /api/listings/filter-options` — the cities, property types, bedroom and bathroom counts
  present in the data (each with how many listings have it) and the price range, for building
  filter controls.
- `GET /api/listings/{id}` — one listing in the same shape, or `404` if the id is unknown.

## Layout

```
app/
  main.py               FastAPI app; mounts feature routers
  config.py             Environment-driven settings
  db.py                 Read-only SQLite connection dependency
  listings/
    routes.py           HTTP layer
    repository.py       SQL against the collector's schema
    display.py          Stored data -> what clients display
    schemas.py          Response models (the API contract)
tests/                  Builds databases with the collector's own store.py
```
