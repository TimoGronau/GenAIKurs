<script setup>
import { ref, onMounted } from "vue";
import { api, fmt } from "../api.js";
import { toast } from "../flash.js";

const items = ref([]);
const error = ref("");

async function load() {
  try {
    items.value = await api.listShoppingList();
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(load);

async function updateDone(item, event) {
  try {
    const updated = await api.updateShoppingListItem(item.id, { done: event.target.checked });
    items.value = items.value.map((entry) => entry.id === updated.id ? updated : entry);
  } catch (e) {
    error.value = e.message;
    event.target.checked = item.done;
  }
}

async function remove(item) {
  try {
    await api.deleteShoppingListItem(item.id);
    items.value = items.value.filter((entry) => entry.id !== item.id);
    toast("Eintrag von der Einkaufsliste entfernt.");
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<template>
  <h2>Einkaufsliste</h2>
  <p v-if="error" class="errors">{{ error }}</p>
  <p v-if="!items.length && !error" class="empty">
    Deine Einkaufsliste ist leer. Fehlende Zutaten kannst du direkt im Rezeptdetail hinzufügen.
  </p>
  <ul v-else class="list">
    <li v-for="item in items" :key="item.id" class="card pantry-item">
      <label class="shopping-entry" :class="{ done: item.done }">
        <input
          type="checkbox"
          :checked="item.done"
          :aria-label="item.done ? 'Eintrag wieder öffnen' : 'Eintrag als erledigt markieren'"
          @change="updateDone(item, $event)"
        />
        <span>{{ item.name }}</span>
        <span>{{ fmt(item.amount, item.unit) }}</span>
      </label>
      <button class="btn danger" :aria-label="`${item.name} entfernen`" @click="remove(item)">
        Entfernen
      </button>
    </li>
  </ul>
</template>