// Serverseitige Ablage: alle Daten liegen in einer JSON-Datei (Standard: data/kochbuch.json).
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const FILE = process.env.DATA_FILE || path.join(process.cwd(), "data", "kochbuch.json");

// Schreibzugriffe nacheinander ausführen, damit sich parallele Anfragen nicht überschreiben.
let queue = Promise.resolve();

export function newId() {
  return randomUUID();
}

export async function readData() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    const data = sampleData();
    await writeData(data);
    return data;
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, FILE);
}

// Liest die Daten, wendet `change` an und speichert das Ergebnis. Gibt den Rückgabewert von `change` zurück.
export function update(change) {
  const run = queue.then(async () => {
    const data = await readData();
    const result = await change(data);
    await writeData(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

function sampleData() {
  return {
    recipes: [
      {
        id: newId(),
        name: "Spaghetti Aglio e Olio",
        ingredients: [
          { name: "Spaghetti", amount: 250, unit: "g" },
          { name: "Knoblauch", amount: 3, unit: "Stk" },
          { name: "Olivenöl", amount: 4, unit: "EL" },
        ],
        steps: "Spaghetti kochen.\nKnoblauch in Scheiben schneiden und im Öl anbraten.\nNudeln untermischen.",
      },
      {
        id: newId(),
        name: "Pfannkuchen",
        ingredients: [
          { name: "Mehl", amount: 200, unit: "g" },
          { name: "Milch", amount: 400, unit: "ml" },
          { name: "Eier", amount: 2, unit: "Stk" },
        ],
        steps: "Alle Zutaten verrühren, 10 Minuten quellen lassen und portionsweise ausbacken.",
      },
      {
        id: newId(),
        name: "Rührei",
        ingredients: [
          { name: "Eier", amount: 3, unit: "Stk" },
          { name: "Butter", amount: 10, unit: "g" },
          { name: "Schnittlauch", amount: 1, unit: "EL" },
        ],
        steps: "Eier verquirlen, in Butter stocken lassen, mit Schnittlauch bestreuen.",
      },
    ],
    pantry: [
      { id: newId(), name: "Spaghetti", amount: 500, unit: "g" },
      { id: newId(), name: "Knoblauch", amount: 5, unit: "Stk" },
      { id: newId(), name: "Olivenöl", amount: 20, unit: "EL" },
      { id: newId(), name: "Eier", amount: 4, unit: "Stk" },
      { id: newId(), name: "Mehl", amount: 1, unit: "kg" },
      { id: newId(), name: "Milch", amount: 0.25, unit: "l" },
    ],
  };
}
