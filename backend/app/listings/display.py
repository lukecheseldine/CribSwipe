"""Turn stored scraper data into what clients should display."""
import re

# Craigslist serves every image at several sizes, e.g. ..._50x50c.jpg, ..._600x450.jpg, ..._1200x900.jpg.
_SIZED_IMAGE = re.compile(r"^(?P<base>https://images\.craigslist\.org/.+?)_\d+x\d+c?\.jpg$")
DISPLAY_SIZE = "1200x900"

# Every Craigslist posting body starts with this link label.
_BODY_BOILERPLATE = "QR Code Link to This Post"


def display_photo_urls(urls: list[str]) -> list[str]:
    """One full-size URL per distinct image, keeping the first-seen order."""
    seen: set[str] = set()
    display: list[str] = []
    for url in urls:
        match = _SIZED_IMAGE.match(url)
        key = match["base"] if match else url
        if key in seen:
            continue
        seen.add(key)
        display.append(f"{key}_{DISPLAY_SIZE}.jpg" if match else url)
    return display


def display_body(body: str | None) -> str | None:
    if body is None:
        return None
    cleaned = body.strip().removeprefix(_BODY_BOILERPLATE).strip()
    return cleaned or None
