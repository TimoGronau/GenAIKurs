"""Datenmodelle der Kochbuch-App (Validierung via Pydantic)."""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

# Erlaubte Einheiten (vgl. Prototyp app/logic.js)
UNITS = ["g", "kg", "ml", "l", "Stk", "EL", "TL", "Prise"]


class Ingredient(BaseModel):
    name: str
    amount: float = 0
    unit: str = "g"

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        return value.strip()


class RecipeIn(BaseModel):
    """Eingehendes Rezept (Anlegen/Bearbeiten). id wird serverseitig vergeben."""

    name: str = Field(..., min_length=1, description="US-01: Name ist Pflicht")
    ingredients: list[Ingredient] = Field(default_factory=list)
    steps: str = ""

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Bitte einen Namen angeben.")
        return value

    @field_validator("ingredients")
    @classmethod
    def at_least_one_ingredient(cls, value: list[Ingredient]) -> list[Ingredient]:
        # US-01: mindestens eine Zutat mit Namen
        named = [i for i in value if i.name.strip()]
        if not named:
            raise ValueError("Bitte mindestens eine Zutat angeben.")
        return named


class Recipe(RecipeIn):
    id: str


class PantryItemIn(BaseModel):
    name: str
    amount: float = 0
    unit: str = "g"

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Bitte ein Lebensmittel angeben.")
        return value


class PantryItem(PantryItemIn):
    id: str
