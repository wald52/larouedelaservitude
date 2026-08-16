// ===============================
// menu.js — Gestion du menu, historique et réglages
// ===============================

import { SETTINGS_KEY } from "./constants.js?v=b8755637";
import { getServedVersion } from "./sw-update.js?v=3cf9d32b";
import { topFocusTrap } from "./focus-trap.js?v=0b34fd1c";
import { formatRecette } from "./entries.js?v=c56272d2";
import { clearDrawnIds } from "./game.js?v=73adbd70";

const HISTORY_KEY = "larouedelaservitude_history";
const DEFAULT_SETTINGS = {
  darkMode: false,
  infiniteMode: false,
  soundEnabled: true
};

// Les trois interrupteurs du panneau Réglages, décrits une seule fois : le
// balisage, l'écoute du clic et la synchronisation à l'ouverture en découlent.
// `event` est le nom de l'événement diffusé sur window pour les modules qui
// n'importent pas menu.js (audio.js, bills.js, app.js).
const SETTING_SWITCHES = [
  {
    id: "darkModeToggle",
    key: "darkMode",
    group: "Apparence",
    label: "Mode sombre",
    description: "Basculer entre thème clair et sombre"
  },
  {
    id: "infiniteModeToggle",
    key: "infiniteMode",
    event: "infiniteModeChange",
    group: "Jeu",
    label: "Mode sans fin",
    description: "Ne pas retirer les taxes après chaque tour"
  },
  {
    id: "soundToggle",
    key: "soundEnabled",
    event: "soundModeChange",
    group: "Audio",
    label: "Sons",
    description: "Activer/désactiver les effets sonores"
  }
];

// État global
let history = [];
let settings = { ...DEFAULT_SETTINGS };

function applySettingsToDocument() {
  const root = document.documentElement;

  if (settings.darkMode) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }

  root.setAttribute("data-sound-enabled", settings.soundEnabled ? "true" : "false");
  root.setAttribute("data-infinite-mode", settings.infiniteMode ? "true" : "false");
  window.__MENU_SETTINGS__ = { ...settings };
}

// ===============================
// Historique
// ===============================

export function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    history = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Erreur chargement historique:", e);
    history = [];
  }
  return history;
}

export function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Erreur sauvegarde historique:", e);
  }
}

export function addToHistory(entry) {
  const historyEntry = {
    id: entry.id || Date.now(),
    nom: entry.nom_complet || entry.nom || entry,
    // `recette` (chaîne) est conservée pour rester lisible par les versions
    // antérieures ; `recette_meur` est ce que formatRecette utilise.
    recette: entry.recette || null,
    recette_meur: entry.recette_meur ?? null,
    annee: entry.annee || null,
    date: new Date().toISOString()
  };

  // Ajouter au début (plus récent en premier)
  history.unshift(historyEntry);

  // Limiter à 100 entrées
  if (history.length > 100) {
    history = history.slice(0, 100);
  }

  saveHistory();
  return historyEntry;
}

export function clearHistory() {
  history = [];
  saveHistory();
}

export function getHistory() {
  return history;
}

export function getHistoryCount() {
  return history.length;
}

// ===============================
// Réglages
// ===============================

export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      settings = { ...settings, ...parsed };
    }
  } catch (e) {
    console.error("Erreur chargement réglages:", e);
  }

  applySettingsToDocument();

  return settings;
}

export function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Erreur sauvegarde réglages:", e);
  }
}

export function updateSetting(key, value) {
  settings[key] = value;
  saveSettings();
  applySettingsToDocument();

  return settings;
}

export function getSetting(key) {
  return settings[key];
}

export function getSettings() {
  return settings;
}

// ===============================
// UI du Menu
// ===============================
//
// Une barre d'onglets fixée en bas de l'écran, et une vue par rubrique. Le
// hamburger et son tiroir latéral ont été remplacés : la navigation principale
// d'une application tenue à une main vit sous le pouce, pas dans un coin haut
// de l'écran, et les rubriques sont visibles en permanence au lieu d'être
// repliées derrière trois traits.
//
// **Les quatre onglets ont le même comportement** : cliquer sur l'un montre sa
// vue, la barre reste visible et cliquable, aucune surface ne recouvre rien.
// Historique et Réglages étaient des feuilles montantes qu'il fallait refermer
// par une croix — elles masquaient la barre, si bien que la moitié du menu se
// quittait par un onglet et l'autre moitié par une croix. Une barre d'onglets
// promet que les rubriques sont toujours à un pouce : une surface qui la
// recouvre rompt cette promesse, et la croix ne faisait que refaire ce que
// l'onglet « Accueil » fait déjà.
//
// Il n'y a donc plus de piège à focus ici : plus rien n'est modal, et une vue
// cachée est en `display: none`, donc hors de l'ordre de tabulation.

// Icônes de navigation, tracées et monochromes : elles héritent de la couleur
// du texte et partagent une même épaisseur de trait. Les emojis qu'elles
// remplacent (📜 ⚙️ 📊) venaient de familles graphiques différentes, en couleur,
// et juraient entre eux comme avec le reste de l'interface — qui est plate et
// monochrome.
const ICON_SVG_ATTRS =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

function navIcon(paths) {
  return `<svg class="tabbar-item__glyph" ${ICON_SVG_ATTRS}>${paths}</svg>`;
}

const ICONS = {
  // Une maison : la roue elle-même, c'est-à-dire la page en cours.
  accueil: navIcon(
    '<path d="M3.6 11 12 4.2 20.4 11"/>' +
      '<path d="M5.9 9.7v9.5a.8.8 0 0 0 .8.8h10.6a.8.8 0 0 0 .8-.8V9.7"/>'
  ),
  // Une horloge : l'historique des tirages.
  historique: navIcon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3.2 1.9"/>'),
  // Deux curseurs de réglage.
  reglages: navIcon(
    '<path d="M4 7.5h6.6"/><path d="M15.6 7.5H20"/><circle cx="13.1" cy="7.5" r="2.3"/>' +
      '<path d="M4 16.5h3.2"/><path d="M12.2 16.5H20"/><circle cx="9.7" cy="16.5" r="2.3"/>'
  ),
  // Un diagramme en barres.
  donnees: navIcon(
    '<path d="M3.5 20h17"/><path d="M7.5 20v-5.4"/><path d="M12 20V8"/><path d="M16.5 20v-8.4"/>'
  )
};

// Les rubriques dont la vue est bâtie ici, à l'exécution. La section, son
// en-tête et le rendu de son contenu en découlent tous : ajouter une rubrique,
// c'est ajouter une ligne ici puis une ligne dans MENU_TABS.
const MENU_VIEWS = [
  {
    id: "historique",
    label: "Historique",
    render: renderHistory,
    content: `
      <div id="historyListContainer"></div>
      <div class="history-actions btn-row">
        <button class="btn btn-secondary btn-sm" id="clearHistory" type="button">Tout effacer</button>
        <button class="btn btn-secondary btn-sm" id="exportHistory" type="button">Exporter</button>
      </div>
    `
  },
  {
    id: "reglages",
    label: "Réglages",
    render: renderSettings,
    content: `
      ${SETTING_SWITCHES.map(renderSettingSwitch).join("")}

      <div class="settings-group">
        <h3>Partie en cours</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">Nouvelle partie</div>
            <span class="setting-desc">Remet sur la roue toutes les taxes déjà tirées</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="newGame" type="button">Recommencer</button>
        </div>
      </div>

      <div class="settings-group">
        <h3>Données</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">Réinitialiser l'application</div>
            <span class="setting-desc">Efface historique et réglages</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="resetApp" type="button">Réinitialiser</button>
        </div>
      </div>

      <div class="settings-group">
        <h3>À propos</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">La roue de la servitude</div>
            <span class="setting-desc" id="appVersion">Version —</span>
          </div>
          <a class="btn btn-secondary btn-sm" href="https://github.com/wald52/larouedelaservitude"
             target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    `
  }
];

// La barre du bas, dans l'ordre où elle s'affiche. Une seule nature d'onglet :
// chacun montre sa vue. Quatre au maximum — au-delà, les libellés ne tiennent
// plus sur un écran de téléphone sans être tronqués.
const MENU_TABS = [
  { id: "accueil", icon: ICONS.accueil, label: "Accueil", view: "roue" },
  {
    id: "historique",
    icon: ICONS.historique,
    label: "Historique",
    view: "historique",
    badgeId: "historyBadge"
  },
  { id: "donnees", icon: ICONS.donnees, label: "Données", view: "donnees" },
  { id: "reglages", icon: ICONS.reglages, label: "Réglages", view: "reglages" }
];

// ===============================
// Les vues
// ===============================
//
// Il n'y a plus qu'un document, et quatre vues d'une même page : la roue, les
// données, l'historique et les réglages. Aucun onglet ne navigue, aucun ne
// recouvre. C'était la seule façon d'en finir avec la partie perdue au passage
// d'une page à l'autre — il n'y a plus de passage. Ce qui s'affiche est décidé
// par `data-view` sur <html>, lu par le CSS bloquant d'index.html ; les modules
// intéressés écoutent `viewChange` (même découplage que les réglages : personne
// n'importe app.js).
//
// La vue est aussi dans l'URL (`?vue=donnees`), pour trois raisons : un lien
// vers une rubrique reste partageable et peut se mettre en favori, le bouton
// « précédent » du navigateur ramène à la roue, et l'explorateur y écrit déjà
// ses filtres.
const DEFAULT_VIEW = "roue";
let currentView = DEFAULT_VIEW;

export function viewFromUrl() {
  const wanted = new URLSearchParams(window.location.search).get("vue");
  return MENU_TABS.some((tab) => tab.view === wanted) ? wanted : DEFAULT_VIEW;
}

export function openView(view, { push = true } = {}) {
  const next = MENU_TABS.some((tab) => tab.view === view) ? view : DEFAULT_VIEW;

  // Le contenu est rafraîchi avant d'être montré : l'historique et les
  // interrupteurs ont pu changer depuis le dernier passage.
  renderView(next);

  document.documentElement.dataset.view = next;

  if (next !== currentView) {
    currentView = next;
    window.dispatchEvent(new CustomEvent("viewChange", { detail: next }));
  }

  updateTabState();
  if (push) pushViewUrl(next);
}

// Le rendu d'une vue bâtie ici. Au démarrage, app.js ouvre la vue de l'URL
// avant que le menu n'existe (il est construit en différé) : il n'y a alors
// rien à rendre, et createMenuHTML s'en charge dès que la section est là.
function renderView(id) {
  const view = MENU_VIEWS.find((entry) => entry.id === id);
  if (!view || !document.getElementById(viewElementId(id))) return;

  view.render();
}

function pushViewUrl(view) {
  const url = new URL(window.location.href);

  if (view === DEFAULT_VIEW) {
    url.searchParams.delete("vue");
  } else {
    url.searchParams.set("vue", view);
  }

  if (url.href !== window.location.href) {
    window.history.pushState({ view }, "", url);
  }
}

// Le bouton « précédent » revient à la vue précédente au lieu de quitter le
// site — c'est ce qu'on attend d'une application à onglets.
window.addEventListener("popstate", (event) => {
  openView(event.state?.view ?? viewFromUrl(), { push: false });
});

export function initMenu() {
  loadHistory();
  loadSettings();
  createMenuHTML();
  attachMenuEvents();

  console.log("[MENU] Initialisé");
}

function viewElementId(id) {
  return `view-${id}`;
}

function tabElementId(id) {
  return `tab-${id}`;
}

function createMenuHTML() {
  // La barre du bas est la navigation principale : elle reste affichée en
  // permanence, contrairement au tiroir qu'il fallait d'abord déplier — et
  // désormais quelle que soit la vue, plus rien ne passe par-dessus.
  const tabbar = document.createElement("nav");
  tabbar.className = "menu-tabbar";
  tabbar.id = "menuTabbar";
  tabbar.setAttribute("aria-label", "Navigation principale");
  tabbar.innerHTML = MENU_TABS.map(renderTabItem).join("");
  document.body.appendChild(tabbar);

  for (const view of MENU_VIEWS) {
    document.body.appendChild(createViewElement(view));
  }

  // La vue demandée par l'URL a pu être ouverte avant que ces sections
  // n'existent : c'est ici qu'elle reçoit son contenu.
  renderView(currentView);
  updateTabState();
  updateHistoryBadge();
}

// Un onglet : icône, badge éventuel posé sur l'icône, libellé dessous. Le
// libellé est écrit et non seulement suggéré par le pictogramme — une icône
// seule se devine, elle ne se lit pas.
function renderTabItem({ id, icon, label, badgeId, view }) {
  const badge = badgeId ? `<span class="tabbar-item__badge" id="${badgeId}" hidden>0</span>` : "";
  const inner = `
      <span class="tabbar-item__icon">${icon}${badge}</span>
      <span class="tabbar-item__label">${label}</span>`;

  // Plus aucun onglet ne quitte la page : ce sont tous des boutons, et ils font
  // tous la même chose. « Données » était un vrai <a> tant que c'était un
  // second document ; un lien vers une vue reste possible, mais il passe
  // désormais par `?vue=…`.
  return (
    `<button class="tabbar-item" id="${tabElementId(id)}" type="button"` +
    ` data-view="${view}">${inner}</button>`
  );
}

// `aria-current` désigne l'endroit où l'on se trouve : la vue affichée. C'est
// aussi ce que le CSS interroge pour teinter l'onglet actif — pas de classe en
// double, donc pas d'état visuel qui puisse diverger de l'état annoncé.
function updateTabState() {
  for (const tab of MENU_TABS) {
    const element = document.getElementById(tabElementId(tab.id));
    if (!element) continue;

    if (tab.view === currentView) {
      element.setAttribute("aria-current", "page");
    } else {
      element.removeAttribute("aria-current");
    }
  }
}

// Un vrai <button role="switch"> : focalisable et actionnable au clavier, ce que
// n'était pas l'ancienne <div class="toggle">. L'état vit uniquement dans
// `aria-checked`, lu aussi bien par le CSS que par les lecteurs d'écran.
// `aria-labelledby` relie l'interrupteur à son libellé, sinon annoncé comme
// « bouton » sans nom.
function renderSettingSwitch({ id, group, label, description }) {
  const labelId = `${id}Label`;
  return `
    <div class="settings-group">
      <h3>${group}</h3>
      <div class="setting-item">
        <div>
          <div class="setting-label" id="${labelId}">${label}</div>
          <span class="setting-desc">${description}</span>
        </div>
        <button type="button" class="switch" id="${id}" role="switch"
                aria-checked="false" aria-labelledby="${labelId}">
          <span class="switch-knob"></span>
        </button>
      </div>
    </div>
  `;
}

// Une vue, pas une feuille : ni voile, ni poignée, ni croix. Elle occupe la
// page jusqu'à la barre d'onglets (CSS bloquant d'index.html), et c'est par la
// barre qu'on la quitte, comme pour la vue « Données ».
function createViewElement({ id, label, content }) {
  const view = document.createElement("section");
  view.className = "app-view menu-view";
  view.id = viewElementId(id);
  view.setAttribute("aria-labelledby", `${viewElementId(id)}-title`);
  view.innerHTML = `
    <div class="menu-view__inner">
      <h1 class="menu-view__title" id="${viewElementId(id)}-title">${label}</h1>
      ${content}
    </div>
  `;
  return view;
}

// ===============================
// Événements
// ===============================

function attachMenuEvents() {
  document.querySelectorAll(".tabbar-item[data-view]").forEach((item) => {
    item.addEventListener("click", () => openView(item.dataset.view));
  });

  // Actions historique
  document.getElementById("clearHistory").addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
      clearHistory();
      renderHistory();
      updateHistoryBadge();
    }
  });

  document.getElementById("exportHistory").addEventListener("click", exportHistory);

  // Interrupteurs des réglages
  SETTING_SWITCHES.forEach(({ id, key, event }) => {
    const control = document.getElementById(id);
    control.addEventListener("click", () => {
      const enabled = control.getAttribute("aria-checked") !== "true";
      control.setAttribute("aria-checked", String(enabled));
      updateSetting(key, enabled);
      // Diffusé pour les modules qui n'importent pas menu.js (voir §4 du guide).
      if (event) {
        window.dispatchEvent(new CustomEvent(event, { detail: enabled }));
      }
    });
  });

  // Nouvelle partie. La roue se regarnit sur l'événement, comme pour les
  // réglages : menu.js n'importe pas app.js. On revient à la roue dans la
  // foulée — c'est elle qu'on vient de regarnir, il faut la voir.
  document.getElementById("newGame").addEventListener("click", () => {
    clearDrawnIds();
    window.dispatchEvent(new CustomEvent("gameReset"));
    openView(DEFAULT_VIEW);
  });

  // Reset app
  document.getElementById("resetApp").addEventListener("click", () => {
    if (confirm("Attention : cela va effacer tout l'historique et les réglages. Continuer ?")) {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      // La partie en cours vit dans sessionStorage : sans cela elle survivait
      // au rechargement qui suit, et la roue repartait amputée.
      clearDrawnIds();
      history = [];
      settings = { ...DEFAULT_SETTINGS };
      applySettingsToDocument();
      // Rechargement sur la roue, et non sur `?vue=reglages` : après une remise
      // à zéro on veut retrouver l'application dans son état de départ.
      const url = new URL(window.location.href);
      url.searchParams.delete("vue");
      window.location.replace(url);
    }
  });

  // Échap ramène à la roue depuis les vues bâties ici — l'équivalent de la
  // croix qu'elles n'ont plus. Sur la vue « Données », c'est data-explorer.js
  // qui répond (il referme sa fiche de détail) ; et si une modale de la roue
  // est au premier plan, elle a la priorité — app.js s'en charge.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (topFocusTrap()) return;
    if (!MENU_VIEWS.some((view) => view.id === currentView)) return;

    openView(DEFAULT_VIEW);
  });
}

function updateHistoryBadge() {
  const badge = document.getElementById("historyBadge");
  if (!badge) return;

  const count = getHistoryCount();
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

function renderHistory() {
  const container = document.getElementById("historyListContainer");
  if (!container) return;

  const historyData = getHistory();

  if (historyData.length === 0) {
    container.innerHTML = '<div class="history-empty">Aucun tour enregistré pour le moment</div>';
    return;
  }

  const list = document.createElement("ul");
  list.className = "history-list";

  historyData.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    let metaHtml = `<span>📅 ${dateStr}</span>`;
    const recette = formatRecette(item);
    if (recette) {
      metaHtml += `<span>💰 ${recette}</span>`;
    }
    if (item.annee) {
      metaHtml += `<span>📆 Créée en ${item.annee}</span>`;
    }

    li.innerHTML = `
      <div class="tax-name">${item.nom}</div>
      <div class="tax-meta">${metaHtml}</div>
    `;

    list.appendChild(li);
  });

  container.innerHTML = "";
  container.appendChild(list);
}

function renderSettings() {
  const current = getSettings();

  SETTING_SWITCHES.forEach(({ id, key }) => {
    document.getElementById(id).setAttribute("aria-checked", current[key] ? "true" : "false");
  });

  renderServedVersion();
}

// La version affichée est celle de la génération qui sert réellement la page,
// demandée au service worker. Elle n'est pas une constante du code : le nom de
// la génération est un hachage du contenu publié, calculé au moment de
// l'estampillage (scripts/stamp-assets.mjs). L'inscrire dans un module
// estampillé changerait son propre hachage, donc la génération — un serpent qui
// se mord la queue.
function renderServedVersion() {
  const target = document.getElementById("appVersion");
  if (!target) return;

  getServedVersion().then((version) => {
    // Aucun service worker ne contrôle encore la page (toute première visite,
    // ou navigation privée) : rien de fiable à annoncer.
    target.textContent = version ? `Version ${version}` : "Version — hors cache";
  });
}

function exportHistory() {
  const historyData = getHistory();

  if (historyData.length === 0) {
    alert("Aucun historique à exporter");
    return;
  }

  // Export CSV
  const headers = ["Date", "Taxe", "Recette", "Recette (M€)", "Année"];
  const rows = historyData.map((item) => [
    item.date,
    `"${item.nom}"`,
    `"${formatRecette(item)}"`,
    item.recette_meur ?? "",
    item.annee || ""
  ]);

  const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  // Télécharger
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historique-roue-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  console.log("[MENU] Historique exporté");
}

// ===============================
// API pour le reste de l'app
// ===============================

export function recordSpin(entry) {
  addToHistory(entry);
  updateHistoryBadge();
}

export function isInfiniteMode() {
  return getSetting("infiniteMode");
}
