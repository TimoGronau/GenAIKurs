// Fachlogik der Kochbuch-App (ohne React), auf Server und Client nutzbar.
// Einheiten werden auf eine Basiseinheit umgerechnet, damit z. B. 1 kg und 500 g vergleichbar sind.
export const UNITS = {
  g: { base: "g", factor: 1 },
  kg: { base: "g", factor: 1000 },
  ml: { base: "ml", factor: 1 },
  l: { base: "ml", factor: 1000 },
  stk: { base: "stk", factor: 1 },
  "stück": { base: "stk", factor: 1 },
  el: { base: "el", factor: 1 },
  tl: { base: "tl", factor: 1 },
  prise: { base: "prise", factor: 1 },
};

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function toBase(amount, unit) {
  const key = normalizeName(unit);
  const u = UNITS[key];
  if (!u) return { amount: Number(amount) || 0, unit: key };
  return { amount: (Number(amount) || 0) * u.factor, unit: u.base };
}

function fromBase(amount, baseUnit, targetUnit) {
  const u = UNITS[normalizeName(targetUnit)];
  if (!u || u.base !== baseUnit) return amount;
  return amount / u.factor;
}

// Summiert den Vorrat je Lebensmittel und Basiseinheit.
function pantryIndex(pantry) {
  const index = new Map();
  for (const item of pantry) {
    const b = toBase(item.amount, item.unit);
    const key = normalizeName(item.name) + "|" + b.unit;
    index.set(key, (index.get(key) || 0) + b.amount);
  }
  return index;
}

// Liefert die fehlenden (oder nicht ausreichend vorhandenen) Zutaten eines Rezepts.
export function missingIngredients(recipe, pantry) {
  const index = pantryIndex(pantry);
  const missing = [];
  for (const ing of recipe.ingredients) {
    const need = toBase(ing.amount, ing.unit);
    const key = normalizeName(ing.name) + "|" + need.unit;
    const have = index.get(key) || 0;
    if (have + 1e-9 < need.amount) {
      missing.push({
        name: ing.name,
        unit: ing.unit,
        amount: fromBase(need.amount - have, need.unit, ing.unit),
        partial: have > 0,
      });
    }
  }
  return missing;
}

// US-10 / US-11: teilt Rezepte in kochbar und fast kochbar (nach Anzahl fehlender Zutaten sortiert).
export function classifyRecipes(recipes, pantry, maxMissing) {
  const limit = maxMissing == null ? 3 : maxMissing;
  const cookable = [];
  const almost = [];
  for (const recipe of recipes) {
    const missing = missingIngredients(recipe, pantry);
    if (missing.length === 0) cookable.push(recipe);
    else if (missing.length <= limit) almost.push({ recipe, missing });
  }
  cookable.sort(byName);
  almost.sort((a, b) => a.missing.length - b.missing.length || byName(a.recipe, b.recipe));
  return { cookable, almost };
}

// US-12: zieht die Zutaten eines Rezepts vom Vorrat ab; leere Einträge werden entfernt.
export function deductRecipe(recipe, pantry) {
  const result = pantry.map((p) => Object.assign({}, p));
  for (const ing of recipe.ingredients) {
    const need = toBase(ing.amount, ing.unit);
    let remaining = need.amount;
    for (const item of result) {
      if (remaining <= 0) break;
      const have = toBase(item.amount, item.unit);
      if (normalizeName(item.name) !== normalizeName(ing.name) || have.unit !== need.unit) continue;
      const take = Math.min(have.amount, remaining);
      remaining -= take;
      item.amount = round(fromBase(have.amount - take, have.unit, item.unit));
    }
  }
  return result.filter((item) => item.amount > 1e-9);
}

// US-06: Suche nach Rezeptname oder Zutat.
export function searchRecipes(recipes, query) {
  const q = normalizeName(query);
  const list = q
    ? recipes.filter(
        (r) =>
          normalizeName(r.name).includes(q) ||
          r.ingredients.some((i) => normalizeName(i.name).includes(q))
      )
    : recipes.slice();
  return list.sort(byName);
}

// US-01: Validierung beim Anlegen/Bearbeiten.
export function validateRecipe(recipe) {
  const errors = [];
  if (!String(recipe.name || "").trim()) errors.push("Bitte einen Namen angeben.");
  const ingredients = (recipe.ingredients || []).filter((i) => String(i.name || "").trim());
  if (ingredients.length === 0) errors.push("Bitte mindestens eine Zutat angeben.");
  return errors;
}

function byName(a, b) {
  return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}
