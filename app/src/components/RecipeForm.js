"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/client";
import { unitOptions } from "@/lib/format";
import { validateRecipe } from "@/lib/logic";

// US-01 + US-04: Rezept anlegen oder bearbeiten
export default function RecipeForm({ recipe }) {
  const router = useRouter();
  const nextKey = useRef(0);
  const row = (ing) => ({ key: nextKey.current++, name: "", amount: "", unit: "g", ...ing });

  const [name, setName] = useState(recipe?.name ?? "");
  const [steps, setSteps] = useState(recipe?.steps ?? "");
  const [rows, setRows] = useState(() => (recipe?.ingredients ?? [{}]).map(row));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const setRow = (key, field, value) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  async function submit(e) {
    e.preventDefault();
    const data = {
      name: name.trim(),
      steps: steps.trim(),
      ingredients: rows
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name.trim(), amount: Number(r.amount) || 0, unit: r.unit })),
    };
    const problems = validateRecipe(data);
    setErrors(problems);
    if (problems.length) return;

    setSaving(true);
    try {
      const saved = recipe
        ? await api("PUT", `/api/recipes/${recipe.id}`, data)
        : await api("POST", "/api/recipes", data);
      router.push(`/rezepte/${saved.id}`);
      router.refresh();
    } catch (err) {
      setErrors([err.message]);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label htmlFor="f-name" className="form-label fw-semibold">Name *</label>
        <input id="f-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <fieldset className="mb-3">
        <legend className="form-label fs-6 fw-semibold">Zutaten *</legend>
        {rows.map((r, i) => (
          <div key={r.key} className="row g-2 mb-2">
            <div className="col-12 col-sm">
              <input id={`f-ing-${r.key}`} className="form-control" placeholder="Zutat" aria-label={`Zutat ${i + 1}`} value={r.name} onChange={(e) => setRow(r.key, "name", e.target.value)} />
            </div>
            <div className="col-5 col-sm-auto">
              <input id={`f-amount-${r.key}`} type="number" min="0" step="any" className="form-control amount-input" placeholder="Menge" aria-label={`Menge ${i + 1}`} value={r.amount} onChange={(e) => setRow(r.key, "amount", e.target.value)} />
            </div>
            <div className="col-4 col-sm-auto">
              <select id={`f-unit-${r.key}`} className="form-select" aria-label={`Einheit ${i + 1}`} value={r.unit} onChange={(e) => setRow(r.key, "unit", e.target.value)}>
                {unitOptions(r.unit).map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="col-3 col-sm-auto">
              <button type="button" className="btn btn-outline-secondary w-100" aria-label={`Zutat ${i + 1} entfernen`} onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRows((rs) => [...rs, row()])}>+ Zutat</button>
      </fieldset>

      <div className="mb-3">
        <label htmlFor="f-steps" className="form-label fw-semibold">Zubereitung</label>
        <textarea id="f-steps" className="form-control" rows={6} value={steps} onChange={(e) => setSteps(e.target.value)} />
      </div>

      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <ul className="mb-0 ps-3">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Speichert …" : "Speichern"}</button>
        <Link href={recipe ? `/rezepte/${recipe.id}` : "/"} className="btn btn-outline-secondary">Abbrechen</Link>
      </div>
    </form>
  );
}
