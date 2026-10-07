import { cleanRecipe, findOrThrow, handle, readBody } from "@/lib/api";
import { update } from "@/lib/store";

// US-04: Rezept bearbeiten
export async function PUT(request, { params }) {
  return handle(async () => {
    const { id } = await params;
    const recipe = { id, ...cleanRecipe(await readBody(request)) };
    await update((data) => {
      data.recipes[findOrThrow(data.recipes, id, "Rezept")] = recipe;
    });
    return recipe;
  });
}

// US-05: Rezept löschen
export async function DELETE(_request, { params }) {
  return handle(async () => {
    const { id } = await params;
    await update((data) => {
      data.recipes.splice(findOrThrow(data.recipes, id, "Rezept"), 1);
    });
    return { ok: true };
  });
}
