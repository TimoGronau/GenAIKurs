<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api, fmt } from "../api.js";
import { toast } from "../flash.js";

const props = defineProps({ id: String });
const router = useRouter();

const recipe = ref(null);
const cookable = ref(false);
const missing = ref([]);
const error = ref("");

async function load() {
  try {
    recipe.value = await api.getRecipe(props.id);
    const data = await api.cookable(99);
    cookable.value = data.cookable.some((r) => r.id === props.id);
    const entry = data.almost.find((a) => a.recipe.id === props.id);
    missing.value = entry ? entry.missing : [];
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(load);

const missingCount = computed(() => missing.value.length);

// US-05: Loeschen mit Sicherheitsabfrage.
async function remove() {
  if (!confirm(`Rezept „${recipe.value.name}" wirklich löschen?`)) return;
  await api.deleteRecipe(props.id);
  toast("Rezept gelöscht.");
  router.push({ name: "recipes" });
}

// US-12: Vorrat nach dem Kochen abziehen.
async function cook() {
  if (!confirm(`Zutaten für „${recipe.value.name}" vom Vorrat abziehen?`)) return;
  await api.cookRecipe(props.id);
  toast("Vorrat aktualisiert. Guten Appetit!");
  load();
}
</script>

<template>
  <p v-if="error" class="errors">{{ error }}</p>

  <template v-if="recipe">
    <p>
      <button class="link" @click="router.push({ name: 'recipes' })">← Alle Rezepte</button>
    </p>
    <h2>{{ recipe.name }}</h2>

    <span v-if="cookable" class="badge ok">Mit deinem Vorrat kochbar</span>
    <span v-else class="badge warn">{{ missingCount || "Mehrere" }} Zutat(en) fehlen</span>

    <h3>Zutaten</h3>
    <ul>
      <li v-for="(i, idx) in recipe.ingredients" :key="idx">{{ fmt(i.amount, i.unit) }} {{ i.name }}</li>
    </ul>

    <h3>Zubereitung</h3>
    <div class="card steps">{{ recipe.steps || "Keine Zubereitungsschritte erfasst." }}</div>

    <div class="actions">
      <router-link class="btn" :to="{ name: 'recipe-edit', params: { id: recipe.id } }">Bearbeiten</router-link>
      <button class="btn" :disabled="!cookable" @click="cook">Gekocht – Vorrat abziehen</button>
      <button class="btn danger" @click="remove">Löschen</button>
    </div>
  </template>
</template>
