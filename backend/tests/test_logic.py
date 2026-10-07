import logic


# Prüft Umrechnung und Erkennung teilweise fehlender Zutaten.
def test_missing_ingredients_converts_units_and_reports_partial_amount():
    recipe = {
        "name": "Kuchen",
        "ingredients": [{"name": "Mehl", "amount": 500, "unit": "g"}],
    }
    pantry = [{"name": "mehl", "amount": 0.3, "unit": "kg"}]

    assert logic.missing_ingredients(recipe, pantry) == [
        {"name": "Mehl", "unit": "g", "amount": 200, "partial": True}
    ]


# Prüft Kochbarkeit sowie Sortierung nach fehlenden Zutaten und Rezeptnamen.
def test_classify_recipes_sorts_and_excludes_recipes_over_missing_limit():
    recipes = [
        {"name": "Z Single", "ingredients": [{"name": "Beans", "amount": 2, "unit": "Stk"}]},
        {"name": "C Two", "ingredients": [
            {"name": "Oil", "amount": 1, "unit": "ml"},
            {"name": "Salt", "amount": 1, "unit": "g"},
        ]},
        {"name": "A Ready", "ingredients": [{"name": "Water", "amount": 1, "unit": "ml"}]},
        {"name": "A Single", "ingredients": [{"name": "Eggs", "amount": 2, "unit": "Stk"}]},
        {"name": "Far", "ingredients": [
            {"name": f"Missing {index}", "amount": 1, "unit": "g"}
            for index in range(4)
        ]},
    ]
    pantry = [
        {"name": "Beans", "amount": 1, "unit": "Stk"},
        {"name": "Eggs", "amount": 1, "unit": "Stk"},
        {"name": "Water", "amount": 1, "unit": "ml"},
    ]

    result = logic.classify_recipes(recipes, pantry, max_missing=3)

    assert [recipe["name"] for recipe in result["cookable"]] == ["A Ready"]
    assert [entry["recipe"]["name"] for entry in result["almost"]] == [
        "A Single", "Z Single", "C Two"
    ]
    assert result["almost"][0]["missing"] == [
        {"name": "Eggs", "unit": "Stk", "amount": 1, "partial": True}
    ]


# Prüft Suche nach Namen oder Zutaten ohne Beachtung der Großschreibung.
def test_search_recipes_matches_names_and_ingredients():
    recipes = [
        {"name": "Z Pasta", "ingredients": [{"name": "Tomate", "amount": 1, "unit": "Stk"}]},
        {"name": "Apfelkuchen", "ingredients": [{"name": "Mehl", "amount": 200, "unit": "g"}]},
    ]

    assert [recipe["name"] for recipe in logic.search_recipes(recipes, "MEHL")] == [
        "Apfelkuchen"
    ]
    assert [recipe["name"] for recipe in logic.search_recipes(recipes, "pasta")] == [
        "Z Pasta"
    ]


# Prüft, dass Mengen über mehrere Vorratseinträge abgezogen und leere entfernt werden.
def test_deduct_recipe_uses_multiple_items_and_preserves_input():
    recipe = {
        "name": "Pasta",
        "ingredients": [{"name": "Nudeln", "amount": 300, "unit": "g"}],
    }
    pantry = [
        {"id": "one", "name": "Nudeln", "amount": 0.2, "unit": "kg"},
        {"id": "two", "name": "nudeln", "amount": 150, "unit": "g"},
        {"id": "other", "name": "Salz", "amount": 2, "unit": "Prise"},
    ]

    result = logic.deduct_recipe(recipe, pantry)

    assert result == [
        {"id": "two", "name": "nudeln", "amount": 50.0, "unit": "g"},
        {"id": "other", "name": "Salz", "amount": 2, "unit": "Prise"},
    ]
    assert pantry[0]["amount"] == 0.2
