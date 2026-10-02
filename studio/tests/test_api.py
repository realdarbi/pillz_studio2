import pytest
from django.test import Client


@pytest.fixture
def client():
    return Client()


def test_item_detail(client):
    response = client.get("/items/42/")
    assert response.status_code == 200
    assert response.json()["item_id"] == 42


def test_users_optional_params(client):
    response = client.get("/users/?name=Alice&age=25")
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"
    assert response.json()["age"] == 25


def test_users_no_params(client):
    response = client.get("/users/")
    assert response.status_code == 200
    assert response.json()["name"] is None
    assert response.json()["age"] is None


def test_status(client):
    response = client.get("/status/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_item(client):
    response = client.post(
        "/items/",
        data='{"name": "test"}',
        content_type="application/json",
    )
    assert response.status_code == 201
    assert response.json()["created"] is True