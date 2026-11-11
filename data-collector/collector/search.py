"""Scrape a Craigslist search page.

Craigslist's search pages are client-rendered, but they embed a static
SEO fallback: <ol class="cl-static-search-results"> with one
<li class="cl-static-search-result"> per listing carrying title, price,
location and the posting URL. That is all we need for the cheap sweep —
detail pages (detail.py) fill in the rest, but only for new/changed
listings.
"""
import re

from bs4 import BeautifulSoup

from . import config
from .http import fetch


def parse_price(text: str | None) -> int | None:
    if not text:
        return None
    digits = re.sub(r"[^\d]", "", text)
    return int(digits) if digits else None


def posting_id_from_url(url: str) -> str:
    # https://www.craigslist.org/view/d/<slug>/<opaque-id>
    return url.rstrip("/").rsplit("/", 1)[-1]


def parse_search(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    hits = []
    for li in soup.select("li.cl-static-search-result"):
        link = li.find("a", href=True)
        if not link:
            continue
        url = link["href"]
        title_el = li.select_one(".title")
        price_el = li.select_one(".price")
        loc_el = li.select_one(".location")
        title = (li.get("title") or (title_el.get_text(strip=True) if title_el else "")).strip()
        hits.append(
            {
                "id": posting_id_from_url(url),
                "url": url,
                "title": title,
                "price_cad": parse_price(price_el.get_text() if price_el else None),
                "city": loc_el.get_text(strip=True) if loc_el else None,
            }
        )
    return hits


def fetch_results(session, url: str = config.SEARCH_URL, delay: float = config.DEFAULT_DELAY) -> list[dict]:
    return parse_search(fetch(session, url, delay))
