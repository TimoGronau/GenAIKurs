"use client";

import { useEffect, useRef } from "react";

// US-05: Sicherheitsabfrage als Bootstrap-Modal.
export default function ConfirmDialog({ message, confirmLabel, danger, busy, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <>
      <div className="modal kb-open" role="alertdialog" aria-modal="true" aria-label={message} onClick={(e) => e.target === e.currentTarget && onCancel()}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">{message}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={busy}>
                Abbrechen
              </button>
              <button ref={confirmRef} type="button" className={"btn " + (danger ? "btn-danger" : "btn-primary")} onClick={onConfirm} disabled={busy}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
