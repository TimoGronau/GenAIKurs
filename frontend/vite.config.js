import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Leitet /api-Anfragen an das FastAPI-Backend weiter.
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
