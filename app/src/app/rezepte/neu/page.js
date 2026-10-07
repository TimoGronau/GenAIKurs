import RecipeForm from "@/components/RecipeForm";

export const metadata = { title: "Neues Rezept · Kochbuch" };

export default function NewRecipePage() {
  return (
    <>
      <h1 className="h3 mb-3">Neues Rezept</h1>
      <RecipeForm />
    </>
  );
}
