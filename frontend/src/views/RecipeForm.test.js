import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import RecipeForm from "./RecipeForm.vue";
import { api } from "../api.js";
import { toast } from "../flash.js";

// Creates stable router spies before component modules are loaded.
const routerMocks = vi.hoisted(() => ({ push: vi.fn(), back: vi.fn() }));

// Replaces navigation so the form can be tested without a browser router.
vi.mock("vue-router", () => ({ useRouter: () => routerMocks }));

// Replaces backend calls with controlled test doubles.
vi.mock("../api.js", () => ({
  api: {
    createRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    getRecipe: vi.fn(),
  },
  UNITS: ["g", "kg", "ml", "l", "Stk", "EL", "TL", "Prise"],
}));

// Replaces transient UI feedback with a spy.
vi.mock("../flash.js", () => ({ toast: vi.fn() }));

// Resets the router and configures the default successful create response.
function resetMocks() {
  vi.clearAllMocks();
  api.createRecipe.mockResolvedValue({ id: "recipe-1" });
}

beforeEach(resetMocks);

// Verifies that the form blocks a recipe without a name or named ingredient.
async function rejectsIncompleteRecipe() {
  const wrapper = mount(RecipeForm);

  await wrapper.find("form").trigger("submit");

  expect(wrapper.find('[role="alert"]').text()).toContain("Bitte einen Namen angeben.");
  expect(wrapper.find('[role="alert"]').text()).toContain("Bitte mindestens eine Zutat angeben.");
  expect(api.createRecipe).not.toHaveBeenCalled();
}

test("rejects an incomplete recipe", rejectsIncompleteRecipe);

// Verifies the submitted recipe payload and navigation after a successful create.
async function createsRecipeAndOpensItsDetail() {
  const wrapper = mount(RecipeForm);
  await wrapper.find("#f-name").setValue("  Pfannkuchen  ");
  await wrapper.find('[aria-label="Zutat"]').setValue(" Mehl ");
  await wrapper.find('[aria-label="Menge"]').setValue("200");
  await wrapper.find("textarea").setValue("Teig anrühren.");

  await wrapper.find("form").trigger("submit");
  await flushPromises();

  expect(api.createRecipe).toHaveBeenCalledWith({
    name: "Pfannkuchen",
    steps: "Teig anrühren.",
    ingredients: [{ name: "Mehl", amount: 200, unit: "g" }],
  });
  expect(toast).toHaveBeenCalledWith("Rezept angelegt.");
  expect(routerMocks.push).toHaveBeenCalledWith({
    name: "recipe-detail",
    params: { id: "recipe-1" },
  });
}

test("creates a recipe and opens its detail", createsRecipeAndOpensItsDetail);