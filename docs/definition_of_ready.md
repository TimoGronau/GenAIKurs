# User Stories – Rezeptverwaltung / Kochbuch

## Rezepte verwalten

**US-01 – Rezept anlegen**
Als Nutzer möchte ich ein neues Rezept mit Name, Zutaten (inkl. Menge und Einheit) und Zubereitungsschritten anlegen, damit ich meine Rezepte an einem Ort sammeln kann.

- Akzeptanzkriterien:
  - Name ist ein Pflichtfeld
  - Mindestens eine Zutat muss angegeben werden
  - Zubereitungsschritte können als Text erfasst werden

**US-02 – Rezeptübersicht anzeigen**
Als Nutzer möchte ich eine Liste aller meiner Rezepte sehen, damit ich einen schnellen Überblick habe.

- Akzeptanzkriterien:
  - Alle Rezepte werden mit Namen angezeigt
  - Die Liste ist alphabetisch sortiert

**US-03 – Rezept im Detail ansehen**
Als Nutzer möchte ich ein Rezept öffnen und alle Zutaten sowie die Zubereitung sehen, damit ich danach kochen kann.

**US-04 – Rezept bearbeiten**
Als Nutzer möchte ich ein bestehendes Rezept ändern können, damit ich Fehler korrigieren oder das Rezept anpassen kann.

**US-05 – Rezept löschen**
Als Nutzer möchte ich ein Rezept löschen können, damit meine Sammlung übersichtlich bleibt.

- Akzeptanzkriterien:
  - Vor dem Löschen erscheint eine Sicherheitsabfrage

**US-06 – Rezepte suchen**
Als Nutzer möchte ich Rezepte nach Namen oder Zutat suchen, damit ich ein bestimmtes Rezept schnell finde.

## Vorrat verwalten

**US-07 – Lebensmittel zum Vorrat hinzufügen**
Als Nutzer möchte ich meine verfügbaren Lebensmittel (mit Menge) erfassen, damit die App weiß, was ich zu Hause habe.

**US-08 – Vorrat anzeigen**
Als Nutzer möchte ich eine Liste meiner verfügbaren Lebensmittel sehen, damit ich weiß, was noch da ist.

**US-09 – Vorrat aktualisieren**
Als Nutzer möchte ich Mengen ändern oder Lebensmittel aus dem Vorrat entfernen, damit der Vorrat aktuell bleibt.

## Was kann ich heute kochen?

**US-10 – Kochbare Rezepte anzeigen**
Als Nutzer möchte ich sehen, welche Rezepte ich mit meinen aktuell verfügbaren Lebensmitteln kochen kann, damit ich schnell entscheiden kann, was es heute gibt.

- Akzeptanzkriterien:
  - Es werden nur Rezepte angezeigt, für die alle Zutaten in ausreichender Menge vorhanden sind
  - Ist kein Rezept kochbar, erscheint ein entsprechender Hinweis

**US-11 – Fast kochbare Rezepte anzeigen**
Als Nutzer möchte ich auch Rezepte sehen, bei denen nur wenige Zutaten fehlen, inklusive der Liste der fehlenden Zutaten, damit ich ggf. nur kurz etwas einkaufen muss.

- Akzeptanzkriterien:
  - Rezepte sind nach Anzahl fehlender Zutaten sortiert
  - Fehlende Zutaten werden pro Rezept angezeigt

**US-12 – Vorrat nach dem Kochen abziehen** *(optional)*
Als Nutzer möchte ich nach dem Kochen eines Rezepts die verbrauchten Zutaten automatisch vom Vorrat abziehen lassen, damit ich den Vorrat nicht manuell pflegen muss.
