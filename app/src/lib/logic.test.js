import { describe, expect, test } from "vitest";
import * as L from "./logic.js";

const pasta = { name: "Pasta", ingredients: [{ name: "Nudeln", amount: 250, unit: "g" }, { name: "Salz", amount: 1, unit: "Prise" }] };
const eier = { name: "Ei", ingredients: [{ name: "Eier", amount: 2, unit: "Stk" }] };
const kuchen = { name: "Kuchen", ingredients: [
  { name: "Mehl", amount: 500, unit: "g" }, { name: "Eier", amount: 4, unit: "Stk" }, { name: "Zucker", amount: 200, unit: "g" },
] };

describe("Akzeptanzkriterien", () => {
  test("US-01: Name und mindestens eine Zutat sind Pflicht", () => {
    expect(L.validateRecipe({ name: "", ingredients: [{ name: "x" }] })).toHaveLength(1);
    expect(L.validateRecipe({ name: "A", ingredients: [{ name: " " }] })).toHaveLength(1);
    expect(L.validateRecipe({ name: "A", ingredients: [{ name: "x" }] })).toEqual([]);
  });

  test("US-02/US-06: Suche nach Name oder Zutat, alphabetisch sortiert", () => {
    const names = (q) => L.searchRecipes([pasta, eier, kuchen], q).map((r) => r.name);
    expect(names("")).toEqual(["Ei", "Kuchen", "Pasta"]);
    expect(names("eier")).toEqual(["Ei", "Kuchen"]);
    expect(names("PAS")).toEqual(["Pasta"]);
  });

  test("US-10: nur Rezepte mit ausreichender Menge sind kochbar (inkl. Einheitenumrechnung)", () => {
    const pantry = [{ name: "nudeln", amount: 0.3, unit: "kg" }, { name: "Salz", amount: 10, unit: "Prise" }, { name: "Eier", amount: 1, unit: "Stk" }];
    expect(L.classifyRecipes([pasta, eier, kuchen], pantry).cookable.map((r) => r.name)).toEqual(["Pasta"]);
    expect(L.classifyRecipes([pasta], []).cookable).toEqual([]);
  });

  test("US-11: fast kochbar, nach Anzahl fehlender Zutaten sortiert, mit fehlenden Mengen", () => {
    const pantry = [{ name: "Eier", amount: 1, unit: "Stk" }, { name: "Mehl", amount: 1, unit: "kg" }];
    const { almost } = L.classifyRecipes([pasta, eier, kuchen], pantry);
    expect(almost.map((a) => a.recipe.name)).toEqual(["Ei", "Kuchen", "Pasta"]);
    expect(almost[0].missing).toEqual([{ name: "Eier", unit: "Stk", amount: 1, partial: true }]);
    expect(almost[1].missing.map((m) => m.name)).toEqual(["Eier", "Zucker"]);
  });

  test("US-12: Kochen zieht Zutaten ab und entfernt leere Einträge", () => {
    const pantry = [{ name: "Nudeln", amount: 0.25, unit: "kg" }, { name: "Salz", amount: 3, unit: "Prise" }];
    expect(L.deductRecipe(pasta, pantry)).toEqual([{ name: "Salz", amount: 2, unit: "Prise" }]);
  });
});
