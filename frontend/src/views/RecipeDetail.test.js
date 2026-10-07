import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import RecipeDetail from "./RecipeDetail.vue";
import { api } from "../api.js";
import { toast } from "../flash.js";

vi.mock("../api.js", () => ({
  api: {
    getRecipe: vi.fn(),
    cookable: vi.fn(),
    addRecipeMissingToShoppingList: vi.fn(),
  },
  fmt: (amount, unit) => `${amount} ${unit}`,
}));

vi.mock("../flash.js", () => ({ toast: vi.fn() }));
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.getRecipe.mockResolvedValue({
    id: "recipe-1",
    name: "Pasta",
    ingredients: [{ name: "Nudeln", amount: 500, unit: "g" }],
    steps: "Kochen.",
  });
  api.cookable.mockResolvedValue({
    cookable: [],
    almost: [{ recipe: { id: "recipe-1" }, missing: [{ name: "Nudeln", amount: 200, unit: "g" }] }],
  });
});

test("adds the recipe's missing ingredients to the shopping list", async () => {
  api.addRecipeMissingToShoppingList.mockResolvedValue({ added: 1, items: [] });
  const wrapper = mount(RecipeDetail, {
    props: { id: "recipe-1" },
    global: { stubs: { RouterLink: true } },
  });
  await flushPromises();

  const addButton = wrapper.findAll("button").find((button) =>
    button.text().includes("Fehlende Zutaten zur Einkaufsliste"));
  await addButton.trigger("click");
  await flushPromises();

  expect(api.addRecipeMissingToShoppingList).toHaveBeenCalledWith("recipe-1");
  expect(toast).toHaveBeenCalledWith("1 fehlende Zutat(en) zur Einkaufsliste hinzugefügt.");
});

test("explains when all ingredients are already in the pantry", async () => {
  api.cookable.mockResolvedValue({ cookable: [{ id: "recipe-1" }], almost: [] });
  const wrapper = mount(RecipeDetail, {
    props: { id: "recipe-1" },
    global: { stubs: { RouterLink: true } },
  });
  await flushPromises();

  expect(wrapper.text()).toContain("Alle Zutaten sind ausreichend im Vorrat");
  const addButton = wrapper.findAll("button").find((button) =>
    button.text().includes("Fehlende Zutaten zur Einkaufsliste"));
  expect(addButton.element.disabled).toBe(true);
});