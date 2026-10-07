<script setup>
import { ref, onMounted } from "vue";
import { api, UNITS, fmt } from "../api.js";
import { toast } from "../flash.js";

const items = ref([]);
const name = ref("");
const amount = ref(null);
const unit = ref("g");
const error = ref("");

async function load() {
  try {
    items.value = await api.listPantry();
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(load);

// US-07: hinzufuegen.
async function add() {
  if (!name.value.trim()) return;
  await api.addPantry({ name: name.value.trim(), amount: Number(amount.value) || 0, unit: unit.value });
  name.value = "";
  amount.value = null;
  unit.value = "g";
  toast("Zum Vorrat hinzugefügt.");
  load();
}

// US-09: Menge aendern (bei 0 entfernen).
async function changeAmount(item, value) {
  const newAmount = Number(value);
  if (!newAmount || newAmount <= 0) {
    await remove(item);
    return;
  }
  await api.updatePantry(item.id, { name: item.name, amount: newAmount, unit: item.unit });
  load();
}

// US-09: entfernen.
async function remove(item) {
  await api.deletePantry(item.id);
  toast("Aus dem Vorrat entfernt.");
  load();
}
</script>

<template>
  <h2>Vorrat</h2>

  <form class="pantry-form" @submit.prevent="add">
    <input v-model="name" placeholder="Lebensmittel" aria-label="Lebensmittel" />
    <input v-model="amount" type="number" min="0" step="any" placeholder="Menge" aria-label="Menge" />
    <select v-model="unit" aria-label="Einheit">
      <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
    </select>
    <button type="submit" class="btn primary">Hinzufügen</button>
  </form>

  <p v-if="error" class="errors">{{ error }}</p>

  <ul v-if="items.length" class="list">
    <li v-for="item in items" :key="item.id" class="card pantry-item">
      <span>{{ item.name }}</span>
      <div class="controls">
        <input
          type="number"
          min="0"
          step="any"
          :value="item.amount"
          aria-label="Menge ändern"
          style="width: 90px"
          @change="changeAmount(item, $event.target.value)"
        />
        <span class="badge ok">{{ item.unit }}</span>
        <button class="btn danger" @click="remove(item)" aria-label="Entfernen">✕</button>
      </div>
    </li>
  </ul>
  <p v-else class="empty">Dein Vorrat ist leer.</p>
</template>
