<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api.js";

const router = useRouter();
const recipes = ref([]);
const query = ref("");
const error = ref("");

async function load() {
  try {
    recipes.value = await api.listRecipes(query.value);
  } catch (e) {
    error.value = e.message;
  }
}

// US-06: bei jeder Eingabe neu suchen.
watch(query, load);
onMounted(load);

function open(id) {
  router.push({ name: "recipe-detail", params: { id } });
}
</script>

<template>
  <h2>Rezepte</h2>

  <div class="toolbar">
    <input
      v-model="query"
      type="search"
      placeholder="Nach Name oder Zutat suchen …"
      aria-label="Rezepte suchen"
      style="flex: 1"
    />
    <router-link class="btn primary" to="/recipes/new">+ Neues Rezept</router-link>
  </div>

  <p v-if="error" class="errors">{{ error }}</p>

  <ul v-if="recipes.length" class="list">
    <li
      v-for="r in recipes"
      :key="r.id"
      class="card clickable"
      @click="open(r.id)"
    >
      <span>{{ r.name }}</span>
      <span class="badge ok">{{ r.ingredients.length }} Zutat(en)</span>
    </li>
  </ul>
  <p v-else class="empty">Noch keine Rezepte vorhanden.</p>
</template>
