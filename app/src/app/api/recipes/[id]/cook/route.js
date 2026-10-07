import { findOrThrow, handle, HttpError } from "@/lib/api";
import { deductRecipe, missingIngredients } from "@/lib/logic";
import { update } from "@/lib/store";

// US-12: Vorrat nach dem Kochen abziehen. Gibt den neuen Vorrat zurück.
export async function POST(_request, { params }) {
  return handle(async () => {
    const { id } = await params;
    return update((data) => {
      const recipe = data.recipes[findOrThrow(data.recipes, id, "Rezept")];
      if (missingIngredients(recipe, data.pantry).length) {
        throw new HttpError(409, "Für dieses Rezept reicht der Vorrat nicht.");
      }
      data.pantry = deductRecipe(recipe, data.pantry);
      return data.pantry;
    });
  });
}
