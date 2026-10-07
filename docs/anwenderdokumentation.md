# Anwenderdokumentation

Diese Anleitung beschreibt die aktuell verfügbaren Funktionen der Kochbuch-App.
Informationen zur Installation und zum Start stehen in der [Projekt-README](../README.md).

## Überblick

Die Navigation am oberen Rand führt zu vier Bereichen:

- **Rezepte:** Rezepte anlegen, suchen und öffnen.
- **Vorrat:** vorhandene Lebensmittel und Mengen verwalten.
- **Heute kochen:** Rezepte finden, die vollständig oder mit wenigen fehlenden Zutaten kochbar sind.
- **Einkaufsliste:** fehlende Zutaten sammeln, abhaken oder entfernen.

Änderungen werden im Backend in JSON-Dateien gespeichert und bleiben beim Neuladen erhalten.

## Rezepte verwalten

### Rezept anlegen

1. Öffne **Rezepte** und wähle **+ Neues Rezept**.
2. Gib einen Namen und mindestens eine Zutat ein.
3. Ergänze je Zutat Menge und Einheit. Weitere Zutaten fügst du mit **+ Zutat** hinzu.
4. Trage optional die Zubereitung ein und wähle **Speichern**.

Verfügbare Einheiten sind `g`, `kg`, `ml`, `l`, `Stk`, `EL`, `TL` und `Prise`.

### Rezepte suchen und ansehen

Nutze das Suchfeld in **Rezepte**. Die Suche berücksichtigt Rezeptnamen und Zutaten.
Wähle einen Treffer, um Zutaten, Zubereitung und Vorratsstatus zu sehen.

In der Detailansicht kannst du ein Rezept **Bearbeiten** oder **Löschen**. Beim
Löschen musst du die Sicherheitsabfrage bestätigen.

## Vorrat verwalten

Öffne **Vorrat**, gib Lebensmittel, Menge und Einheit ein und wähle **Hinzufügen**.
Die Menge eines Eintrags kannst du direkt in der Liste ändern. Eine Menge von null
entfernt den Eintrag; alternativ nutzt du die Entfernen-Schaltfläche.

Beim Vergleichen werden `g` und `kg` sowie `ml` und `l` umgerechnet. Namen werden
unabhängig von Groß- und Kleinschreibung verglichen.

## Kochbare Rezepte finden

Unter **Heute kochen** werden Rezepte in zwei Gruppen angezeigt:

- **Jetzt kochbar:** alle benötigten Zutaten sind in ausreichender Menge vorhanden.
- **Fast kochbar:** es fehlen höchstens drei Zutaten. Fehlende oder zu geringe Mengen
  werden direkt beim Rezept angezeigt.

Wähle ein Rezept, um die Detailansicht zu öffnen. **Gekocht – Vorrat abziehen** ist
nur verfügbar, wenn das Rezept vollständig kochbar ist. Nach der Bestätigung werden
die benötigten Mengen vom Vorrat abgezogen.

## Einkaufsliste verwenden

Öffne ein Rezept mit fehlenden Zutaten und wähle **Fehlende Zutaten zur Einkaufsliste**.
Es wird nur die Menge ergänzt, die nach Abzug des aktuellen Vorrats noch fehlt. Sind
alle Zutaten ausreichend vorhanden, zeigt die App einen entsprechenden Hinweis.

Öffne anschließend **Einkaufsliste**, um Einträge zu verwalten:

- Markiere einen Eintrag über das Kontrollkästchen als erledigt; ein erneuter Klick öffnet ihn wieder.
- Wähle **Entfernen**, um einen Eintrag von der Liste zu löschen.
- Wird dieselbe Zutat mit derselben Einheit erneut hinzugefügt, summiert die App die
  Mengen. Ein erledigter Eintrag wird dabei wieder geöffnet.

## Datenspeicherung

Rezepte, Vorrat und Einkaufsliste werden lokal im Backend gespeichert:

- `backend/data/recipes.json`
- `backend/data/pantry.json`
- `backend/data/shopping_list.json`

Die Dateien können für eine Sicherung kopiert werden. Die App verwendet keine separate Datenbank.