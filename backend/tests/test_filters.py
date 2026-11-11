import pytest

from .conftest import make_detail, store


@pytest.fixture
def listings(db):
    units = {
        "studio-van": make_detail(
            price_cad=1500, bedrooms="0", bathrooms=1.0, sqft=450, city="Vancouver"
        ),
        "two-bed-burnaby": make_detail(
            price_cad=2600, bedrooms="2", bathrooms=1.0, sqft=800, city="Burnaby"
        ),
        "house-north-van": make_detail(
            price_cad=4800,
            bedrooms="3",
            bathrooms=2.0,
            sqft=1600,
            city="North Vancouver",
            property_type="House",
        ),
        "unknown-beds": make_detail(price_cad=2000, bedrooms=None, bathrooms=None, city="Burnaby"),
    }
    for listing_id, detail in units.items():
        store.save_detail(db, listing_id, detail)
    db.commit()


def ids(client, query: str) -> set[str]:
    response = client.get(f"/api/listings?{query}")
    assert response.status_code == 200
    return {listing["id"] for listing in response.json()["listings"]}


@pytest.mark.usefixtures("listings")
@pytest.mark.parametrize(
    ("query", "expected"),
    [
        ("min_price=2000&max_price=3000", {"two-bed-burnaby", "unknown-beds"}),
        ("max_price=2600", {"studio-van", "two-bed-burnaby", "unknown-beds"}),
        ("bedrooms=2", {"two-bed-burnaby"}),
        ("bedrooms=0&bedrooms=3", {"studio-van", "house-north-van"}),
        ("bathrooms=2", {"house-north-van"}),
        ("bathrooms=1&bathrooms=2", {"studio-van", "two-bed-burnaby", "house-north-van"}),
        ("city=Burnaby&city=Vancouver", {"studio-van", "two-bed-burnaby", "unknown-beds"}),
        ("property_type=House", {"house-north-van"}),
        ("min_sqft=800", {"two-bed-burnaby", "house-north-van"}),
        ("city=Burnaby&bedrooms=2&bedrooms=3", {"two-bed-burnaby"}),
    ],
)
def test_filters_listings(client, query, expected):
    assert ids(client, query) == expected


@pytest.mark.usefixtures("listings")
@pytest.mark.parametrize(("query", "expected"), [("", 4), ("city=Burnaby", 2), ("min_sqft=5000", 0)])
def test_counts_matching_listings(client, query, expected):
    response = client.get(f"/api/listings/count?{query}")

    assert response.status_code == 200
    assert response.json() == {"count": expected}


@pytest.mark.usefixtures("listings")
def test_rejects_negative_filters(client):
    assert client.get("/api/listings?min_price=-1").status_code == 422
    assert client.get("/api/listings?bedrooms=-1").status_code == 422


@pytest.mark.usefixtures("listings")
def test_filter_options_reflect_the_data(client):
    response = client.get("/api/listings/filter-options")

    assert response.status_code == 200
    assert response.json() == {
        "cities": [
            {"value": "Burnaby", "count": 2},
            {"value": "North Vancouver", "count": 1},
            {"value": "Vancouver", "count": 1},
        ],
        "property_types": [
            {"value": "Apartment", "count": 3},
            {"value": "House", "count": 1},
        ],
        "bedrooms": [
            {"value": 0, "count": 1},
            {"value": 2, "count": 1},
            {"value": 3, "count": 1},
        ],
        "bathrooms": [
            {"value": 1.0, "count": 2},
            {"value": 2.0, "count": 1},
        ],
        "min_price": 1500,
        "max_price": 4800,
        "min_sqft": 450,
        "max_sqft": 1600,
    }
