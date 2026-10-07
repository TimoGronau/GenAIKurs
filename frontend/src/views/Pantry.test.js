import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Pantry from "./Pantry.vue";
import { api } from "../api.js";
import { toast } from "../flash.js";

// Replaces backend calls with spies and stable responses.
vi.mock("../api.js", () => ({
  api: {
    listPantry: vi.fn(),
    addPantry: vi.fn(),
    updatePantry: vi.fn(),
    deletePantry: vi.fn(),
  },
  UNITS: ["g", "kg", "ml", "l", "Stk", "EL", "TL", "Prise"],
  fmt: (amount, unit) => `${amount} ${unit}`,
}));

// Replaces transient UI feedback with a spy.
vi.mock("../flash.js", () => ({ toast: vi.fn() }));

// Clears call history and provides an empty pantry by default.
function resetMocks() {
  vi.clearAllMocks();
  api.listPantry.mockResolvedValue([]);
  api.addPantry.mockResolvedValue({ id: "item-1" });
}

beforeEach(resetMocks);

// Verifies a pantry item is sent to the API and the form is cleared.
async function addsPantryItem() {
  const wrapper = mount(Pantry);
  await flushPromises();
  await wrapper.find('[aria-label="Lebensmittel"]').setValue("Tomaten");
  await wrapper.find('[aria-label="Menge"]').setValue("4");

  await wrapper.find("form").trigger("submit");
  await flushPromises();

  expect(api.addPantry).toHaveBeenCalledWith({ name: "Tomaten", amount: 4, unit: "g" });
  expect(toast).toHaveBeenCalledWith("Zum Vorrat hinzugefügt.");
  expect(wrapper.find('[aria-label="Lebensmittel"]').element.value).toBe("");
}

test("adds a pantry item", addsPantryItem);

// Verifies changing an existing item's amount persists the new value.
async function updatesPantryAmount() {
  api.listPantry.mockResolvedValue([
    { id: "item-1", name: "Tomaten", amount: 4, unit: "Stk" },
  ]);
  const wrapper = mount(Pantry);
  await flushPromises();

  await wrapper.find('[aria-label="Menge ändern"]').setValue("2");
  await wrapper.find('[aria-label="Menge ändern"]').trigger("change");
  await flushPromises();

  expect(api.updatePantry).toHaveBeenCalledWith("item-1", {
    name: "Tomaten",
    amount: 2,
    unit: "Stk",
  });
}

test("updates a pantry item's amount", updatesPantryAmount);