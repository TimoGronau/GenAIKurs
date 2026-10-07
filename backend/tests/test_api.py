import pytest
from fastapi.testclient import TestClient

import main
import storage


# Stellt für jeden Test leere JSON-Dateien im temporären Verzeichnis bereit.
@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "DATA_DIR", tmp_path)
    monkeypatch.setattr(storage, "RECIPES_FILE", tmp_path / "recipes.json")
    monkeypatch.setattr(storage, "PANTRY_FILE", tmp_path / "pantry.json")
    monkeypatch.setattr(storage, "SHOPPING_LIST_FILE", tmp_path / "shopping_list.json")
    return TestClient(main.app)


# Prüft Rezept anlegen, lesen, suchen, bearbeiten und löschen.
def test_recipe_crud_and_search(client):
    created_response = client.post(
        "/api/recipes",
        json={
            "name": "  Pfannkuchen  ",
            "ingredients": [{"name": "Eier", "amount": 2, "unit": "Stk"}],
            "steps": "Teig anrühren.",
        },
    )
    assert created_response.status_code == 201
    created = created_response.json()
    assert created["name"] == "Pfannkuchen"
    assert created["id"]

    assert client.get(f"/api/recipes/{created['id']}").json() == created
    assert [item["id"] for item in client.get("/api/recipes?q=eier").json()] == [created["id"]]

    updated_response = client.put(
        f"/api/recipes/{created['id']}",
        json={
            "name": "Omelett",
            "ingredients": [{"name": "Eier", "amount": 3, "unit": "Stk"}],
            "steps": "Stocken lassen.",
        },
    )
    assert updated_response.status_code == 200
    assert updated_response.json()["name"] == "Omelett"
    assert updated_response.json()["id"] == created["id"]

    assert client.delete(f"/api/recipes/{created['id']}").status_code == 204
    assert client.get(f"/api/recipes/{created['id']}").status_code == 404


# Prüft die serverseitige Pflichtfeld- und Zutatenvalidierung.
def test_create_recipe_rejects_blank_name_and_missing_ingredients(client):
    blank_name = client.post(
        "/api/recipes",
        json={"name": "   ", "ingredients": [{"name": "Mehl", "amount": 1, "unit": "g"}]},
    )
    no_ingredients = client.post(
        "/api/recipes",
        json={"name": "Kuchen", "ingredients": []},
    )

    assert blank_name.status_code == 422
    assert no_ingredients.status_code == 422


# Prüft Vorrat anlegen, Menge ändern und Eintrag löschen.
def test_pantry_crud(client):
    created_response = client.post(
        "/api/pantry",
        json={"name": "Tomaten", "amount": 4, "unit": "Stk"},
    )
    assert created_response.status_code == 201
    item = created_response.json()

    updated_response = client.put(
        f"/api/pantry/{item['id']}",
        json={"name": "Tomaten", "amount": 2, "unit": "Stk"},
    )
    assert updated_response.status_code == 200
    assert updated_response.json()["amount"] == 2
    assert client.get("/api/pantry").json() == [updated_response.json()]

    assert client.delete(f"/api/pantry/{item['id']}").status_code == 204
    assert client.get("/api/pantry").json() == []


# Prüft, dass der Koch-Endpunkt Rezeptmengen vom isolierten Vorrat abzieht.
def test_cook_recipe_deducts_pantry(client):
    recipe_response = client.post(
        "/api/recipes",
        json={
            "name": "Pasta",
            "ingredients": [{"name": "Nudeln", "amount": 250, "unit": "g"}],
            "steps": "Kochen.",
        },
    )
    pantry_response = client.post(
        "/api/pantry",
        json={"name": "Nudeln", "amount": 0.5, "unit": "kg"},
    )

    response = client.post(f"/api/recipes/{recipe_response.json()['id']}/cook")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": pantry_response.json()["id"],
            "name": "Nudeln",
            "amount": 0.25,
            "unit": "kg",
        }
    ]


# Prüft, dass unbekannte Vorrats-IDs mit 404 beantwortet werden.
def test_unknown_pantry_item_returns_not_found(client):
    response = client.delete("/api/pantry/unknown")

    assert response.status_code == 404


# Prüft Fehlmengen, Zusammenführen, Erledigt-Status und Entfernen auf der Einkaufsliste.
def test_shopping_list_adds_missing_amounts_and_supports_item_actions(client):
    recipe = client.post(
        "/api/recipes",
        json={
            "name": "Pasta",
            "ingredients": [
                {"name": "Nudeln", "amount": 500, "unit": "g"},
                {"name": "Salz", "amount": 1, "unit": "Prise"},
            ],
        },
    ).json()
    client.post("/api/pantry", json={"name": "Nudeln", "amount": 0.3, "unit": "kg"})

    first = client.post(f"/api/recipes/{recipe['id']}/shopping-list").json()
    assert first["added"] == 2
    assert {(item["name"], item["amount"], item["unit"]) for item in first["items"]} == {
        ("Nudeln", 200, "g"),
        ("Salz", 1, "Prise"),
    }
    noodles = next(item for item in first["items"] if item["name"] == "Nudeln")
    client.patch(f"/api/shopping-list/{noodles['id']}", json={"done": True})

    second = client.post(f"/api/recipes/{recipe['id']}/shopping-list").json()
    noodles = next(item for item in second["items"] if item["name"] == "Nudeln")
    assert noodles["amount"] == 400
    assert noodles["done"] is False

    updated = client.patch(
        f"/api/shopping-list/{noodles['id']}", json={"done": True}
    )
    assert updated.json()["done"] is True
    assert client.delete(f"/api/shopping-list/{noodles['id']}").status_code == 204
    assert len(client.get("/api/shopping-list").json()) == 1


def test_shopping_list_reports_recipe_with_no_missing_ingredients(client):
    recipe = client.post(
        "/api/recipes",
        json={"name": "Toast", "ingredients": [{"name": "Brot", "amount": 2, "unit": "Stk"}]},
    ).json()
    client.post("/api/pantry", json={"name": "Brot", "amount": 2, "unit": "Stk"})

    response = client.post(f"/api/recipes/{recipe['id']}/shopping-list")

    assert response.status_code == 200
    assert response.json() == {"items": [], "added": 0}
