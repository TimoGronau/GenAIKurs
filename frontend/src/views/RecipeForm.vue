<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api, UNITS } from "../api.js";
import { toast } from "../flash.js";

const props = defineProps({ id: String });
const router = useRouter();

const isEdit = !!props.id;
const name = ref("");
const steps = ref("");
const ingredients = ref([{ name: "", amount: null, unit: "g" }]);
const errors = ref([]);

async function load() {
  if (!isEdit) return;
  const recipe = await api.getRecipe(props.id);
  name.value = recipe.name;
  steps.value = recipe.steps;
  ingredients.value = recipe.ingredients.length
    ? recipe.ingredients.map((i) => ({ ...i }))
    : [{ name: "", amount: null, unit: "g" }];
}

onMounted(load);

function addRow() {
  ingredients.value.push({ name: "", amount: null, unit: "g" });
}

function removeRow(index) {
  ingredients.value.splice(index, 1);
}

// US-01: Validierung vor dem Speichern (zusaetzlich zum Backend).
function validate() {
  const problems = [];
  if (!name.value.trim()) problems.push("Bitte einen Namen angeben.");
  const named = ingredients.value.filter((i) => i.name.trim());
  if (named.length === 0) problems.push("Bitte mindestens eine Zutat angeben.");
  return problems;
}

async function submit() {
  errors.value = validate();
  if (errors.value.length) return;

  const payload = {
    name: name.value.trim(),
    steps: steps.value.trim(),
    ingredients: ingredients.value
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name.trim(), amount: Number(i.amount) || 0, unit: i.unit })),
  };

  try {
    const saved = isEdit
      ? await api.updateRecipe(props.id, payload)
      : await api.createRecipe(payload);
    toast(isEdit ? "Rezept gespeichert." : "Rezept angelegt.");
    router.push({ name: "recipe-detail", params: { id: saved.id } });
  } catch (e) {
    errors.value = [e.message];
  }
}
</script>

<template>
  <h2>{{ isEdit ? "Rezept bearbeiten" : "Neues Rezept" }}</h2>

  <form @submit.prevent="submit">
    <label for="f-name">Name *</label>
    <input id="f-name" v-model="name" style="width: 100%" />

    <label>Zutaten *</label>
    <div v-for="(ing, idx) in ingredients" :key="idx" class="ingredient-row">
      <input v-model="ing.name" placeholder="Zutat" aria-label="Zutat" />
      <input v-model="ing.amount" type="number" min="0" step="any" placeholder="Menge" aria-label="Menge" />
      <select v-model="ing.unit" aria-label="Einheit">
        <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
      </select>
      <button type="button" class="btn" @click="removeRow(idx)" :disabled="ingredients.length === 1">✕</button>
    </div>
    <button type="button" class="btn" @click="addRow">+ Zutat</button>

    <label for="f-steps">Zubereitung</label>
    <textarea id="f-steps" v-model="steps"></textarea>

    <ul v-if="errors.length" class="errors" role="alert">
      <li v-for="(p, idx) in errors" :key="idx">{{ p }}</li>
    </ul>

    <div class="actions">
      <button type="submit" class="btn primary">Speichern</button>
      <button type="button" class="btn" @click="router.back()">Abbrechen</button>
    </div>
  </form>
</template>
