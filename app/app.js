(function () {
  "use strict";

  const STORAGE_KEY = "kochbuch-v1";
  const UNIT_OPTIONS = ["g", "kg", "ml", "l", "Stk", "EL", "TL", "Prise"];
  const view = document.getElementById("view");

  // ---------- Daten ----------

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && Array.isArray(data.recipes) && Array.isArray(data.pantry)) return data;
    } catch (e) {
      // ungültige oder fehlende Daten -> Beispieldaten
    }
    return sampleData();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      toast("Speichern im Browser nicht möglich.");
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function sampleData() {
    return {
      recipes: [
        {
          id: uid(),
          name: "Spaghetti Aglio e Olio",
          ingredients: [
            { name: "Spaghetti", amount: 250, unit: "g" },
            { name: "Knoblauch", amount: 3, unit: "Stk" },
            { name: "Olivenöl", amount: 4, unit: "EL" },
          ],
          steps: "Spaghetti kochen.\nKnoblauch in Scheiben schneiden und im Öl anbraten.\nNudeln untermischen.",
        },
        {
          id: uid(),
          name: "Pfannkuchen",
          ingredients: [
            { name: "Mehl", amount: 200, unit: "g" },
            { name: "Milch", amount: 400, unit: "ml" },
            { name: "Eier", amount: 2, unit: "Stk" },
          ],
          steps: "Alle Zutaten verrühren, 10 Minuten quellen lassen und portionsweise ausbacken.",
        },
        {
          id: uid(),
          name: "Rührei",
          ingredients: [
            { name: "Eier", amount: 3, unit: "Stk" },
            { name: "Butter", amount: 10, unit: "g" },
            { name: "Schnittlauch", amount: 1, unit: "EL" },
          ],
          steps: "Eier verquirlen, in Butter stocken lassen, mit Schnittlauch bestreuen.",
        },
      ],
      pantry: [
        { id: uid(), name: "Spaghetti", amount: 500, unit: "g" },
        { id: uid(), name: "Knoblauch", amount: 5, unit: "Stk" },
        { id: uid(), name: "Olivenöl", amount: 20, unit: "EL" },
        { id: uid(), name: "Eier", amount: 4, unit: "Stk" },
        { id: uid(), name: "Mehl", amount: 1, unit: "kg" },
        { id: uid(), name: "Milch", amount: 0.25, unit: "l" },
      ],
    };
  }

  let state = load();
  let route = { view: "recipes" };
  let searchQuery = "";

  // ---------- Hilfen ----------

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
      else if (key === "class") el.className = value;
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
  }

  function fmt(amount, unit) {
    const n = Math.round(Number(amount) * 100) / 100;
    return n.toLocaleString("de-DE") + " " + unit;
  }

  function unitSelect(value) {
    const options = UNIT_OPTIONS.slice();
    if (value && !options.includes(value)) options.push(value);
    return h("select", { "aria-label": "Einheit" },
      options.map((u) => h("option", { value: u, selected: u === value }, u)));
  }

  function toast(message) {
    const el = h("div", { class: "toast", role: "status" }, message);
    document.body.append(el);
    setTimeout(() => el.remove(), 2500);
  }

  function go(next) {
    route = next;
    render();
    view.focus();
    window.scrollTo(0, 0);
  }

  // ---------- Ansichten ----------

  // US-02 + US-06: Übersicht mit Suche
  function renderRecipeList() {
    const list = h("ul", { class: "list" });

    function fill() {
      list.replaceChildren(
        ...Logic.searchRecipes(state.recipes, searchQuery).map((r) =>
          h("li", { class: "card clickable", onclick: () => go({ view: "detail", id: r.id }) },
            h("span", {}, r.name),
            h("span", { class: "meta" }, r.ingredients.length + " Zutaten")))
      );
      if (!list.children.length) {
        list.append(h("li", { class: "empty" },
          state.recipes.length ? "Keine Rezepte gefunden." : "Noch keine Rezepte angelegt."));
      }
    }

    const search = h("input", {
      type: "search",
      placeholder: "Nach Name oder Zutat suchen …",
      "aria-label": "Rezepte suchen",
      value: searchQuery,
      oninput: (e) => { searchQuery = e.target.value; fill(); },
    });

    fill();
    return [
      h("h2", {}, "Rezepte"),
      h("div", { class: "toolbar" },
        search,
        h("button", { class: "btn primary", onclick: () => go({ view: "form" }) }, "+ Neues Rezept")),
      list,
    ];
  }

  // US-03: Detailansicht, US-05: Löschen mit Sicherheitsabfrage, US-12: Kochen
  function renderRecipeDetail(id) {
    const recipe = state.recipes.find((r) => r.id === id);
    if (!recipe) return renderRecipeList();
    const missing = Logic.missingIngredients(recipe, state.pantry);

    return [
      h("p", {}, h("button", { class: "link", onclick: () => go({ view: "recipes" }) }, "← Alle Rezepte")),
      h("h2", {}, recipe.name),
      missing.length
        ? h("span", { class: "badge warn" }, missing.length + " Zutat(en) fehlen")
        : h("span", { class: "badge ok" }, "Mit deinem Vorrat kochbar"),
      h("h3", {}, "Zutaten"),
      h("ul", {}, recipe.ingredients.map((i) => h("li", {}, fmt(i.amount, i.unit) + " " + i.name))),
      h("h3", {}, "Zubereitung"),
      h("div", { class: "card steps" }, recipe.steps || "Keine Zubereitungsschritte erfasst."),
      h("div", { class: "actions" },
        h("button", { class: "btn", onclick: () => go({ view: "form", id }) }, "Bearbeiten"),
        h("button", { class: "btn", disabled: missing.length > 0, onclick: () => cook(recipe) }, "Gekocht – Vorrat abziehen"),
        h("button", { class: "btn danger", onclick: () => removeRecipe(recipe) }, "Löschen")),
    ];
  }

  function removeRecipe(recipe) {
    if (!confirm(`Rezept „${recipe.name}“ wirklich löschen?`)) return;
    state.recipes = state.recipes.filter((r) => r.id !== recipe.id);
    save();
    toast("Rezept gelöscht.");
    go({ view: "recipes" });
  }

  function cook(recipe) {
    if (!confirm(`Zutaten für „${recipe.name}“ vom Vorrat abziehen?`)) return;
    state.pantry = Logic.deductRecipe(recipe, state.pantry);
    save();
    toast("Vorrat aktualisiert. Guten Appetit!");
    render();
  }

  // US-01 + US-04: Anlegen / Bearbeiten
  function renderRecipeForm(id) {
    const existing = id ? state.recipes.find((r) => r.id === id) : null;
    const name = h("input", { id: "f-name", value: existing ? existing.name : "", required: true });
    const rows = h("div");
    const steps = h("textarea", { id: "f-steps" });
    steps.value = existing ? existing.steps : "";
    const errors = h("ul", { class: "errors", role: "alert" });

    function addRow(ing) {
      const row = h("div", { class: "ing-row" },
        h("input", { placeholder: "Zutat", "aria-label": "Zutat", value: ing ? ing.name : "" }),
        h("input", { type: "number", min: "0", step: "any", placeholder: "Menge", "aria-label": "Menge", value: ing ? ing.amount : "" }),
        unitSelect(ing ? ing.unit : "g"),
        h("button", { type: "button", class: "btn small", "aria-label": "Zutat entfernen", onclick: () => row.remove() }, "✕"));
      rows.append(row);
    }

    (existing ? existing.ingredients : [null]).forEach(addRow);

    function submit(e) {
      e.preventDefault();
      const ingredients = [...rows.children].map((row) => {
        const [n, a, u] = row.querySelectorAll("input, select");
        return { name: n.value.trim(), amount: Number(a.value) || 0, unit: u.value };
      }).filter((i) => i.name);
      const recipe = {
        id: existing ? existing.id : uid(),
        name: name.value.trim(),
        ingredients,
        steps: steps.value.trim(),
      };
      const problems = Logic.validateRecipe(recipe);
      if (problems.length) {
        errors.replaceChildren(...problems.map((p) => h("li", {}, p)));
        return;
      }
      if (existing) state.recipes = state.recipes.map((r) => (r.id === recipe.id ? recipe : r));
      else state.recipes.push(recipe);
      save();
      toast(existing ? "Rezept gespeichert." : "Rezept angelegt.");
      go({ view: "detail", id: recipe.id });
    }

    return [
      h("h2", {}, existing ? "Rezept bearbeiten" : "Neues Rezept"),
      h("form", { onsubmit: submit, novalidate: true },
        h("label", { for: "f-name" }, "Name *"),
        name,
        h("label", {}, "Zutaten *"),
        rows,
        h("button", { type: "button", class: "btn small", onclick: () => addRow(null) }, "+ Zutat"),
        h("label", { for: "f-steps" }, "Zubereitung"),
        steps,
        errors,
        h("div", { class: "actions" },
          h("button", { type: "submit", class: "btn primary" }, "Speichern"),
          h("button", { type: "button", class: "btn",
            onclick: () => go(existing ? { view: "detail", id } : { view: "recipes" }) }, "Abbrechen"))),
    ];
  }

  // US-07, US-08, US-09: Vorrat
  function renderPantry() {
    const name = h("input", { placeholder: "Lebensmittel", "aria-label": "Lebensmittel", required: true });
    const amount = h("input", { type: "number", min: "0", step: "any", placeholder: "Menge", "aria-label": "Menge" });
    const unit = unitSelect("g");

    function add(e) {
      e.preventDefault();
      const n = name.value.trim();
      const a = Number(amount.value);
      if (!n || !(a > 0)) { toast("Bitte Lebensmittel und Menge angeben."); return; }
      const same = state.pantry.find((p) => p.name.toLowerCase() === n.toLowerCase() && p.unit === unit.value);
      if (same) same.amount = Math.round((same.amount + a) * 1000) / 1000;
      else state.pantry.push({ id: uid(), name: n, amount: a, unit: unit.value });
      save();
      render();
    }

    const items = state.pantry.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));

    return [
      h("h2", {}, "Vorrat"),
      h("form", { class: "pantry-form", onsubmit: add },
        name, amount, unit,
        h("button", { type: "submit", class: "btn primary" }, "Hinzufügen")),
      items.length
        ? h("ul", { class: "list" }, items.map((item) =>
            h("li", { class: "card" },
              h("span", {}, item.name),
              h("span", { class: "pantry-amount" },
                h("input", {
                  type: "number", min: "0", step: "any", value: item.amount,
                  "aria-label": "Menge " + item.name,
                  onchange: (e) => updatePantry(item.id, Number(e.target.value)),
                }),
                h("span", { class: "meta" }, item.unit),
                h("button", { class: "btn small danger", "aria-label": item.name + " entfernen",
                  onclick: () => updatePantry(item.id, 0) }, "✕")))))
        : h("p", { class: "empty" }, "Dein Vorrat ist leer."),
    ];
  }

  function updatePantry(id, amount) {
    if (!(amount > 0)) state.pantry = state.pantry.filter((p) => p.id !== id);
    else state.pantry.find((p) => p.id === id).amount = amount;
    save();
    render();
  }

  // US-10 + US-11: Was kann ich heute kochen?
  function renderToday() {
    const { cookable, almost } = Logic.classifyRecipes(state.recipes, state.pantry, 3);
    const open = (r) => () => go({ view: "detail", id: r.id });

    return [
      h("h2", {}, "Was kann ich heute kochen?"),
      h("h3", {}, "Jetzt kochbar"),
      cookable.length
        ? h("ul", { class: "list" }, cookable.map((r) =>
            h("li", { class: "card clickable", onclick: open(r) },
              h("span", {}, r.name), h("span", { class: "badge ok" }, "alles da"))))
        : h("p", { class: "empty" }, "Mit deinem aktuellen Vorrat ist leider kein Rezept vollständig kochbar."),
      h("h3", {}, "Fast kochbar"),
      almost.length
        ? h("ul", { class: "list" }, almost.map(({ recipe, missing }) =>
            h("li", { class: "card clickable", onclick: open(recipe) },
              h("div", {},
                h("div", {}, recipe.name),
                h("ul", { class: "missing" }, missing.map((m) =>
                  h("li", {}, fmt(m.amount, m.unit) + " " + m.name + (m.partial ? " (zu wenig)" : ""))))),
              h("span", { class: "badge warn" }, missing.length + " fehlt"))))
        : h("p", { class: "empty" }, "Keine Rezepte, bei denen nur wenige Zutaten fehlen."),
    ];
  }

  // ---------- Rendering ----------

  function render() {
    const tab = route.view === "detail" || route.view === "form" ? "recipes" : route.view;
    document.querySelectorAll(".tab").forEach((b) => {
      if (b.dataset.view === tab) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });

    let content;
    if (route.view === "detail") content = renderRecipeDetail(route.id);
    else if (route.view === "form") content = renderRecipeForm(route.id);
    else if (route.view === "pantry") content = renderPantry();
    else if (route.view === "today") content = renderToday();
    else content = renderRecipeList();
    view.replaceChildren(...[].concat(content));
  }

  document.querySelectorAll(".tab").forEach((b) =>
    b.addEventListener("click", () => go({ view: b.dataset.view })));

  render();
})();
