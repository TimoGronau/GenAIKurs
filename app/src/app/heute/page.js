import Link from "next/link";
import { fmt } from "@/lib/format";
import { classifyRecipes } from "@/lib/logic";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Heute kochen · Kochbuch" };

const MAX_MISSING = 3;

// US-10 + US-11: Was kann ich heute kochen?
export default async function TodayPage() {
  const { recipes, pantry } = await readData();
  const { cookable, almost } = classifyRecipes(recipes, pantry, MAX_MISSING);

  return (
    <>
      <h1 className="h3 mb-3">Was kann ich heute kochen?</h1>

      <h2 className="h5 mt-4">Jetzt kochbar</h2>
      {cookable.length ? (
        <div className="list-group">
          {cookable.map((r) => (
            <Link key={r.id} href={`/rezepte/${r.id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <span>{r.name}</span>
              <span className="badge rounded-pill text-bg-success">alles da</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary">Mit deinem aktuellen Vorrat ist leider kein Rezept vollständig kochbar.</p>
      )}

      <h2 className="h5 mt-4">Fast kochbar</h2>
      <p className="text-body-secondary small">Rezepte, bei denen höchstens {MAX_MISSING} Zutaten fehlen.</p>
      {almost.length ? (
        <div className="list-group">
          {almost.map(({ recipe, missing }) => (
            <Link key={recipe.id} href={`/rezepte/${recipe.id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-3">
              <div>
                <div>{recipe.name}</div>
                <ul className="small text-warning-emphasis mb-0 ps-3">
                  {missing.map((m) => (
                    <li key={m.name + m.unit}>
                      {fmt(m.amount, m.unit)} {m.name}{m.partial ? " (zu wenig)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="badge rounded-pill text-bg-warning flex-shrink-0">{missing.length} fehlt</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-body-secondary">Keine Rezepte, bei denen nur wenige Zutaten fehlen.</p>
      )}
    </>
  );
}
