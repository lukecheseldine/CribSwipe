"""Shared configuration for the data collector."""

# Metro-wide Vancouver apartments/housing search. (The city-proper-only
# equivalent is https://www.craigslist.org/search/subarea/van?cat=apa —
# swap SEARCH_URL if you ever want to narrow the catchment.)
SEARCH_URL = "https://www.craigslist.org/search/city/vancouver-bc?cat=apa"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0 Safari/537.36"
)

# Seconds to wait between HTTP requests. Craigslist tolerates gentle
# scraping; keep this >= 1.0 to stay polite.
DEFAULT_DELAY = 1.0

DB_FILENAME = "listings.db"
