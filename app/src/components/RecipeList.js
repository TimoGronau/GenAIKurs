"use client";

import Link from "next/link";
import { useState } from "react";
import { searchRecipes } from "@/lib/logic";

// US-02 + US-06: alphabetische Übersicht mit Suche nach Name oder Zutat
export default function RecipeList({ recipes }) {
  const [query, setQuery] = useState("");
  const results = searchRecipes(recipes, query);

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <input
          id="recipe-search"
          type="search"
          className="form-control flex-grow-1 w-auto"
          style={{ minWidth: 200 }}
          placeholder="Nach Name oder Zutat suchen …"
          aria-label="Rezepte suchen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link href="/rezepte/neu" className="btn btn-primary">+ Neues Rezept</Link>
      </div>

      {results.length ? (
        <div className="list-group">
          {results.map((r) => (
            <Link key={r.id} href={`/rezepte/${r.id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <span>{r.name}</span>
              <small className="text-body-secondary">{r.ingredients.length} Zutaten</small>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary text-center py-4">
          {recipes.length ? "Keine Rezepte gefunden." : "Noch keine Rezepte angelegt."}
        </p>
      )}
    </>
  );
}
