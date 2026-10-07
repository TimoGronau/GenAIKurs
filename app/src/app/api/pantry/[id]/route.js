import { findOrThrow, handle, readBody } from "@/lib/api";
import { update } from "@/lib/store";

// US-09: Menge ändern. Eine Menge von 0 entfernt das Lebensmittel.
export async function PUT(request, { params }) {
  return handle(async () => {
    const { id } = await params;
    const amount = Number((await readBody(request)).amount);
    return update((data) => {
      const index = findOrThrow(data.pantry, id, "Lebensmittel");
      if (Number.isFinite(amount) && amount > 0) data.pantry[index].amount = amount;
      else data.pantry.splice(index, 1);
      return data.pantry;
    });
  });
}

// US-09: Lebensmittel entfernen
export async function DELETE(_request, { params }) {
  return handle(async () => {
    const { id } = await params;
    return update((data) => {
      data.pantry.splice(findOrThrow(data.pantry, id, "Lebensmittel"), 1);
      return data.pantry;
    });
  });
}
