<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api, fmt } from "../api.js";

const router = useRouter();
const cookable = ref([]);
const almost = ref([]);
const error = ref("");

async function load() {
  try {
    const data = await api.cookable(3);
    cookable.value = data.cookable;
    almost.value = data.almost;
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(load);

function open(id) {
  router.push({ name: "recipe-detail", params: { id } });
}
</script>

<template>
  <h2>Was kann ich heute kochen?</h2>
  <p v-if="error" class="errors">{{ error }}</p>

  <h3>Jetzt kochbar</h3>
  <ul v-if="cookable.length" class="list">
    <li v-for="r in cookable" :key="r.id" class="card clickable" @click="open(r.id)">
      <span>{{ r.name }}</span>
      <span class="badge ok">alles da</span>
    </li>
  </ul>
  <p v-else class="empty">
    Mit deinem aktuellen Vorrat ist leider kein Rezept vollständig kochbar.
  </p>

  <h3>Fast kochbar</h3>
  <ul v-if="almost.length" class="list">
    <li v-for="entry in almost" :key="entry.recipe.id" class="card clickable" @click="open(entry.recipe.id)">
      <div>
        <div>{{ entry.recipe.name }}</div>
        <ul class="missing">
          <li v-for="(m, idx) in entry.missing" :key="idx">
            {{ fmt(m.amount, m.unit) }} {{ m.name }}<span v-if="m.partial"> (zu wenig)</span>
          </li>
        </ul>
      </div>
      <span class="badge warn">{{ entry.missing.length }} fehlt</span>
    </li>
  </ul>
  <p v-else class="empty">Keine Rezepte, bei denen nur wenige Zutaten fehlen.</p>
</template>
