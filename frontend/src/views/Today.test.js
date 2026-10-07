import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Today from "./Today.vue";
import { api } from "../api.js";

// Creates a router spy before the view module is loaded.
const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));

// Replaces navigation while keeping the view under test.
vi.mock("vue-router", () => ({ useRouter: () => routerMocks }));

// Replaces API requests with a cookable and an almost-cookable recipe.
vi.mock("../api.js", () => ({
  api: { cookable: vi.fn() },
  fmt: (amount, unit) => `${amount} ${unit}`,
}));

// Clears API history and configures representative recipe results.
function resetMocks() {
  vi.clearAllMocks();
  api.cookable.mockResolvedValue({
    cookable: [{ id: "ready", name: "Rührei", ingredients: [] }],
    almost: [{
      recipe: { id: "almost", name: "Pfannkuchen", ingredients: [] },
      missing: [{ name: "Milch", amount: 200, unit: "ml", partial: false }],
    }],
  });
}

beforeEach(resetMocks);

// Verifies that both classifications and missing ingredient details are shown.
async function rendersCookableAndAlmostCookableRecipes() {
  const wrapper = mount(Today);
  await flushPromises();

  expect(api.cookable).toHaveBeenCalledWith(3);
  expect(wrapper.text()).toContain("Rührei");
  expect(wrapper.text()).toContain("Pfannkuchen");
  expect(wrapper.text()).toContain("200 ml Milch");
}

test("renders cookable and almost-cookable recipes", rendersCookableAndAlmostCookableRecipes);