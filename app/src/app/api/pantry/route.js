import { cleanPantryItem, handle, readBody } from "@/lib/api";
import { newId, update } from "@/lib/store";

// US-07: Lebensmittel hinzufügen. Gleiches Lebensmittel mit gleicher Einheit wird aufaddiert.
export async function POST(request) {
  return handle(async () => {
    const item = cleanPantryItem(await readBody(request));
    return update((data) => {
      const same = data.pantry.find(
        (p) => p.name.toLowerCase() === item.name.toLowerCase() && p.unit === item.unit
      );
      if (same) same.amount = Math.round((same.amount + item.amount) * 1000) / 1000;
      else data.pantry.push({ id: newId(), ...item });
      return data.pantry;
    });
  });
}
