import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import RecipeList from "./RecipeList.vue";
import { api } from "../api.js";

// Creates a router spy before the view module is loaded.
const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));

// Replaces router navigation while keeping the actual view under test.
vi.mock("vue-router", () => ({ useRouter: () => routerMocks }));

// Replaces HTTP calls with a controlled recipe list.
vi.mock("../api.js", () => ({ api: { listRecipes: vi.fn() } }));

// Clears call history and provides a recipe for initial rendering.
function resetMocks() {
  vi.clearAllMocks();
  api.listRecipes.mockResolvedValue([
    { id: "recipe-1", name: "Tomatensuppe", ingredients: [{ name: "Tomaten" }] },
  ]);
}

beforeEach(resetMocks);

// Verifies the search input forwards its query to the API.
async function forwardsSearchQueryToApi() {
  const wrapper = mount(RecipeList, { global: { stubs: ["RouterLink"] } });
  await flushPromises();

  await wrapper.find('input[type="search"]').setValue("tomate");
  await flushPromises();

  expect(api.listRecipes).toHaveBeenLastCalledWith("tomate");
  expect(wrapper.text()).toContain("Tomatensuppe");
}

test("forwards the search query to the API", forwardsSearchQueryToApi);