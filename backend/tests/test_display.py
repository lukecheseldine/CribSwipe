from app.listings.display import display_body, display_photo_urls

BASE = "https://images.craigslist.org"


def test_upgrades_to_full_size():
    assert display_photo_urls([f"{BASE}/00a_x_600x450.jpg"]) == [f"{BASE}/00a_x_1200x900.jpg"]


def test_drops_thumbnails_of_images_already_listed():
    urls = [
        f"{BASE}/00a_x_600x450.jpg",
        f"{BASE}/00b_y_600x450.jpg",
        f"{BASE}/00a_x_50x50c.jpg",
    ]

    assert display_photo_urls(urls) == [f"{BASE}/00a_x_1200x900.jpg", f"{BASE}/00b_y_1200x900.jpg"]


def test_keeps_thumbnail_only_images_and_unknown_urls():
    urls = [f"{BASE}/00c_z_50x50c.jpg", "https://example.com/photo.png"]

    assert display_photo_urls(urls) == [f"{BASE}/00c_z_1200x900.jpg", "https://example.com/photo.png"]


def test_strips_craigslist_body_boilerplate():
    assert display_body("QR Code Link to This Post\nBright suite near transit.") == (
        "Bright suite near transit."
    )


def test_empty_body_becomes_none():
    assert display_body("QR Code Link to This Post\n  ") is None
    assert display_body(None) is None
