// Gemeinsame Hilfen für die API-Routen: Eingaben bereinigen und Fehler einheitlich melden.
import { validateRecipe } from "./logic.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function handle(fn) {
  try {
    return Response.json(await fn());
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ error: "Interner Fehler auf dem Server." }, { status: 500 });
  }
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Ungültige Anfrage.");
  }
}

function text(value) {
  return String(value ?? "").trim();
}

function amount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function cleanRecipe(body) {
  const recipe = {
    name: text(body.name),
    ingredients: (Array.isArray(body.ingredients) ? body.ingredients : [])
      .map((i) => ({ name: text(i.name), amount: amount(i.amount), unit: text(i.unit) }))
      .filter((i) => i.name),
    steps: text(body.steps),
  };
  const errors = validateRecipe(recipe);
  if (errors.length) throw new HttpError(400, errors.join(" "));
  return recipe;
}

export function cleanPantryItem(body) {
  const item = { name: text(body.name), amount: amount(body.amount), unit: text(body.unit) };
  if (!item.name || !item.amount) throw new HttpError(400, "Bitte Lebensmittel und eine Menge größer 0 angeben.");
  return item;
}

export function findOrThrow(list, id, what) {
  const index = list.findIndex((x) => x.id === id);
  if (index === -1) throw new HttpError(404, `${what} nicht gefunden.`);
  return index;
}
