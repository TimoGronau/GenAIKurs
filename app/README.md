# Kochbuch-App

Umsetzung der User Stories aus [`docs/user-stories.md`](../docs/user-stories.md).
Reines HTML/CSS/JavaScript, kein Build, keine Abhängigkeiten. Die Daten bleiben per `localStorage` im Browser gespeichert.

## Starten

`app/index.html` im Browser öffnen (Doppelklick reicht).

## Tests

```
node --test app/logic.test.js
```

## Aufbau

| Datei | Inhalt |
|---|---|
| `logic.js` | Fachlogik ohne DOM: Validierung, Suche, kochbare/fast kochbare Rezepte, Vorrat abziehen, Einheitenumrechnung |
| `app.js` | Oberfläche und Speicherung |
| `logic.test.js` | Tests zu den Akzeptanzkriterien |

## Abdeckung der User Stories

| Story | Wo |
|---|---|
| US-01 Rezept anlegen | „+ Neues Rezept“; Name und mindestens eine Zutat sind Pflicht |
| US-02 Übersicht | Reiter „Rezepte“, alphabetisch sortiert |
| US-03 Detailansicht | Klick auf ein Rezept |
| US-04 Bearbeiten | „Bearbeiten“ in der Detailansicht |
| US-05 Löschen | „Löschen“ mit Sicherheitsabfrage |
| US-06 Suche | Suchfeld: Name oder Zutat |
| US-07–09 Vorrat | Reiter „Vorrat“: hinzufügen, Menge ändern, entfernen (Menge 0 oder ✕) |
| US-10 Kochbar | Reiter „Heute kochen“, mit Hinweis, wenn nichts kochbar ist |
| US-11 Fast kochbar | Bis zu 3 fehlende Zutaten, sortiert, mit fehlenden Mengen |
| US-12 Vorrat abziehen | „Gekocht – Vorrat abziehen“ in der Detailansicht |

Die Mengen werden zwischen g/kg und ml/l umgerechnet. Zutaten werden über den Namen (ohne Groß-/Kleinschreibung) und eine passende Einheit zugeordnet.
