// Aufrufe der eigenen API aus dem Browser. Wirft einen Fehler mit der Meldung des Servers.
export async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Der Server ist nicht erreichbar. Bitte später erneut versuchen.");
  return data;
}
