import Pantry from "@/components/Pantry";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vorrat · Kochbuch" };

export default async function PantryPage() {
  const { pantry } = await readData();
  return (
    <>
      <h1 className="h3 mb-3">Vorrat</h1>
      <Pantry initialItems={pantry} />
    </>
  );
}
