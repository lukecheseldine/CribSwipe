"""Scrape one Craigslist posting's detail page.

Detail pages are fully server-rendered and carry a JSON-LD block typed
Apartment/House with bedrooms, bathrooms, lat/lng and address, plus the
title, price, photo gallery and posting body in HTML.
"""
import json
import re

from bs4 import BeautifulSoup

from . import config
from .http import fetch


def _posting_json_ld(soup: BeautifulSoup) -> dict:
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(data, dict) and data.get("@type") in ("Apartment", "House"):
            return data
    return {}


def _photos(soup: BeautifulSoup, limit: int = 25) -> list[str]:
    seen: list[str] = []
    for url in re.findall(r"https://images\.craigslist\.org/[^\s\"'<>]+", str(soup)):
        if url not in seen:
            seen.append(url)
    # Prefer the mid-size gallery variants over raw thumbs.
    seen.sort(key=lambda u: ("600x450" not in u, u))
    return seen[:limit]


def _to_float(value) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def parse_detail(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    ld = _posting_json_ld(soup)
    address = ld.get("address", {}) if isinstance(ld.get("address"), dict) else {}

    title_el = soup.select_one("#titletextonly")
    price_el = soup.select_one(".price")
    body_el = soup.select_one("section#posting-body, #postingbody")
    posted_el = soup.select_one("time.date.timeago")

    # Sqft sometimes appears in the housing line, e.g. "2br - 900ft2 -".
    sqft = None
    housing = soup.select_one(".housing")
    if housing:
        match = re.search(r"(\d[\d,]*)\s*ft", housing.get_text())
        if match:
            sqft = int(match.group(1).replace(",", ""))

    photos = _photos(soup)
    return {
        "url": url,
        "title": title_el.get_text(strip=True) if title_el else ld.get("name"),
        "price_cad": _to_int(re.sub(r"[^\d]", "", price_el.get_text())) if price_el else None,
        "bedrooms": str(ld.get("numberOfBedrooms")) if ld.get("numberOfBedrooms") is not None else None,
        "bathrooms": _to_float(ld.get("numberOfBathroomsTotal")),
        "sqft": sqft,
        "property_type": ld.get("@type"),
        "address": address.get("streetAddress") or None,
        "city": address.get("addressLocality") or None,
        "postal_code": address.get("postalCode") or None,
        "latitude": _to_float(ld.get("latitude")),
        "longitude": _to_float(ld.get("longitude")),
        "posted_at": posted_el.get("datetime") if posted_el else None,
        "body": body_el.get_text("\n", strip=True) if body_el else None,
        "photos": photos,
        "photo_count": len(photos),
    }


def fetch_detail(session, url: str, delay: float = config.DEFAULT_DELAY) -> dict:
    return parse_detail(fetch(session, url, delay), url)
