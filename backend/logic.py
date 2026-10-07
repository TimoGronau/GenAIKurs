"""Reine Fachlogik der Kochbuch-App (portiert aus app/logic.js).

Keine Abhaengigkeiten zu FastAPI oder Dateien, damit sie leicht testbar bleibt.
"""
from __future__ import annotations

# Einheiten werden auf eine Basiseinheit umgerechnet, damit z. B. 1 kg und 500 g vergleichbar sind.
UNITS: dict[str, dict] = {
    "g": {"base": "g", "factor": 1},
    "kg": {"base": "g", "factor": 1000},
    "ml": {"base": "ml", "factor": 1},
    "l": {"base": "ml", "factor": 1000},
    "stk": {"base": "stk", "factor": 1},
    "stück": {"base": "stk", "factor": 1},
    "el": {"base": "el", "factor": 1},
    "tl": {"base": "tl", "factor": 1},
    "prise": {"base": "prise", "factor": 1},
}

_EPS = 1e-9


def normalize_name(name) -> str:
    return str(name or "").strip().lower()


def _num(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def to_base(amount, unit) -> tuple[float, str]:
    key = normalize_name(unit)
    u = UNITS.get(key)
    if not u:
        return _num(amount), key
    return _num(amount) * u["factor"], u["base"]


def from_base(amount: float, base_unit: str, target_unit) -> float:
    u = UNITS.get(normalize_name(target_unit))
    if not u or u["base"] != base_unit:
        return amount
    return amount / u["factor"]


def _round(n: float) -> float:
    return round(n * 1000) / 1000


def pantry_index(pantry: list[dict]) -> dict[str, float]:
    """Summiert den Vorrat je Lebensmittel und Basiseinheit."""
    index: dict[str, float] = {}
    for item in pantry:
        amount, unit = to_base(item.get("amount"), item.get("unit"))
        key = normalize_name(item.get("name")) + "|" + unit
        index[key] = index.get(key, 0.0) + amount
    return index


def missing_ingredients(recipe: dict, pantry: list[dict]) -> list[dict]:
    """Liefert die fehlenden (oder nicht ausreichend vorhandenen) Zutaten eines Rezepts."""
    index = pantry_index(pantry)
    missing: list[dict] = []
    for ing in recipe.get("ingredients", []):
        need_amount, need_unit = to_base(ing.get("amount"), ing.get("unit"))
        key = normalize_name(ing.get("name")) + "|" + need_unit
        have = index.get(key, 0.0)
        if have + _EPS < need_amount:
            missing.append({
                "name": ing.get("name"),
                "unit": ing.get("unit"),
                "amount": from_base(need_amount - have, need_unit, ing.get("unit")),
                "partial": have > 0,
            })
    return missing


def add_to_shopping_list(missing: list[dict], items: list[dict]) -> tuple[list[dict], int]:
    """Fuegt Fehlmengen hinzu und summiert gleiche Zutaten mit gleicher Einheit."""
    result = [dict(item) for item in items]
    for ingredient in missing:
        match = next((
            item for item in result
            if normalize_name(item.get("name")) == normalize_name(ingredient.get("name"))
            and normalize_name(item.get("unit")) == normalize_name(ingredient.get("unit"))
        ), None)
        if match:
            match["amount"] = _round(_num(match.get("amount")) + _num(ingredient.get("amount")))
            match["done"] = False
        else:
            result.append({
                "id": ingredient.get("id"),
                "name": ingredient.get("name"),
                "amount": _round(_num(ingredient.get("amount"))),
                "unit": ingredient.get("unit"),
                "done": False,
            })
    return result, len(missing)


def _by_name_key(name) -> str:
    return normalize_name(name)


def classify_recipes(recipes: list[dict], pantry: list[dict], max_missing: int = 3) -> dict:
    """US-10 / US-11: teilt Rezepte in kochbar und fast kochbar."""
    cookable: list[dict] = []
    almost: list[dict] = []
    for recipe in recipes:
        missing = missing_ingredients(recipe, pantry)
        if not missing:
            cookable.append(recipe)
        elif len(missing) <= max_missing:
            almost.append({"recipe": recipe, "missing": missing})
    cookable.sort(key=lambda r: _by_name_key(r.get("name")))
    almost.sort(key=lambda a: (len(a["missing"]), _by_name_key(a["recipe"].get("name"))))
    return {"cookable": cookable, "almost": almost}


def deduct_recipe(recipe: dict, pantry: list[dict]) -> list[dict]:
    """US-12: zieht die Zutaten eines Rezepts vom Vorrat ab; leere Eintraege entfallen."""
    result = [dict(p) for p in pantry]
    for ing in recipe.get("ingredients", []):
        need_amount, need_unit = to_base(ing.get("amount"), ing.get("unit"))
        remaining = need_amount
        for item in result:
            if remaining <= 0:
                break
            have_amount, have_unit = to_base(item.get("amount"), item.get("unit"))
            if normalize_name(item.get("name")) != normalize_name(ing.get("name")) or have_unit != need_unit:
                continue
            take = min(have_amount, remaining)
            remaining -= take
            item["amount"] = _round(from_base(have_amount - take, have_unit, item.get("unit")))
    return [item for item in result if _num(item.get("amount")) > _EPS]


def search_recipes(recipes: list[dict], query: str) -> list[dict]:
    """US-06: Suche nach Rezeptname oder Zutat."""
    q = normalize_name(query)
    if q:
        result = [
            r for r in recipes
            if q in normalize_name(r.get("name"))
            or any(q in normalize_name(i.get("name")) for i in r.get("ingredients", []))
        ]
    else:
        result = list(recipes)
    result.sort(key=lambda r: _by_name_key(r.get("name")))
    return result
