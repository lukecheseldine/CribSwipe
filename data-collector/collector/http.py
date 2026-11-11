"""HTTP helpers: one polite session for all Craigslist requests."""
import time

import requests

from . import config


def get_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": config.USER_AGENT,
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    return session


def fetch(session: requests.Session, url: str, delay: float = config.DEFAULT_DELAY) -> str:
    """GET a URL, sleeping `delay` seconds first to rate-limit ourselves."""
    time.sleep(delay)
    response = session.get(url, timeout=30)
    response.raise_for_status()
    return response.text
