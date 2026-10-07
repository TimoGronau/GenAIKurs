"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import { UNIT_OPTIONS } from "@/lib/format";

// US-07, US-08, US-09: Vorrat erfassen, anzeigen und ändern
export default function Pantry({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ name: "", amount: "", unit: "g" });
  const [error, setError] = useState(null);

  async function call(method, url, body) {
    setError(null);
    try {
      setItems(await api(method, url, body));
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim() || !(Number(form.amount) > 0)) {
      setError("Bitte Lebensmittel und eine Menge größer 0 angeben.");
      return;
    }
    if (await call("POST", "/api/pantry", { ...form, amount: Number(form.amount) })) {
      setForm({ name: "", amount: "", unit: form.unit });
    }
  }

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, "de"));

  return (
    <>
      <form className="row g-2 mb-3" onSubmit={add} noValidate>
        <div className="col-12 col-sm">
          <input id="p-name" className="form-control" placeholder="Lebensmittel" aria-label="Lebensmittel" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="col-4 col-sm-auto">
          <input id="p-amount" type="number" min="0" step="any" className="form-control amount-input" placeholder="Menge" aria-label="Menge" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div className="col-4 col-sm-auto">
          <select id="p-unit" className="form-select" aria-label="Einheit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="col-4 col-sm-auto">
          <button type="submit" className="btn btn-primary w-100">Hinzufügen</button>
        </div>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {sorted.length ? (
        <ul className="list-group">
          {sorted.map((item) => (
            <li key={item.id} className="list-group-item d-flex align-items-center justify-content-between gap-2">
              <span className="text-break">{item.name}</span>
              <span className="d-flex align-items-center gap-2">
                <input
                  key={item.amount}
                  id={`p-item-${item.id}`}
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm amount-input"
                  aria-label={`Menge ${item.name}`}
                  defaultValue={item.amount}
                  onBlur={(e) => Number(e.target.value) !== item.amount && call("PUT", `/api/pantry/${item.id}`, { amount: Number(e.target.value) })}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                />
                <span className="text-body-secondary" style={{ minWidth: "3em" }}>{item.unit}</span>
                <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`${item.name} entfernen`} onClick={() => call("DELETE", `/api/pantry/${item.id}`)}>✕</button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-secondary text-center py-4">Dein Vorrat ist leer.</p>
      )}
    </>
  );
}
