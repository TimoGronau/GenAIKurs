// Zentrale Funktionen fuer alle Backend-Aufrufe (REST-API).
// Dank Vite-Proxy reicht der relative Pfad /api.

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // keine JSON-Antwort
    }
    throw new Error(typeof detail === "string" ? detail : "Fehler bei der Anfrage.");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Rezepte
  listRecipes: (q = "") => request(`/recipes?q=${encodeURIComponent(q)}`),
  getRecipe: (id) => request(`/recipes/${id}`),
  createRecipe: (recipe) => request("/recipes", { method: "POST", body: JSON.stringify(recipe) }),
  updateRecipe: (id, recipe) => request(`/recipes/${id}`, { method: "PUT", body: JSON.stringify(recipe) }),
  deleteRecipe: (id) => request(`/recipes/${id}`, { method: "DELETE" }),
  cookRecipe: (id) => request(`/recipes/${id}/cook`, { method: "POST" }),

  // Vorrat
  listPantry: () => request("/pantry"),
  addPantry: (item) => request("/pantry", { method: "POST", body: JSON.stringify(item) }),
  updatePantry: (id, item) => request(`/pantry/${id}`, { method: "PUT", body: JSON.stringify(item) }),
  deletePantry: (id) => request(`/pantry/${id}`, { method: "DELETE" }),

  // Heute kochen
  cookable: (maxMissing = 3) => request(`/cookable?max_missing=${maxMissing}`),
};

export const UNITS = ["g", "kg", "ml", "l", "Stk", "EL", "TL", "Prise"];

export function fmt(amount, unit) {
  if (!amount && amount !== 0) return unit;
  const rounded = Math.round(amount * 1000) / 1000;
  return `${rounded} ${unit}`.trim();
}
