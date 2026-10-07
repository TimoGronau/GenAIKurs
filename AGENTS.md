# Project Guidelines

## Architecture
- Follow [docs/architecture.md](docs/architecture.md).
- Keep the Vue frontend, FastAPI API, business logic, and JSON storage responsibilities separate.

## Code Style
- Follow [docs/code_style.md](docs/code_style.md) and the conventions in nearby files.
- Keep changes focused; avoid unrelated formatting or refactoring.

## Tests and Checks
- Frontend tests: run `npm test` from `frontend/`.
- Frontend production build: run `npm run build` from `frontend/`.
- Backend tests: run `\.venv\Scripts\python.exe -m pytest` from `backend/`.

## Changes
- Add or update focused tests for changed behavior.
- Update documentation when user-facing behavior, API contracts, or setup instructions change.
- Do not commit changes unless explicitly requested.

## Ausarbeitung der Aufgaben
Bitte für neue Aufgaben die Details immer erst mit mir diskutieren. Verschiedene Optionen mit Auswahlmöglichkeiten vorgeben. Erst mit der Umsetzung beginnen, wenn alle Details geklärt sind