import pytest

from .conftest import make_detail, store


@pytest.fixture
def listings(db):
    units = {
        "studio-van": make_detail(price_cad=1500, bedrooms="0", bathrooms=1.0, city="Vancouver"),
        "two-bed-burnaby": make_detail(price_cad=2600, bedrooms="2", bathrooms=1.0, city="Burnaby"),
        "house-north-van": make_detail(
            price_cad=4800, bedrooms="3", bathrooms=2.0, city="North Vancouver", property_type="House"
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
        ("min_bedrooms=2", {"two-bed-burnaby", "house-north-van"}),
        ("min_bathrooms=2", {"house-north-van"}),
        ("city=Burnaby&city=Vancouver", {"studio-van", "two-bed-burnaby", "unknown-beds"}),
        ("property_type=House", {"house-north-van"}),
        ("city=Burnaby&min_bedrooms=1", {"two-bed-burnaby"}),
    ],
)
def test_filters_listings(client, query, expected):
    assert ids(client, query) == expected


@pytest.mark.usefixtures("listings")
def test_rejects_negative_filters(client):
    assert client.get("/api/listings?min_price=-1").status_code == 422


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
        "min_price": 1500,
        "max_price": 4800,
    }
