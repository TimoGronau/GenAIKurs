"""FastAPI-App der Kochbuch-App.

Starten:  uvicorn main:app --reload
API-Doku: http://localhost:8000/docs
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import logic
import storage
from models import (
    PantryItem,
    PantryItemIn,
    Recipe,
    RecipeIn,
    ShoppingListItem,
    ShoppingListItemUpdate,
)

app = FastAPI(title="Kochbuch API", version="1.0.0")

# CORS: erlaubt dem Vue-Dev-Server (Port 5173) den Zugriff.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Rezepte ----------

@app.get("/api/recipes", response_model=list[Recipe])
def list_recipes(q: str = "") -> list[dict]:
    """US-02 + US-06: alle Rezepte, optional gefiltert nach Name/Zutat."""
    return logic.search_recipes(storage.read_recipes(), q)


@app.get("/api/recipes/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: str) -> dict:
    """US-03: ein Rezept im Detail."""
    recipe = _find(storage.read_recipes(), recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden.")
    return recipe


@app.post("/api/recipes", response_model=Recipe, status_code=201)
def create_recipe(payload: RecipeIn) -> dict:
    """US-01: neues Rezept anlegen."""
    recipes = storage.read_recipes()
    recipe = payload.model_dump()
    recipe["id"] = storage.new_id()
    recipes.append(recipe)
    storage.write_recipes(recipes)
    return recipe


@app.put("/api/recipes/{recipe_id}", response_model=Recipe)
def update_recipe(recipe_id: str, payload: RecipeIn) -> dict:
    """US-04: Rezept bearbeiten."""
    recipes = storage.read_recipes()
    if _find(recipes, recipe_id) is None:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden.")
    updated = payload.model_dump()
    updated["id"] = recipe_id
    recipes = [updated if r.get("id") == recipe_id else r for r in recipes]
    storage.write_recipes(recipes)
    return updated


@app.delete("/api/recipes/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: str) -> None:
    """US-05: Rezept loeschen (Sicherheitsabfrage erfolgt im Frontend)."""
    recipes = storage.read_recipes()
    if _find(recipes, recipe_id) is None:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden.")
    storage.write_recipes([r for r in recipes if r.get("id") != recipe_id])


@app.post("/api/recipes/{recipe_id}/cook", response_model=list[PantryItem])
def cook_recipe(recipe_id: str) -> list[dict]:
    """US-12: Zutaten des Rezepts vom Vorrat abziehen."""
    recipe = _find(storage.read_recipes(), recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden.")
    pantry = logic.deduct_recipe(recipe, storage.read_pantry())
    storage.write_pantry(pantry)
    return pantry


@app.post("/api/recipes/{recipe_id}/shopping-list")
def add_recipe_missing_to_shopping_list(recipe_id: str) -> dict:
    """US-13: fehlende Rezeptzutaten zur Einkaufsliste hinzufügen."""
    recipe = _find(storage.read_recipes(), recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden.")
    missing = [
        {**ingredient, "id": storage.new_id()}
        for ingredient in logic.missing_ingredients(recipe, storage.read_pantry())
    ]
    items, added = logic.add_to_shopping_list(missing, storage.read_shopping_list())
    if added:
        storage.write_shopping_list(items)
    return {"items": items, "added": added}


# ---------- Vorrat ----------

@app.get("/api/pantry", response_model=list[PantryItem])
def list_pantry() -> list[dict]:
    """US-08: Vorrat anzeigen."""
    items = storage.read_pantry()
    items.sort(key=lambda i: logic.normalize_name(i.get("name")))
    return items


@app.post("/api/pantry", response_model=PantryItem, status_code=201)
def add_pantry(payload: PantryItemIn) -> dict:
    """US-07: Lebensmittel hinzufuegen."""
    pantry = storage.read_pantry()
    item = payload.model_dump()
    item["id"] = storage.new_id()
    pantry.append(item)
    storage.write_pantry(pantry)
    return item


@app.put("/api/pantry/{item_id}", response_model=PantryItem)
def update_pantry(item_id: str, payload: PantryItemIn) -> dict:
    """US-09: Menge aendern."""
    pantry = storage.read_pantry()
    if _find(pantry, item_id) is None:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden.")
    updated = payload.model_dump()
    updated["id"] = item_id
    pantry = [updated if i.get("id") == item_id else i for i in pantry]
    storage.write_pantry(pantry)
    return updated


@app.delete("/api/pantry/{item_id}", status_code=204)
def delete_pantry(item_id: str) -> None:
    """US-09: Lebensmittel entfernen."""
    pantry = storage.read_pantry()
    if _find(pantry, item_id) is None:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden.")
    storage.write_pantry([i for i in pantry if i.get("id") != item_id])


# ---------- Einkaufsliste ----------

@app.get("/api/shopping-list", response_model=list[ShoppingListItem])
def list_shopping_list() -> list[dict]:
    """US-13: Einkaufsliste anzeigen."""
    return storage.read_shopping_list()


@app.patch("/api/shopping-list/{item_id}", response_model=ShoppingListItem)
def update_shopping_list_item(item_id: str, payload: ShoppingListItemUpdate) -> dict:
    """US-13: Eintrag als erledigt markieren oder wieder öffnen."""
    items = storage.read_shopping_list()
    item = _find(items, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden.")
    updated = {**item, "done": payload.done}
    storage.write_shopping_list([updated if i.get("id") == item_id else i for i in items])
    return updated


@app.delete("/api/shopping-list/{item_id}", status_code=204)
def delete_shopping_list_item(item_id: str) -> None:
    """US-13: Eintrag von der Einkaufsliste entfernen."""
    items = storage.read_shopping_list()
    if _find(items, item_id) is None:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden.")
    storage.write_shopping_list([i for i in items if i.get("id") != item_id])


# ---------- Heute kochen ----------

@app.get("/api/cookable")
def cookable(max_missing: int = 3) -> dict:
    """US-10 + US-11: kochbare und fast kochbare Rezepte."""
    return logic.classify_recipes(
        storage.read_recipes(), storage.read_pantry(), max_missing
    )


# ---------- Hilfen ----------

def _find(items: list[dict], item_id: str) -> dict | None:
    return next((i for i in items if i.get("id") == item_id), None)
