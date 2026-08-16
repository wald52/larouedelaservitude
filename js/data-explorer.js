// ===============================
//  data-explorer.js — Vue « Données & analyse »
// ===============================
// La liste intégrale des 371 prélèvements obligatoires, avec les outils qu'on
// attend d'un jeu de données — filtres combinables, tri multi-critères,
// statistiques descriptives, graphiques et export.
//
// C'était un second document ; c'est maintenant une vue d'index.html, et ce
// module n'est plus le point d'entrée d'une page : js/app.js l'importe
// dynamiquement à la première ouverture de l'onglet « Données » et appelle
// initDataExplorer(). Le démarrage de la roue ne paie donc ni le tableau, ni
// les statistiques, ni les graphiques. Tout ce qui appartient à la page —
// la barre d'onglets, les réglages, le service worker — reste chez app.js.
//
// Principes repris de l'application principale :
// - les données viennent de js/entries.js (cache IndexedDB puis revalidation
//   réseau sur le champ `version`), donc la vue fonctionne hors ligne et se
//   met à jour toute seule via l'événement `entriesUpdated` ;
// - aucun calcul statistique n'est écrit ici : tout vient de js/stats.js, qui
//   est testé sous Node.
//
// L'état de la vue (recherche, filtres, tri) est reflété dans l'URL, à côté du
// `vue=donnees` qui dit quelle vue est ouverte : une sélection se partage ou se
// met en favori telle quelle.

import { loadFullData, formatRecette, getDataVersion } from "./entries.js?v=c56272d2";
import {
  describe,
  gini,
  topShare,
  lorenzPoints,
  groupByPeriod,
  magnitudeBuckets,
  finiteNumbers
} from "./stats.js?v=4f243f37";
import {
  renderBarChart,
  renderHorizontalBarChart,
  renderLorenzChart,
  renderScatterChart
} from "./charts.js?v=9c0905cd";

function requireElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`[DATA] Élément DOM introuvable : #${id}`);
  }
  return element;
}

// ===============================
//  Colonnes
// ===============================
// `sortValue` renvoie la valeur comparable, `render` le contenu de la cellule.
// Une colonne dérivée (part du total) se déclare donc au même endroit que les
// colonnes brutes.

const COLUMNS = [
  {
    key: "nom",
    label: "Nom court",
    type: "text",
    title: "Libellé affiché sur la roue",
    sortValue: (row) => row.nom,
    render: (row) => row.nom
  },
  {
    key: "nom_complet",
    label: "Intitulé complet",
    type: "text",
    title: "Intitulé officiel du prélèvement",
    sortValue: (row) => row.nom_complet,
    render: (row) => row.nom_complet
  },
  {
    key: "recette_meur",
    label: "Recette (M€)",
    type: "number",
    title: "Recette annuelle, en millions d'euros",
    sortValue: (row) => row.recette_meur,
    render: (row) => (row.recette_meur === null ? "—" : formatNumber(row.recette_meur, 1))
  },
  {
    key: "part",
    label: "Part du total",
    type: "number",
    title: "Part de cette recette dans le total des recettes connues",
    sortValue: (row) => row.part,
    render: (row) => formatShare(row.part)
  },
  {
    key: "annee",
    label: "Création",
    type: "number",
    title: "Année de création du prélèvement",
    sortValue: (row) => row.annee,
    render: (row) => (row.annee === null ? "—" : String(row.annee))
  },
  {
    key: "id",
    label: "Identifiant",
    type: "text",
    title: "Identifiant technique, stable entre deux versions des données",
    sortValue: (row) => row.id,
    render: (row) => row.id
  }
];

const COLUMNS_BY_KEY = new Map(COLUMNS.map((column) => [column.key, column]));

// Tris proposés en un clic, pour ne pas obliger à composer les critères à la
// main. Chacun reste un tri multi-critères ordinaire, modifiable ensuite.
const SORT_PRESETS = {
  "recette-desc": { label: "Recettes décroissantes", sort: [{ key: "recette_meur", dir: "desc" }] },
  "recette-asc": { label: "Recettes croissantes", sort: [{ key: "recette_meur", dir: "asc" }] },
  "annee-asc": {
    label: "Les plus anciens",
    sort: [
      { key: "annee", dir: "asc" },
      { key: "nom_complet", dir: "asc" }
    ]
  },
  "annee-desc": {
    label: "Les plus récents",
    sort: [
      { key: "annee", dir: "desc" },
      { key: "recette_meur", dir: "desc" }
    ]
  },
  alpha: { label: "Ordre alphabétique", sort: [{ key: "nom_complet", dir: "asc" }] }
};

const DEFAULT_SORT = [{ key: "recette_meur", dir: "desc" }];

// ===============================
//  Formats
// ===============================

const NUMBER_FORMATS = new Map();

function formatNumber(value, fractionDigits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";

  if (!NUMBER_FORMATS.has(fractionDigits)) {
    NUMBER_FORMATS.set(
      fractionDigits,
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: fractionDigits
      })
    );
  }

  return NUMBER_FORMATS.get(fractionDigits).format(value);
}

// Montants en millions d'euros : au-delà du millier, on bascule en milliards,
// sinon les axes deviennent illisibles.
function formatMontant(meur) {
  if (meur === null || meur === undefined || !Number.isFinite(meur)) return "—";
  if (Math.abs(meur) >= 1000) return `${formatNumber(meur / 1000, 1)} Md€`;
  if (Math.abs(meur) >= 1) return `${formatNumber(meur, 1)} M€`;
  if (meur === 0) return "0 €";
  return `${formatNumber(meur, 2)} M€`;
}

function formatPercent(fraction, fractionDigits = 1) {
  if (fraction === null || fraction === undefined || !Number.isFinite(fraction)) return "—";
  return `${formatNumber(fraction * 100, fractionDigits)} %`;
}

// Une part réelle mais minuscule ne doit pas s'afficher « 0 % » : sur 371
// prélèvements, la plupart pèsent moins d'un centième du total.
function formatShare(fraction) {
  if (fraction === null || fraction === undefined || !Number.isFinite(fraction)) return "—";
  if (fraction > 0 && fraction < 0.0001) return "< 0,01 %";
  return formatPercent(fraction, 2);
}

// ===============================
//  État
// ===============================

const state = {
  rows: [],
  filtered: [],
  dataVersion: null,
  totalKnownRecettes: 0,
  search: "",
  recette: "all", // all | with | without
  annee: "all", // all | with | without
  anneeMin: null,
  anneeMax: null,
  recetteMin: null,
  recetteMax: null,
  sort: [...DEFAULT_SORT],
  periodSize: 10,
  topCount: 15,
  selectedId: null
};

const elements = {};
let searchDebounce = 0;

// ===============================
//  Préparation des données
// ===============================

function prepareRows(entries) {
  const total = entries.reduce(
    (acc, entry) => acc + (Number.isFinite(entry.recette_meur) ? entry.recette_meur : 0),
    0
  );

  state.totalKnownRecettes = total;

  return entries.map((entry) => {
    const recette = Number.isFinite(entry.recette_meur) ? entry.recette_meur : null;
    const annee = Number.isFinite(entry.annee) ? entry.annee : null;

    return {
      ...entry,
      recette_meur: recette,
      annee,
      part: recette !== null && total > 0 ? recette / total : null,
      // Index de recherche pré-calculé : la recherche est relancée à chaque
      // frappe sur 371 lignes, autant ne pas normaliser à chaque fois.
      haystack: normalize(`${entry.nom} ${entry.nom_complet} ${entry.id}`)
    };
  });
}

// Recherche insensible à la casse *et* aux accents : « précompte » doit
// répondre à « precompte ». NFD sépare la lettre de son accent, la plage
// U+0300–U+036F retire ensuite les accents ainsi isolés.
function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ===============================
//  Filtres et tri
// ===============================

function filterRows() {
  const needle = normalize(state.search).trim();
  const terms = needle ? needle.split(/\s+/) : [];

  return state.rows.filter((row) => {
    if (terms.length && !terms.every((term) => row.haystack.includes(term))) return false;

    if (state.recette === "with" && row.recette_meur === null) return false;
    if (state.recette === "without" && row.recette_meur !== null) return false;

    if (state.annee === "with" && row.annee === null) return false;
    if (state.annee === "without" && row.annee !== null) return false;

    // Une borne numérique exclut mécaniquement les valeurs inconnues : filtrer
    // sur « recette ≥ 100 » ne peut pas ramener un prélèvement sans recette.
    if (
      state.recetteMin !== null &&
      (row.recette_meur === null || row.recette_meur < state.recetteMin)
    ) {
      return false;
    }
    if (
      state.recetteMax !== null &&
      (row.recette_meur === null || row.recette_meur > state.recetteMax)
    ) {
      return false;
    }
    if (state.anneeMin !== null && (row.annee === null || row.annee < state.anneeMin)) return false;
    if (state.anneeMax !== null && (row.annee === null || row.annee > state.anneeMax)) return false;

    return true;
  });
}

function isMissing(value) {
  return value === null || value === undefined || value === "";
}

// Les valeurs inconnues vont toujours en fin de liste, y compris en tri
// décroissant : une colonne de « — » en tête de classement n'apprend rien à
// personne. Le sens du tri n'est donc appliqué qu'entre valeurs présentes.
function compareValues(a, b, type, dir) {
  if (isMissing(a) && isMissing(b)) return 0;
  if (isMissing(a)) return 1;
  if (isMissing(b)) return -1;

  const comparison =
    type === "number" ? a - b : String(a).localeCompare(String(b), "fr", { sensitivity: "base" });

  return dir === "desc" ? -comparison : comparison;
}

// Tri multi-critères : les critères sont appliqués dans l'ordre, le suivant ne
// départageant que les ex æquo du précédent.
function sortRows(rows) {
  const criteria = state.sort
    .map((criterion) => ({ column: COLUMNS_BY_KEY.get(criterion.key), dir: criterion.dir }))
    .filter((criterion) => Boolean(criterion.column));

  if (!criteria.length) return rows;

  return [...rows].sort((rowA, rowB) => {
    for (const { column, dir } of criteria) {
      const comparison = compareValues(
        column.sortValue(rowA),
        column.sortValue(rowB),
        column.type,
        dir
      );
      if (comparison !== 0) return comparison;
    }
    return 0;
  });
}

// Sens le plus utile au premier clic : décroissant pour un nombre (les plus
// gros montants d'abord), croissant pour du texte (ordre alphabétique).
function firstDirection(column) {
  return column.type === "number" ? "desc" : "asc";
}

/**
 * Fait avancer un critère dans le cycle « sens naturel → sens inverse →
 * retiré ».
 * @param {string} key - Clé de colonne
 * @param {boolean} additive - Maj+clic : compléter le tri au lieu de le remplacer
 */
function toggleSort(key, additive) {
  const column = COLUMNS_BY_KEY.get(key);
  if (!column) return;

  const existing = state.sort.find((criterion) => criterion.key === key);

  if (!existing) {
    const criterion = { key, dir: firstDirection(column) };
    state.sort = additive ? [...state.sort, criterion] : [criterion];
    return;
  }

  if (existing.dir === firstDirection(column)) {
    const flipped = { key, dir: existing.dir === "asc" ? "desc" : "asc" };
    state.sort = additive
      ? state.sort.map((criterion) => (criterion.key === key ? flipped : criterion))
      : [flipped];
    return;
  }

  state.sort = state.sort.filter((criterion) => criterion.key !== key);
}

// ===============================
//  URL partageable
// ===============================

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  state.search = params.get("q") || "";
  state.recette = ["all", "with", "without"].includes(params.get("recette"))
    ? params.get("recette")
    : "all";
  state.annee = ["all", "with", "without"].includes(params.get("annee"))
    ? params.get("annee")
    : "all";
  state.recetteMin = parseNumberParam(params.get("rmin"));
  state.recetteMax = parseNumberParam(params.get("rmax"));
  state.anneeMin = parseNumberParam(params.get("amin"));
  state.anneeMax = parseNumberParam(params.get("amax"));

  const sort = parseSortParam(params.get("tri"));
  if (sort.length) state.sort = sort;

  const period = Number(params.get("periode"));
  if ([5, 10, 25, 50].includes(period)) state.periodSize = period;
}

function parseNumberParam(value) {
  if (value === null || value.trim() === "") return null;
  const numeric = Number(value.replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
}

function parseSortParam(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((chunk) => {
      const [key, dir] = chunk.split(":");
      if (!COLUMNS_BY_KEY.has(key)) return null;
      return { key, dir: dir === "asc" ? "asc" : "desc" };
    })
    .filter(Boolean);
}

function writeStateToUrl() {
  const params = new URLSearchParams();

  // La vue ouverte fait partie de l'adresse : sans elle, un lien vers une
  // sélection filtrée rouvrirait la roue (voir openView dans js/menu.js).
  params.set("vue", "donnees");

  if (state.search) params.set("q", state.search);
  if (state.recette !== "all") params.set("recette", state.recette);
  if (state.annee !== "all") params.set("annee", state.annee);
  if (state.recetteMin !== null) params.set("rmin", String(state.recetteMin));
  if (state.recetteMax !== null) params.set("rmax", String(state.recetteMax));
  if (state.anneeMin !== null) params.set("amin", String(state.anneeMin));
  if (state.anneeMax !== null) params.set("amax", String(state.anneeMax));
  if (state.periodSize !== 10) params.set("periode", String(state.periodSize));

  const sort = state.sort.map((criterion) => `${criterion.key}:${criterion.dir}`).join(",");
  if (sort) params.set("tri", sort);

  // L'état d'historique garde la vue : il est relu tel quel par le gestionnaire
  // de `popstate` de js/menu.js quand on revient en arrière.
  window.history.replaceState({ view: "donnees" }, "", `${window.location.pathname}?${params}`);
}

// ===============================
//  Rendu : indicateurs
// ===============================

function statCard(label, value, hint) {
  const card = document.createElement("div");
  card.className = "stat-card";

  const valueNode = document.createElement("div");
  valueNode.className = "stat-value";
  valueNode.textContent = value;

  const labelNode = document.createElement("div");
  labelNode.className = "stat-label";
  labelNode.textContent = label;

  card.append(valueNode, labelNode);

  if (hint) {
    const hintNode = document.createElement("div");
    hintNode.className = "stat-hint";
    hintNode.textContent = hint;
    card.appendChild(hintNode);
  }

  return card;
}

function renderStats(rows) {
  const recettes = finiteNumbers(rows.map((row) => row.recette_meur));
  const annees = finiteNumbers(rows.map((row) => row.annee));
  const summary = describe(recettes);
  const concentration = gini(recettes);
  const top10 = topShare(recettes, 10);

  const cards = [
    statCard(
      "Prélèvements sélectionnés",
      formatNumber(rows.length),
      `sur ${formatNumber(state.rows.length)} au total`
    ),
    statCard(
      "Recettes cumulées",
      formatMontant(summary.sum),
      state.totalKnownRecettes > 0
        ? `${formatPercent(summary.sum / state.totalKnownRecettes)} des recettes connues`
        : null
    ),
    statCard(
      "Recette moyenne",
      formatMontant(summary.mean),
      `écart-type ${formatMontant(summary.stdDev)}`
    ),
    statCard(
      "Recette médiane",
      formatMontant(summary.median),
      `quartiles ${formatMontant(summary.p25)} – ${formatMontant(summary.p75)}`
    ),
    statCard(
      "Recette maximale",
      formatMontant(summary.max),
      summary.min === null ? null : `minimum ${formatMontant(summary.min)}`
    ),
    statCard(
      "Concentration (Gini)",
      concentration === null ? "—" : formatNumber(concentration, 3),
      top10 === null ? null : `top 10 = ${formatPercent(top10)} des recettes`
    ),
    statCard(
      "Recette renseignée",
      `${formatNumber(summary.count)} / ${formatNumber(rows.length)}`,
      rows.length ? formatPercent(summary.count / rows.length) + " de couverture" : null
    ),
    statCard(
      "Année renseignée",
      `${formatNumber(annees.length)} / ${formatNumber(rows.length)}`,
      annees.length ? `de ${Math.min(...annees)} à ${Math.max(...annees)}` : null
    )
  ];

  elements.statsGrid.replaceChildren(...cards);
}

// ===============================
//  Rendu : graphiques
// ===============================

function renderCharts(rows) {
  const recettes = finiteNumbers(rows.map((row) => row.recette_meur));

  renderBarChart(elements.chartPeriods, {
    data: groupByPeriod(
      rows.map((row) => row.annee),
      state.periodSize
    ).map((bucket) => ({
      label: String(bucket.start),
      value: bucket.count,
      title: `${bucket.start}–${bucket.end} : ${bucket.count} prélèvement(s) créé(s)`
    })),
    ariaLabel: "Nombre de prélèvements créés par période",
    formatValue: (value) => formatNumber(value),
    axisLabel: "Année de création",
    emptyMessage: "Aucune année de création connue dans cette sélection."
  });

  const top = [...rows]
    .filter((row) => row.recette_meur !== null)
    .sort((a, b) => b.recette_meur - a.recette_meur)
    .slice(0, state.topCount);

  renderHorizontalBarChart(elements.chartTop, {
    data: top.map((row) => ({
      label: row.nom,
      value: row.recette_meur,
      title: `${row.nom_complet} : ${formatMontant(row.recette_meur)}`
    })),
    ariaLabel: `Les ${state.topCount} prélèvements les plus rentables de la sélection`,
    formatValue: formatMontant,
    emptyMessage: "Aucune recette connue dans cette sélection."
  });

  const concentration = gini(recettes);
  renderLorenzChart(elements.chartLorenz, {
    points: lorenzPoints(recettes),
    ariaLabel:
      concentration === null
        ? "Courbe de concentration des recettes"
        : `Courbe de concentration des recettes, indice de Gini ${formatNumber(concentration, 3)}`,
    emptyMessage: "Pas assez de recettes connues pour tracer la concentration."
  });

  renderBarChart(elements.chartMagnitudes, {
    data: magnitudeBuckets(recettes).map((bucket) => ({
      label: formatMontant(bucket.min),
      value: bucket.count,
      title: `${bucket.count} prélèvement(s) entre ${formatMontant(bucket.min)} et ${formatMontant(bucket.max)}`
    })),
    ariaLabel: "Répartition des recettes par ordre de grandeur",
    formatValue: (value) => formatNumber(value),
    axisLabel: "Ordre de grandeur de la recette",
    emptyMessage: "Aucune recette strictement positive dans cette sélection."
  });

  renderScatterChart(elements.chartScatter, {
    points: rows
      .filter((row) => row.annee !== null && row.recette_meur !== null && row.recette_meur > 0)
      .map((row) => ({ x: row.annee, y: row.recette_meur, label: row.nom })),
    ariaLabel: "Recette en fonction de l'année de création",
    formatValue: formatMontant,
    emptyMessage: "Aucun prélèvement de cette sélection n'a à la fois une année et une recette."
  });
}

// ===============================
//  Rendu : tri et tableau
// ===============================

function renderSortChips() {
  elements.sortChips.textContent = "";

  if (!state.sort.length) {
    const empty = document.createElement("span");
    empty.className = "sort-empty";
    empty.textContent = "Aucun tri actif — cliquez sur un en-tête de colonne.";
    elements.sortChips.appendChild(empty);
    return;
  }

  state.sort.forEach((criterion, index) => {
    const column = COLUMNS_BY_KEY.get(criterion.key);
    if (!column) return;

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "sort-chip";
    chip.dataset.sortKey = criterion.key;
    chip.textContent = `${index + 1}. ${column.label} ${criterion.dir === "asc" ? "↑" : "↓"}`;
    chip.setAttribute(
      "aria-label",
      `Retirer le critère de tri ${index + 1} : ${column.label}, ordre ${
        criterion.dir === "asc" ? "croissant" : "décroissant"
      }`
    );
    chip.title = "Cliquer pour retirer ce critère";
    elements.sortChips.appendChild(chip);
  });
}

function renderTableHead() {
  const row = document.createElement("tr");

  const rank = document.createElement("th");
  rank.scope = "col";
  rank.className = "col-rank";
  rank.textContent = "#";
  row.appendChild(rank);

  for (const column of COLUMNS) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.dataset.key = column.key;
    cell.className = `col-${column.key}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "sort-button";
    button.dataset.sortKey = column.key;
    button.title = `${column.title} — clic pour trier, Maj+clic pour ajouter un critère`;

    const label = document.createElement("span");
    label.textContent = column.label;

    const indicator = document.createElement("span");
    indicator.className = "sort-indicator";

    const position = state.sort.findIndex((criterion) => criterion.key === column.key);
    if (position === -1) {
      cell.setAttribute("aria-sort", "none");
      indicator.textContent = "";
    } else {
      const criterion = state.sort[position];
      cell.setAttribute("aria-sort", criterion.dir === "asc" ? "ascending" : "descending");
      indicator.textContent =
        state.sort.length > 1
          ? `${criterion.dir === "asc" ? "↑" : "↓"}${position + 1}`
          : criterion.dir === "asc"
            ? "↑"
            : "↓";
    }

    button.append(label, indicator);
    cell.appendChild(button);
    row.appendChild(cell);
  }

  elements.tableHead.replaceChildren(row);
}

function renderTable(rows) {
  const fragment = document.createDocumentFragment();

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-label", `Détails de ${row.nom_complet}`);
    if (row.id === state.selectedId) tr.classList.add("is-selected");

    const rank = document.createElement("td");
    rank.className = "col-rank";
    rank.textContent = String(index + 1);
    tr.appendChild(rank);

    for (const column of COLUMNS) {
      const td = document.createElement("td");
      td.className = `col-${column.key}${column.type === "number" ? " is-number" : ""}`;
      td.textContent = column.render(row);
      tr.appendChild(td);
    }

    fragment.appendChild(tr);
  });

  elements.tableBody.replaceChildren(fragment);
  elements.tableEmpty.hidden = rows.length > 0;
}

// ===============================
//  Rendu : fiche détaillée
// ===============================

function renderDetail(row) {
  if (!row) {
    elements.detail.hidden = true;
    elements.detail.setAttribute("aria-hidden", "true");
    return;
  }

  const rank = state.filtered.findIndex((candidate) => candidate.id === row.id) + 1 || null;

  elements.detailTitle.textContent = row.nom_complet;

  const rows = [
    ["Nom court (roue)", row.nom],
    ["Identifiant", row.id],
    ["Recette", formatRecette(row) || "Non renseignée"],
    ["Recette (M€)", row.recette_meur === null ? "—" : formatNumber(row.recette_meur, 1)],
    [
      "Part des recettes connues",
      row.part === null ? "—" : `${formatPercent(row.part, 3)} du total du jeu de données`
    ],
    ["Année de création", row.annee === null ? "Non renseignée" : String(row.annee)],
    ["Rang dans la sélection", rank ? `${rank} / ${formatNumber(state.filtered.length)}` : "—"]
  ];

  elements.detailList.replaceChildren(
    ...rows.flatMap(([label, value]) => {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      return [dt, dd];
    })
  );

  elements.detailJson.textContent = JSON.stringify(
    {
      id: row.id,
      nom: row.nom,
      nom_complet: row.nom_complet,
      recette: row.recette,
      recette_meur: row.recette_meur,
      annee: row.annee
    },
    null,
    2
  );

  elements.detail.hidden = false;
  elements.detail.setAttribute("aria-hidden", "false");
}

function selectRow(id) {
  state.selectedId = id;
  const row = state.rows.find((candidate) => candidate.id === id) || null;
  renderDetail(row);

  for (const tr of elements.tableBody.querySelectorAll("tr")) {
    tr.classList.toggle("is-selected", tr.dataset.id === id);
  }

  if (row) {
    elements.detail.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

// ===============================
//  Export
// ===============================

function currentSelectionAsObjects() {
  return state.filtered.map((row) => ({
    id: row.id,
    nom: row.nom,
    nom_complet: row.nom_complet,
    recette: row.recette,
    recette_meur: row.recette_meur,
    annee: row.annee,
    // Arrondie : exporter 0,21513006384447714 ferait croire à une précision
    // que la source n'a pas.
    part_des_recettes_connues: row.part === null ? null : Number(row.part.toFixed(6))
  }));
}

// Le point-virgule est le séparateur attendu par Excel en configuration
// française, et la virgule décimale va avec (même choix que l'export de
// l'historique dans js/menu.js).
function toCsv(objects) {
  if (!objects.length) return "";

  const headers = Object.keys(objects[0]);
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return String(value).replace(".", ",");
    return `"${String(value).replaceAll('"', '""')}"`;
  };

  return [
    headers.join(";"),
    ...objects.map((object) => headers.map((header) => escape(object[header])).join(";"))
  ].join("\n");
}

function download(filename, content, mime) {
  // Le BOM (U+FEFF) force Excel à lire le CSV en UTF-8 : sans lui,
  // « prélèvement » s'ouvre en « prÃ©lÃ¨vement ».
  const parts = mime.startsWith("text/csv") ? ["\uFEFF", content] : [content];
  const blob = new Blob(parts, { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  console.log("[DATA] Export généré :", filename);
}

function exportFilename(extension) {
  const date = new Date().toISOString().split("T")[0];
  return `prelevements-obligatoires-${date}.${extension}`;
}

// ===============================
//  Cycle de rendu
// ===============================

function refresh({ updateUrl = true } = {}) {
  state.filtered = sortRows(filterRows());

  renderSortChips();
  renderTableHead();
  renderStats(state.filtered);
  renderCharts(state.filtered);
  renderTable(state.filtered);

  elements.resultCount.textContent =
    state.filtered.length === state.rows.length
      ? `${formatNumber(state.rows.length)} prélèvements obligatoires`
      : `${formatNumber(state.filtered.length)} prélèvements sur ${formatNumber(state.rows.length)}`;

  // La fiche ouverte affiche le rang de l'entrée dans la sélection : elle doit
  // donc être redessinée dès que la sélection change, et se fermer si son
  // entrée a disparu du jeu de données.
  if (state.selectedId) {
    const selected = state.rows.find((row) => row.id === state.selectedId) || null;
    if (!selected) state.selectedId = null;
    renderDetail(selected);
  }

  if (updateUrl) writeStateToUrl();
}

function resetFilters() {
  state.search = "";
  state.recette = "all";
  state.annee = "all";
  state.recetteMin = null;
  state.recetteMax = null;
  state.anneeMin = null;
  state.anneeMax = null;
  state.sort = [...DEFAULT_SORT];
  syncControlsFromState();
  refresh();
}

function syncControlsFromState() {
  elements.search.value = state.search;
  elements.filterRecette.value = state.recette;
  elements.filterAnnee.value = state.annee;
  elements.recetteMin.value = state.recetteMin === null ? "" : String(state.recetteMin);
  elements.recetteMax.value = state.recetteMax === null ? "" : String(state.recetteMax);
  elements.anneeMin.value = state.anneeMin === null ? "" : String(state.anneeMin);
  elements.anneeMax.value = state.anneeMax === null ? "" : String(state.anneeMax);
  elements.periodSize.value = String(state.periodSize);
}

// ===============================
//  Événements
// ===============================

function attachEvents() {
  elements.search.addEventListener("input", () => {
    // La frappe ne doit pas déclencher un recalcul complet (statistiques +
    // cinq graphiques) à chaque caractère.
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.search = elements.search.value;
      refresh();
    }, 150);
  });

  elements.search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.search.value) {
      event.stopPropagation();
      elements.search.value = "";
      state.search = "";
      refresh();
    }
  });

  elements.filterRecette.addEventListener("change", () => {
    state.recette = elements.filterRecette.value;
    refresh();
  });

  elements.filterAnnee.addEventListener("change", () => {
    state.annee = elements.filterAnnee.value;
    refresh();
  });

  for (const [element, key] of [
    [elements.recetteMin, "recetteMin"],
    [elements.recetteMax, "recetteMax"],
    [elements.anneeMin, "anneeMin"],
    [elements.anneeMax, "anneeMax"]
  ]) {
    element.addEventListener("change", () => {
      const value = element.value.trim();
      state[key] = value === "" ? null : Number(value.replace(",", "."));
      if (!Number.isFinite(state[key])) state[key] = null;
      refresh();
    });
  }

  elements.periodSize.addEventListener("change", () => {
    state.periodSize = Number(elements.periodSize.value) || 10;
    refresh();
  });

  elements.sortPreset.addEventListener("change", () => {
    const preset = SORT_PRESETS[elements.sortPreset.value];
    if (preset) {
      state.sort = preset.sort.map((criterion) => ({ ...criterion }));
      refresh();
    }
    elements.sortPreset.selectedIndex = 0;
  });

  elements.reset.addEventListener("click", resetFilters);

  elements.tableHead.addEventListener("click", (event) => {
    const button = event.target.closest(".sort-button");
    if (!button) return;
    // Maj+clic (ou Ctrl/Cmd) : le critère s'ajoute aux précédents au lieu de
    // les remplacer — c'est le geste habituel d'un tableur.
    toggleSort(button.dataset.sortKey, event.shiftKey || event.ctrlKey || event.metaKey);
    refresh();
  });

  elements.sortChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".sort-chip");
    if (!chip) return;
    state.sort = state.sort.filter((criterion) => criterion.key !== chip.dataset.sortKey);
    refresh();
  });

  elements.tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    if (row?.dataset.id) selectRow(row.dataset.id);
  });

  elements.tableBody.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest("tr");
    if (!row?.dataset.id) return;
    event.preventDefault();
    selectRow(row.dataset.id);
  });

  elements.detailClose.addEventListener("click", () => {
    state.selectedId = null;
    renderDetail(null);
  });

  elements.detailCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.detailJson.textContent);
      elements.detailCopy.textContent = "✅ Copié";
      setTimeout(() => {
        elements.detailCopy.textContent = "Copier le JSON";
      }, 1200);
    } catch (error) {
      console.warn("[DATA] Copie impossible :", error);
    }
  });

  elements.exportCsv.addEventListener("click", () => {
    download(exportFilename("csv"), toCsv(currentSelectionAsObjects()), "text/csv;charset=utf-8;");
  });

  elements.exportJson.addEventListener("click", () => {
    download(
      exportFilename("json"),
      JSON.stringify(
        {
          version: state.dataVersion,
          exporte_le: new Date().toISOString(),
          filtres: {
            recherche: state.search || null,
            recette: state.recette,
            annee: state.annee,
            recette_min: state.recetteMin,
            recette_max: state.recetteMax,
            annee_min: state.anneeMin,
            annee_max: state.anneeMax
          },
          tri: state.sort,
          entrees: currentSelectionAsObjects()
        },
        null,
        2
      ),
      "application/json;charset=utf-8;"
    );
  });

  document.addEventListener("keydown", (event) => {
    // Ce module reste chargé une fois la vue quittée : ses raccourcis ne valent
    // que tant qu'elle est à l'écran. Plus rien ne peut la recouvrir — les
    // rubriques du menu sont des vues, elles la remplacent.
    if (document.documentElement.dataset.view !== "donnees") return;

    if (event.key === "Escape" && !elements.detail.hidden) {
      state.selectedId = null;
      renderDetail(null);
      return;
    }

    // « / » pour aller à la recherche : raccourci universel des outils de
    // données, sans conflit avec la saisie en cours.
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      elements.search.focus();
      elements.search.select();
    }
  });

  // Les données ont changé sous nos pieds (revalidation réseau de entries.js).
  window.addEventListener("entriesUpdated", (event) => {
    if (event.detail?.scope !== "full") return;
    loadFullData().then((entries) => {
      state.rows = prepareRows(entries);
      showDataVersion();
      refresh({ updateUrl: false });
      console.log("[DATA] Tableau reconstruit après mise à jour des données");
    });
  });
}

// ===============================
//  Démarrage
// ===============================

export async function initDataExplorer() {
  elements.search = requireElement("search");
  elements.filterRecette = requireElement("filterRecette");
  elements.filterAnnee = requireElement("filterAnnee");
  elements.recetteMin = requireElement("recetteMin");
  elements.recetteMax = requireElement("recetteMax");
  elements.anneeMin = requireElement("anneeMin");
  elements.anneeMax = requireElement("anneeMax");
  elements.periodSize = requireElement("periodSize");
  elements.sortPreset = requireElement("sortPreset");
  elements.reset = requireElement("resetFilters");
  elements.sortChips = requireElement("sortChips");
  elements.statsGrid = requireElement("statsGrid");
  elements.chartPeriods = requireElement("chartPeriods");
  elements.chartTop = requireElement("chartTop");
  elements.chartLorenz = requireElement("chartLorenz");
  elements.chartMagnitudes = requireElement("chartMagnitudes");
  elements.chartScatter = requireElement("chartScatter");
  elements.tableHead = requireElement("tableHead");
  elements.tableBody = requireElement("tableBody");
  elements.tableEmpty = requireElement("tableEmpty");
  elements.resultCount = requireElement("resultCount");
  elements.detail = requireElement("detail");
  elements.detailTitle = requireElement("detailTitle");
  elements.detailList = requireElement("detailList");
  elements.detailJson = requireElement("detailJson");
  elements.detailClose = requireElement("detailClose");
  elements.detailCopy = requireElement("detailCopy");
  elements.exportCsv = requireElement("exportCsv");
  elements.exportJson = requireElement("exportJson");
  elements.status = requireElement("loadingStatus");
  elements.dataVersion = requireElement("dataVersion");
  elements.filtersPanel = requireElement("filtersPanel");

  // Le volet des filtres s'ouvre d'emblée sur un écran large, et reste replié
  // sur un téléphone où ses six champs déroulés repoussaient les données à plus
  // d'un écran de défilement. Décidé une seule fois au démarrage : passé ce
  // point, c'est l'utilisateur qui commande, et un redimensionnement ne vient
  // pas défaire son choix.
  elements.filtersPanel.open = window.matchMedia("(min-width: 760px)").matches;

  // Le préréglage de tri est déclaré ici plutôt que dans le HTML : la liste des
  // tris disponibles appartient au code, pas au gabarit.
  for (const [value, preset] of Object.entries(SORT_PRESETS)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = preset.label;
    elements.sortPreset.appendChild(option);
  }

  readStateFromUrl();
  syncControlsFromState();
  attachEvents();

  try {
    const entries = await loadFullData();
    state.rows = prepareRows(entries);
    elements.status.textContent = "";
    elements.status.hidden = true;
  } catch (error) {
    console.error("[DATA] Chargement des données impossible :", error);
    elements.status.textContent =
      "Impossible de charger les données. Vérifiez votre connexion puis rechargez la page.";
    return;
  }

  showDataVersion();
  refresh({ updateUrl: false });
  console.log("[DATA] Vue Données prête :", state.rows.length, "prélèvements");
}

// La version affichée est celle du jeu de données, pas celle de l'application :
// c'est elle qui décide de la fraîcheur des données (voir CLAUDE.md §5), et
// c'est donc elle qui date un export.
function showDataVersion() {
  state.dataVersion = getDataVersion();
  elements.dataVersion.textContent = state.dataVersion ? `Jeu de données ${state.dataVersion}` : "";
}

// Aucun appel au chargement : c'est js/app.js qui décide du moment, à la
// première ouverture de l'onglet « Données ». Le service worker, lui, est
// enregistré une fois pour la page — la vue est pré-cachée avec elle.
