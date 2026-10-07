import RecipeList from "@/components/RecipeList";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const { recipes } = await readData();
  return (
    <>
      <h1 className="h3 mb-3">Rezepte</h1>
      <RecipeList recipes={recipes} />
    </>
  );
}
