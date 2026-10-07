export const UNIT_OPTIONS = ["g", "kg", "ml", "l", "Stk", "EL", "TL", "Prise"];

export function fmt(amount, unit) {
  const n = Math.round(Number(amount) * 100) / 100;
  return n.toLocaleString("de-DE") + " " + unit;
}

export function unitOptions(current) {
  return current && !UNIT_OPTIONS.includes(current) ? [...UNIT_OPTIONS, current] : UNIT_OPTIONS;
}
