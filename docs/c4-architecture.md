# C4-Architektur der Kochbuch-App

Dieses Dokument beschreibt den implementierten Architekturstand der Kochbuch-App
mit den C4-Ebenen Systemkontext, Container und Komponenten. Die Diagramme verwenden
Mermaid und ergänzen den technischen Überblick in [architecture.md](architecture.md).

## C1 – Systemkontext

Die Kochbuch-App unterstützt einen Nutzer bei Rezeptverwaltung, Vorrat und
Einkaufsplanung. Im dokumentierten Umfang gibt es keine externen Software-Systeme.

```mermaid
flowchart LR
    user["Nutzer<br/>Person, die Rezepte und Vorrat verwaltet"]
    app["Kochbuch-App<br/>Rezepte organisieren, Kochbarkeit prüfen und Einkäufe planen"]

    user -->|nutzt im Webbrowser| app
```

## C2 – Container

Die Anwendung besteht aus einer Vue-Anwendung im Browser, einem FastAPI-Backend
und JSON-Dateien für die dauerhafte Speicherung. Im Entwicklungsbetrieb leitet der
Vite-Server API-Anfragen vom Frontend an das Backend weiter.

```mermaid
flowchart LR
    user["Nutzer"]

    subgraph system["Kochbuch-App"]
        frontend["Vue 3 SPA<br/>Browser-Oberfläche, Navigation und API-Client"]
        backend["FastAPI-Anwendung<br/>Python mit Uvicorn; REST-API und Anwendungslogik"]
        data[("JSON-Dateien<br/>recipes.json<br/>pantry.json<br/>shopping_list.json")]
    end

    user -->|verwendet| frontend
    frontend -->|HTTP + JSON über /api<br/>Entwicklung: Vite-Proxy| backend
    backend -->|liest und schreibt| data
```

| Container | Technologie | Verantwortung |
|---|---|---|
| Vue-SPA | Vue 3, Vue Router, Fetch API | Zeigt die Ansichten an und kommuniziert mit dem Backend. |
| FastAPI-Anwendung | Python, FastAPI, Uvicorn, Pydantic | Stellt REST-Endpunkte bereit, validiert API-Daten und orchestriert die Fachlogik. |
| JSON-Dateien | JSON auf dem lokalen Dateisystem | Speichern Rezepte, Vorrat und Einkaufsliste ohne separate Datenbank. |

## C3 – Komponenten

### Frontend

```mermaid
flowchart LR
    subgraph vue["Vue-SPA im Browser"]
        shell["App.vue<br/>Anwendungsrahmen, Navigation und Flash-Meldungen"]
        router["router.js<br/>Routen und Auswahl der Ansicht"]
        views["Views<br/>RecipeList, RecipeDetail, RecipeForm,<br/>Pantry, Today, ShoppingList"]
        api["api.js<br/>Fetch-Wrapper und REST-Funktionen"]
        flash["flash.js<br/>Kurzlebige Statusmeldungen"]

        shell --> router
        router --> views
        views --> api
        shell --> flash
        views --> flash
    end

    backend["FastAPI-Anwendung"]
    api -->|HTTP + JSON /api| backend
```

Die Ansichten enthalten den jeweiligen Bedienablauf. `api.js` kapselt die
Backend-Aufrufe; die Vite-Konfiguration proxyt `/api` im Entwicklungsbetrieb an
`http://localhost:8000`.

### Backend

```mermaid
flowchart LR
    client["Vue-SPA"]

    subgraph fastapi["FastAPI-Anwendung"]
        routes["main.py<br/>HTTP-Routen und Ablaufsteuerung"]
        models["models.py<br/>Pydantic-Ein- und Ausgabemodelle"]
        logic["logic.py<br/>Suche, Mengenvergleich, Kochbarkeit,<br/>Vorratsabzug und Einkaufslistenaggregation"]
        storage["storage.py<br/>JSON-Dateizugriff und ID-Erzeugung"]

        routes -->|validiert und serialisiert| models
        routes -->|ruft Fachfunktionen auf| logic
        routes -->|lädt und speichert Daten| storage
    end

    data[("recipes.json<br/>pantry.json<br/>shopping_list.json")]
    client -->|REST über HTTP + JSON| routes
    storage -->|liest und schreibt| data
```

| Komponente | Quelle | Verantwortung |
|---|---|---|
| API-Routen | `backend/main.py` | Nimmt Requests entgegen, prüft IDs und verbindet Modelle, Fachlogik und Speicher. |
| Datenmodelle | `backend/models.py` | Validiert und beschreibt Rezept-, Vorrats- und Einkaufslisten-Daten. |
| Fachlogik | `backend/logic.py` | Berechnet fehlende Mengen, Kochbarkeit, Suche, Vorratsabzug und Zusammenführung der Einkaufsliste. |
| JSON-Speicher | `backend/storage.py` | Liest und schreibt JSON-Dateien und erzeugt IDs. |

## Laufzeit und Grenzen

- Das Frontend verwendet den relativen API-Pfad `/api`; im lokalen Entwicklungsbetrieb
  übernimmt Vite den Proxy zum Backend auf Port 8000.
- Die Datenhaltung erfolgt über lokale JSON-Dateien. Es gibt keine Datenbank,
  Authentifizierung oder externen Integrationssysteme im aktuellen Umfang.
- Diese Dokumentation zeigt die Komponentenstruktur, nicht eine konkrete
  Produktions- oder Deployment-Topologie.