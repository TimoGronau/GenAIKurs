import { cleanRecipe, handle, readBody } from "@/lib/api";
import { newId, update } from "@/lib/store";

// US-01: Rezept anlegen
export async function POST(request) {
  return handle(async () => {
    const recipe = { id: newId(), ...cleanRecipe(await readBody(request)) };
    await update((data) => data.recipes.push(recipe));
    return recipe;
  });
}
