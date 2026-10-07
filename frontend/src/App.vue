<script setup>
import { useFlash } from "./flash.js";

const flash = useFlash();
</script>

<template>
  <header class="topbar">
    <h1>Kochbuch</h1>
    <nav class="tabs" aria-label="Bereiche">
      <router-link class="tab" to="/recipes">Rezepte</router-link>
      <router-link class="tab" to="/pantry">Vorrat</router-link>
      <router-link class="tab" to="/today">Heute kochen</router-link>
    </nav>
  </header>

  <main>
    <router-view />
  </main>

  <div v-if="flash.message" class="flash" role="status">{{ flash.message }}</div>
</template>
