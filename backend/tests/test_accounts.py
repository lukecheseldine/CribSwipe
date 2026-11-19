import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "APP_DB_PATH", tmp_path / "app.db")
    return TestClient(app)


def signup(client, **overrides):
    body = {"name": "Ada Lovelace", "identifier": "ada@example.com", "password": "password1"}
    body.update(overrides)
    return client.post("/api/auth/signup", json=body)


def test_signup_login_and_logout(client):
    created = signup(client)
    assert created.status_code == 201
    assert created.json()["email"] == "ada@example.com"
    assert client.get("/api/account").status_code == 200

    logged_out = client.post("/api/auth/logout")
    assert logged_out.status_code == 204
    assert client.get("/api/account").status_code == 401

    logged_in = client.post(
        "/api/auth/login", json={"identifier": "Ada@Example.com", "password": "password1"}
    )
    assert logged_in.status_code == 200
    assert logged_in.json()["name"] == "Ada Lovelace"


def test_phone_login_accepts_equivalent_numbers(client):
    assert signup(client, identifier="604 555 0134").status_code == 201
    client.post("/api/auth/logout")
    response = client.post(
        "/api/auth/login", json={"identifier": "+1 (604) 555-0134", "password": "password1"}
    )
    assert response.status_code == 200
    assert response.json()["phone"] == "6045550134"


def test_rejects_duplicate_and_weak_password(client):
    assert signup(client).status_code == 201
    client.post("/api/auth/logout")
    assert signup(client).status_code == 409
    assert signup(client, identifier="other@example.com", password="short").status_code == 422
    assert signup(client, name="Ada", identifier="other@example.com").status_code == 422


def test_wrong_password_does_not_sign_in(client):
    signup(client)
    client.post("/api/auth/logout")
    response = client.post(
        "/api/auth/login", json={"identifier": "ada@example.com", "password": "password2"}
    )
    assert response.status_code == 401
    assert client.get("/api/account").status_code == 401


def test_saves_profile_filters_and_shortlist(client):
    signup(client)
    profile = client.put(
        "/api/account/profile",
        json={"name": "Ada Byron", "email": "ada@example.com", "phone": "6045550100", "photo": None},
    )
    assert profile.status_code == 200
    assert profile.json()["name"] == "Ada Byron"
    assert profile.json()["phone"] == "6045550100"

    filters = client.put(
        "/api/account/filters",
        json={"max_price": 3000, "bedrooms": [1, 2], "min_sqft": 700, "pet_friendly": True},
    )
    assert filters.status_code == 200
    assert filters.json()["default_filters"]["max_price"] == 3000
    assert filters.json()["default_filters"]["bedrooms"] == [1, 2]

    listing = {"id": "unit-1", "title": "Garden suite", "priceCad": 2200, "photos": []}
    saved = client.post("/api/account/shortlist", json={"listing": listing})
    assert saved.status_code == 200
    assert saved.json()["shortlist"][0]["listing"]["id"] == "unit-1"

    removed = client.delete("/api/account/shortlist/unit-1")
    assert removed.json()["shortlist"] == []

    client.post("/api/auth/logout")
    again = client.post("/api/auth/login", json={"identifier": "ada@example.com", "password": "password1"})
    assert again.json()["default_filters"]["min_sqft"] == 700
    assert again.json()["name"] == "Ada Byron"
