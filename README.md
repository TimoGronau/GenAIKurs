# Kochbuch-App

Eine Rezept-App mit Vue 3 im Frontend und FastAPI im Backend. Rezepte und Vorrat
werden in JSON-Dateien unter `backend/data/` gespeichert.

## Voraussetzungen

- Python 3.11 oder neuer
- Node.js und npm

## Einmalig einrichten

Die folgenden Befehle sind für PowerShell im Projektstamm gedacht.

### Backend

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### Frontend

```powershell
cd frontend
npm install
cd ..
```

## App im Entwicklungsmodus starten

Das Backend und das Frontend laufen parallel in zwei Terminals. Beide Terminals
müssen im Projektstamm geöffnet sein.

### Terminal 1: Backend

```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --reload
```

- API: <http://localhost:8000>
- Interaktive API-Dokumentation: <http://localhost:8000/docs>

### Terminal 2: Frontend

```powershell
cd frontend
npm run dev
```

Öffne anschließend die vom Vite-Server angezeigte Adresse, normalerweise
<http://localhost:5173>. Das Frontend leitet API-Anfragen automatisch an das
lokale Backend weiter.

Zum Beenden eines Servers im jeweiligen Terminal `Strg+C` drücken.

## Frontend bauen

```powershell
cd frontend
npm run build
```

Vite erstellt die Produktionsdateien im Ordner `frontend/dist/`. Den Build lokal
prüfen kannst du mit:

```powershell
npm run preview
```

Der Preview-Server zeigt eine lokale Adresse an. Das Backend muss weiterhin
separat laufen, damit Rezepte und Vorrat geladen und gespeichert werden können.

## Tests ausführen

Die Backend-Tests benötigen zusätzliche Entwicklungsabhängigkeiten. Einmalig
vom Projektstamm installieren:

```powershell
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
```

Backend-Fachlogik und API-Tests ausführen:

```powershell
cd backend
.venv\Scripts\python.exe -m pytest tests
```

Frontend-Komponententests ausführen:

```powershell
cd frontend
npm test
```

## Daten

Die Beispieldaten und alle Änderungen liegen in:

- `backend/data/recipes.json`
- `backend/data/pantry.json`

Diese Dateien lassen sich sichern oder bearbeiten. Die App benötigt keine
separate Datenbank.

## Projektbereiche

- `frontend/`: Vue-Oberfläche und Vite-Konfiguration
- `backend/`: FastAPI-Endpunkte, Fachlogik und JSON-Dateispeicherung
- `app/`: älterer HTML-/JavaScript-Prototyp, unabhängig von der Vue-App
- `docs/architecture.md`: Beschreibung der Architektur und Technologieauswahl
- `docs/definition_done.md`: Qualitätskriterien für abgeschlossene Implementierungen
- `docs/user-stories.md`: Übersicht der User Stories und Akzeptanzkriterien
- `docs/definition_of_ready.md`: Vorschlag für die Definition of Ready
