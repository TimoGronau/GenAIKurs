import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ShoppingList from "./ShoppingList.vue";
import { api } from "../api.js";
import { toast } from "../flash.js";

vi.mock("../api.js", () => ({
  api: {
    listShoppingList: vi.fn(),
    updateShoppingListItem: vi.fn(),
    deleteShoppingListItem: vi.fn(),
  },
  fmt: (amount, unit) => `${amount} ${unit}`,
}));

vi.mock("../flash.js", () => ({ toast: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  api.listShoppingList.mockResolvedValue([
    { id: "item-1", name: "Tomaten", amount: 2, unit: "Stk", done: false },
  ]);
});

test("marks a shopping-list item as done", async () => {
  api.updateShoppingListItem.mockResolvedValue({
    id: "item-1", name: "Tomaten", amount: 2, unit: "Stk", done: true,
  });
  const wrapper = mount(ShoppingList);
  await flushPromises();

  await wrapper.find('input[type="checkbox"]').setValue(true);
  await flushPromises();

  expect(api.updateShoppingListItem).toHaveBeenCalledWith("item-1", { done: true });
  expect(wrapper.find(".shopping-entry").classes()).toContain("done");
});

test("removes a shopping-list item", async () => {
  api.deleteShoppingListItem.mockResolvedValue(null);
  const wrapper = mount(ShoppingList);
  await flushPromises();

  await wrapper.find("button").trigger("click");
  await flushPromises();

  expect(api.deleteShoppingListItem).toHaveBeenCalledWith("item-1");
  expect(wrapper.text()).toContain("Deine Einkaufsliste ist leer.");
  expect(toast).toHaveBeenCalledWith("Eintrag von der Einkaufsliste entfernt.");
});