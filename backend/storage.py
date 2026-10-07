"""Einfacher Datei-Datenspeicher (JSON) statt Datenbank."""
from __future__ import annotations

import json
import secrets
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
RECIPES_FILE = DATA_DIR / "recipes.json"
PANTRY_FILE = DATA_DIR / "pantry.json"


def new_id() -> str:
    return secrets.token_hex(4)


def _read(path: Path) -> list[dict]:
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _write(path: Path, data: list[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def read_recipes() -> list[dict]:
    return _read(RECIPES_FILE)


def write_recipes(recipes: list[dict]) -> None:
    _write(RECIPES_FILE, recipes)


def read_pantry() -> list[dict]:
    return _read(PANTRY_FILE)


def write_pantry(pantry: list[dict]) -> None:
    _write(PANTRY_FILE, pantry)
