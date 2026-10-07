import { notFound } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

// US-04: Rezept bearbeiten
export default async function EditRecipePage({ params }) {
  const { id } = await params;
  const { recipes } = await readData();
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) notFound();

  return (
    <>
      <h1 className="h3 mb-3">Rezept bearbeiten</h1>
      <RecipeForm recipe={recipe} />
    </>
  );
}
