import { reactive } from "vue";

// Einfache globale Benachrichtigung (Toast) fuer Rueckmeldungen.
const state = reactive({ message: "" });
let timer = null;

export function toast(message) {
  state.message = message;
  clearTimeout(timer);
  timer = setTimeout(() => (state.message = ""), 2500);
}

export function useFlash() {
  return state;
}
