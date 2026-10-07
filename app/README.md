# Kochbuch-App

Umsetzung der User Stories aus [`docs/definition_of_ready.md`](../docs/definition_of_ready.md)
mit dem Techstack aus [`docs/architecture.md`](../docs/architecture.md):
**Next.js** (App Router) mit **React**, **Bootstrap** und eigenem **CSS**.
**Vite** ist über **Vitest** für die Tests dabei. Next.js und Vite sind beide Build-Werkzeuge, als Basis der App wird nur Next.js genutzt.

## Starten

```
cd app
npm install
npm run build
npm start          # Produktion auf 0.0.0.0:3000
# oder: npm run dev  (Entwicklung mit Hot Reload, ebenfalls Port 3000)
```

In der Docker-Compose-Umgebung ist Port 3000 nach außen auf 8096 gemappt:
http://khsdev-ubuntu.kh.local:8096

## Tests

```
npm test
```

## Daten

Rezepte und Vorrat liegen auf dem Server in `data/kochbuch.json` (anderer Pfad über die Umgebungsvariable `DATA_FILE`).
Fehlt die Datei, wird sie mit Beispieldaten angelegt. Alle, die die App öffnen, sehen dieselben Daten.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/lib/logic.js` | Fachlogik: Validierung, Suche, kochbare/fast kochbare Rezepte, Vorrat abziehen, Einheitenumrechnung |
| `src/lib/store.js` | Lesen und Schreiben der JSON-Datei |
| `src/app/api/…` | REST-API für Rezepte, Vorrat und „Gekocht“ |
| `src/app/…/page.js` | Seiten: `/`, `/rezepte/neu`, `/rezepte/[id]`, `/rezepte/[id]/bearbeiten`, `/vorrat`, `/heute` |
| `src/components/` | React-Komponenten (Formular, Liste, Vorrat, Sicherheitsabfrage) |

## Abdeckung der User Stories

| Story | Wo |
|---|---|
| US-01 Rezept anlegen | „+ Neues Rezept“; Name und mindestens eine Zutat sind Pflicht (auch serverseitig geprüft) |
| US-02 Übersicht | Startseite, alphabetisch sortiert |
| US-03 Detailansicht | Klick auf ein Rezept |
| US-04 Bearbeiten | „Bearbeiten“ in der Detailansicht |
| US-05 Löschen | „Löschen“ mit Sicherheitsabfrage |
| US-06 Suche | Suchfeld: Name oder Zutat |
| US-07–09 Vorrat | Seite „Vorrat“: hinzufügen, Menge ändern, entfernen (Menge 0 oder ✕) |
| US-10 Kochbar | Seite „Heute kochen“, mit Hinweis, wenn nichts kochbar ist |
| US-11 Fast kochbar | Bis zu 3 fehlende Zutaten, sortiert, mit fehlenden Mengen |
| US-12 Vorrat abziehen | „Gekocht – Vorrat abziehen“ in der Detailansicht |
