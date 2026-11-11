import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app

# Build test databases with the collector's own store so the API is tested against its real schema.
sys.path.insert(0, str(config.REPO_ROOT / "data-collector"))
from collector import store  # noqa: E402


def make_detail(**overrides) -> dict:
    detail = {
        "url": "https://vancouver.craigslist.org/apa/d/example/1.html",
        "title": "Bright 1BR near Main St",
        "price_cad": 2200,
        "bedrooms": "1",
        "bathrooms": 1.0,
        "sqft": None,
        "property_type": "Apartment",
        "address": "123 Main St",
        "city": "Vancouver",
        "postal_code": "V5T 1A1",
        "latitude": 49.26,
        "longitude": -123.1,
        "posted_at": "2026-11-10T09:00:00-0800",
        "body": "Close to transit.",
        "photo_count": 0,
        "photos": [],
    }
    return {**detail, **overrides}


@pytest.fixture
def db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db_path = tmp_path / "listings.db"
    monkeypatch.setattr(config, "DB_PATH", db_path)
    conn = store.connect(db_path)
    yield conn
    conn.close()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
