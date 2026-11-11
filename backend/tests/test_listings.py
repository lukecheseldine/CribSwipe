from pathlib import Path

import pytest

from app import config

from .conftest import make_detail, store


def test_returns_listings_newest_first_with_ordered_photos(db, client):
    store.save_detail(db, "older", make_detail(posted_at="2026-11-01T09:00:00-0800"))
    store.save_detail(
        db,
        "newer",
        make_detail(
            posted_at="2026-11-09T09:00:00-0800",
            photos=["https://images.craigslist.org/a_600x450.jpg", "https://images.craigslist.org/b_600x450.jpg"],
            photo_count=2,
        ),
    )
    db.commit()

    response = client.get("/api/listings")

    assert response.status_code == 200
    listings = response.json()["listings"]
    assert [listing["id"] for listing in listings] == ["newer", "older"]
    assert listings[0]["photos"] == [
        "https://images.craigslist.org/a_1200x900.jpg",
        "https://images.craigslist.org/b_1200x900.jpg",
    ]
    assert listings[1]["photos"] == []
    assert listings[0]["price_cad"] == 2200
    assert listings[0]["bedrooms"] == "1"


def test_excludes_reposts(db, client):
    store.save_detail(db, "original", make_detail())
    store.save_detail(db, "repost", make_detail())
    db.execute("UPDATE listings SET canonical_id = 'original' WHERE id = 'repost'")
    db.commit()

    listings = client.get("/api/listings").json()["listings"]

    assert [listing["id"] for listing in listings] == ["original"]


def test_respects_limit(db, client):
    for i in range(3):
        store.save_detail(db, f"listing-{i}", make_detail())
    db.commit()

    assert len(client.get("/api/listings?limit=2").json()["listings"]) == 2


def test_gets_one_listing_with_display_photos(db, client):
    store.save_detail(
        db,
        "unit",
        make_detail(photos=["https://images.craigslist.org/a_600x450.jpg"], photo_count=1),
    )
    db.commit()

    response = client.get("/api/listings/unit")

    assert response.status_code == 200
    assert response.json()["id"] == "unit"
    assert response.json()["photos"] == ["https://images.craigslist.org/a_1200x900.jpg"]


def test_unknown_listing_returns_404(db, client):
    assert client.get("/api/listings/missing").status_code == 404


def test_missing_database_returns_503(tmp_path: Path, monkeypatch: pytest.MonkeyPatch, client):
    monkeypatch.setattr(config, "DB_PATH", tmp_path / "missing.db")

    response = client.get("/api/listings")

    assert response.status_code == 503
