import { createRouter, createWebHashHistory } from "vue-router";
import RecipeList from "./views/RecipeList.vue";
import RecipeDetail from "./views/RecipeDetail.vue";
import RecipeForm from "./views/RecipeForm.vue";
import Pantry from "./views/Pantry.vue";
import Today from "./views/Today.vue";

const routes = [
  { path: "/", redirect: "/recipes" },
  { path: "/recipes", name: "recipes", component: RecipeList },
  { path: "/recipes/new", name: "recipe-new", component: RecipeForm },
  { path: "/recipes/:id", name: "recipe-detail", component: RecipeDetail, props: true },
  { path: "/recipes/:id/edit", name: "recipe-edit", component: RecipeForm, props: true },
  { path: "/pantry", name: "pantry", component: Pantry },
  { path: "/today", name: "today", component: Today },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
