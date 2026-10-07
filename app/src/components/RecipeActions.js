"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/lib/client";
import ConfirmDialog from "./ConfirmDialog";

// Buttons der Detailansicht: bearbeiten (US-04), kochen (US-12), löschen (US-05)
export default function RecipeActions({ recipe, cookable }) {
  const router = useRouter();
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const close = useCallback(() => setDialog(null), []);

  async function run(action) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (e) {
      setMessage({ type: "danger", text: e.message });
    } finally {
      setBusy(false);
      setDialog(null);
    }
  }

  const remove = () =>
    run(async () => {
      await api("DELETE", `/api/recipes/${recipe.id}`);
      router.push("/");
      router.refresh();
    });

  const cook = () =>
    run(async () => {
      await api("POST", `/api/recipes/${recipe.id}/cook`);
      setMessage({ type: "success", text: "Vorrat aktualisiert. Guten Appetit!" });
      router.refresh();
    });

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mt-4">
        <Link href={`/rezepte/${recipe.id}/bearbeiten`} className="btn btn-outline-secondary">Bearbeiten</Link>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!cookable || busy}
          title={cookable ? undefined : "Dafür fehlen noch Zutaten im Vorrat."}
          onClick={() => setDialog("cook")}
        >
          Gekocht – Vorrat abziehen
        </button>
        <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => setDialog("delete")}>
          Löschen
        </button>
      </div>

      {message && <div className={`alert alert-${message.type} mt-3 mb-0`} role="status">{message.text}</div>}

      {dialog === "delete" && (
        <ConfirmDialog message={`Rezept „${recipe.name}“ wirklich löschen?`} confirmLabel="Löschen" danger busy={busy} onConfirm={remove} onCancel={close} />
      )}
      {dialog === "cook" && (
        <ConfirmDialog message={`Zutaten für „${recipe.name}“ vom Vorrat abziehen?`} confirmLabel="Abziehen" busy={busy} onConfirm={cook} onCancel={close} />
      )}
    </>
  );
}
