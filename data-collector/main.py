#!/usr/bin/env python3
"""CribSwipe data collector: scrape Vancouver Craigslist rentals into SQLite.

One run does the whole job:

    python data-collector/main.py

Re-runs are incremental: the search page is always re-scraped, but detail
pages are only fetched for listings that are new or changed since the last
run (tracked via a content hash in the DB). That keeps runs fast, polite
to Craigslist, and shaped exactly like the future cron job wants.

Options:
    --db PATH       SQLite file (default: data-collector/listings.db)
    --limit N       Only process the first N search results (for testing)
    --no-details    Skip detail pages; store search-level fields only
    --delay SECS    Seconds between HTTP requests (default: 1.0)
    --search-url U  Override the Craigslist search URL
"""
import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from collector import config, detail, http, search, store  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape Vancouver Craigslist rentals into SQLite.")
    parser.add_argument("--db", default=str(Path(__file__).resolve().parent / config.DB_FILENAME))
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--no-details", action="store_true")
    parser.add_argument("--delay", type=float, default=config.DEFAULT_DELAY)
    parser.add_argument("--search-url", default=config.SEARCH_URL)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    started = time.time()

    conn = store.connect(args.db)
    session = http.get_session()

    hits = search.fetch_results(session, args.search_url, args.delay)
    if args.limit:
        hits = hits[: args.limit]
    print(f"search: {len(hits)} listings on the results page")

    new = changed = details_fetched = reposts = 0
    for i, hit in enumerate(hits, 1):
        status = store.record_search_hit(conn, hit)
        if status == "new":
            new += 1
        elif status == "changed":
            changed += 1
        if status != "unchanged" and not args.no_details:
            try:
                data = detail.fetch_detail(session, hit["url"], args.delay)
                store.save_detail(conn, hit["id"], data)
                details_fetched += 1
                if store.link_canonical(conn, hit["id"], {**hit, **data}):
                    reposts += 1
            except Exception as exc:  # one bad posting must not kill the run
                print(f"  ! detail failed for {hit['id']}: {exc}", file=sys.stderr)
        if i % 50 == 0:
            conn.commit()
            print(f"  ... {i}/{len(hits)}")

    conn.commit()
    totals = store.stats(conn)
    elapsed = time.time() - started
    print(
        f"done in {elapsed:.0f}s: {new} new, {changed} changed, "
        f"{details_fetched} detail pages fetched ({reposts} linked as reposts) | "
        f"db: {totals['listings']} postings, {totals['distinct_units']} distinct units, "
        f"{totals['with_photos']} with photos ({totals['photos'] or 0} photos) -> {args.db}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
