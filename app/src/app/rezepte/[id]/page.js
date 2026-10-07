import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeActions from "@/components/RecipeActions";
import { fmt } from "@/lib/format";
import { missingIngredients } from "@/lib/logic";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

// US-03: Rezept im Detail ansehen
export default async function RecipePage({ params }) {
  const { id } = await params;
  const { recipes, pantry } = await readData();
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) notFound();
  const missing = missingIngredients(recipe, pantry);

  return (
    <>
      <p className="mb-2"><Link href="/">← Alle Rezepte</Link></p>
      <h1 className="h3 mb-2">{recipe.name}</h1>
      {missing.length ? (
        <span className="badge rounded-pill text-bg-warning">{missing.length} Zutat(en) fehlen im Vorrat</span>
      ) : (
        <span className="badge rounded-pill text-bg-success">Mit deinem Vorrat kochbar</span>
      )}

      <h2 className="h5 mt-4">Zutaten</h2>
      <ul>
        {recipe.ingredients.map((i, n) => (
          <li key={n}>{fmt(i.amount, i.unit)} {i.name}</li>
        ))}
      </ul>

      <h2 className="h5 mt-4">Zubereitung</h2>
      <div className="card card-body steps">{recipe.steps || "Keine Zubereitungsschritte erfasst."}</div>

      <RecipeActions recipe={recipe} cookable={missing.length === 0} />
    </>
  );
}
