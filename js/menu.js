// ===============================
// menu.js — Gestion du menu, historique et réglages
// ===============================

import { SETTINGS_KEY, APP_VERSION } from "./constants.js";
import { pushFocusTrap, popFocusTrap, topFocusTrap } from "./focus-trap.js";
import { formatRecette } from "./entries.js";

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
// Une barre d'onglets fixée en bas de l'écran, et un panneau par rubrique qui
// monte depuis cette barre. Le hamburger et son tiroir latéral ont été
// remplacés : la navigation principale d'une application tenue à une main vit
// sous le pouce, pas dans un coin haut de l'écran, et les rubriques sont
// visibles en permanence au lieu d'être repliées derrière trois traits.
//
// Les panneaux arrivent donc par le bas — d'où ils sont appelés. La règle n'a
// pas changé, seule son origine : une surface glisse depuis le contrôle qui
// l'ouvre, sinon la hiérarchie devient illisible.
//
// Les surfaces passent toutes par openSurface / closeSurface : même animation,
// même piège à focus, même touche Échap. Rien n'est atteignable au clavier
// tant que la surface est fermée (visibility, menu.css).

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

// Les rubriques qui ouvrent un panneau. Le panneau, son en-tête, son bouton de
// fermeture et le rendu de son contenu en découlent tous : ajouter une
// rubrique, c'est ajouter une ligne ici puis une ligne dans MENU_TABS.
const MENU_PANELS = [
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
            <span class="setting-desc">Version ${APP_VERSION}</span>
          </div>
          <a class="btn btn-secondary btn-sm" href="https://github.com/wald52/larouedelaservitude"
             target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    `
  }
];

// La barre du bas, dans l'ordre où elle s'affiche. Trois natures d'onglet, et
// c'est la clé présente qui les distingue :
//   - ni `panel` ni `href` : l'accueil, qui referme ce qui est ouvert ;
//   - `panel` : ouvre le panneau du même identifiant dans MENU_PANELS ;
//   - `href`  : une navigation ordinaire, hors de la page.
// Quatre onglets au maximum : au-delà, les libellés ne tiennent plus sur un
// écran de téléphone sans être tronqués.
const MENU_TABS = [
  { id: "accueil", icon: ICONS.accueil, label: "Accueil" },
  {
    id: "historique",
    icon: ICONS.historique,
    label: "Historique",
    panel: "historique",
    badgeId: "historyBadge"
  },
  { id: "donnees", icon: ICONS.donnees, label: "Données", href: "donnees.html" },
  { id: "reglages", icon: ICONS.reglages, label: "Réglages", panel: "reglages" }
];

export function initMenu() {
  loadHistory();
  loadSettings();
  createMenuHTML();
  attachMenuEvents();

  console.log("[MENU] Initialisé");
}

function panelElementId(id) {
  return `panel-${id}`;
}

function tabElementId(id) {
  return `tab-${id}`;
}

function createMenuHTML() {
  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  overlay.id = "menuOverlay";
  document.body.appendChild(overlay);

  // La barre du bas est la navigation principale : elle reste affichée en
  // permanence, contrairement au tiroir qu'il fallait d'abord déplier.
  const tabbar = document.createElement("nav");
  tabbar.className = "menu-tabbar";
  tabbar.id = "menuTabbar";
  tabbar.setAttribute("aria-label", "Navigation principale");
  tabbar.innerHTML = MENU_TABS.map(renderTabItem).join("");
  document.body.appendChild(tabbar);

  for (const panel of MENU_PANELS) {
    document.body.appendChild(createPanelElement(panel));
  }

  updateTabState(null);
  updateHistoryBadge();
}

// Un onglet : icône, badge éventuel posé sur l'icône, libellé dessous. Le
// libellé est écrit et non seulement suggéré par le pictogramme — une icône
// seule se devine, elle ne se lit pas.
function renderTabItem({ id, icon, label, badgeId, panel, href }) {
  const badge = badgeId ? `<span class="tabbar-item__badge" id="${badgeId}" hidden>0</span>` : "";
  const inner = `
      <span class="tabbar-item__icon">${icon}${badge}</span>
      <span class="tabbar-item__label">${label}</span>`;

  // Le seul onglet qui quitte la page est un vrai lien : clic milieu, ouverture
  // dans un onglet et menu contextuel doivent continuer de fonctionner.
  if (href) {
    return `<a class="tabbar-item" id="${tabElementId(id)}" href="${href}">${inner}</a>`;
  }

  const panelAttrs = panel
    ? ` data-panel="${panel}" aria-controls="${panelElementId(panel)}" aria-expanded="false"`
    : ' data-home="true"';

  return `<button class="tabbar-item" id="${tabElementId(id)}" type="button"${panelAttrs}>${inner}</button>`;
}

// `aria-current` désigne l'endroit où l'on se trouve : l'accueil tant qu'aucun
// panneau n'est ouvert, sinon l'onglet du panneau ouvert. C'est aussi ce que le
// CSS interroge pour teinter l'onglet actif — pas de classe en double, donc pas
// d'état visuel qui puisse diverger de l'état annoncé.
function updateTabState(openPanelId) {
  for (const tab of MENU_TABS) {
    if (tab.href) continue;

    const element = document.getElementById(tabElementId(tab.id));
    if (!element) continue;

    const isCurrent = tab.panel ? tab.panel === openPanelId : openPanelId === null;
    if (isCurrent) {
      element.setAttribute("aria-current", "page");
    } else {
      element.removeAttribute("aria-current");
    }

    if (tab.panel) {
      element.setAttribute("aria-expanded", String(tab.panel === openPanelId));
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

function createPanelElement({ id, label, content }) {
  const panel = document.createElement("div");
  panel.className = "menu-panel";
  panel.id = panelElementId(id);
  // Un panneau recouvre la page et retient le focus : c'est un dialogue.
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", `${panelElementId(id)}-title`);
  // La poignée est le signe convenu d'une feuille qu'on tire depuis le bas :
  // purement décorative, d'où aria-hidden.
  panel.innerHTML = `
    <div class="panel-grabber" aria-hidden="true"></div>
    <div class="panel-header">
      <h3 class="panel-title" id="${panelElementId(id)}-title">${label}</h3>
      <button class="btn btn-icon btn-secondary btn-close" data-close-panel="${id}" type="button"
              aria-label="Fermer ${label.toLowerCase()}"></button>
    </div>
    <div class="panel-content">${content}</div>
  `;
  return panel;
}

// ===============================
// Ouverture / fermeture des surfaces
// ===============================

function openSurface(element, initialFocus) {
  element.classList.add("active");
  pushFocusTrap(element, { initialFocus });
}

function closeSurface(element) {
  element.classList.remove("active");
  popFocusTrap(element);
}

// Un seul panneau à la fois : ouvrir depuis la barre referme celui qui l'était.
// Ils ne s'empilent pas — deux feuilles montées du même bord se recouvriraient
// sans que rien ne dise laquelle est laquelle.
function openPanel(panelId) {
  const panel = MENU_PANELS.find((entry) => entry.id === panelId);
  if (!panel) return;

  closeAllPanels();

  const element = document.getElementById(panelElementId(panelId));
  panel.render();
  document.getElementById("menuOverlay").classList.add("active");
  document.documentElement.classList.add("menu-open");
  updateTabState(panelId);
  openSurface(element, element.querySelector("[data-close-panel]"));
}

function closePanel(panelId) {
  const element = document.getElementById(panelElementId(panelId));
  if (!element || !element.classList.contains("active")) return;

  closeSurface(element);
  document.getElementById("menuOverlay").classList.remove("active");
  document.documentElement.classList.remove("menu-open");
  updateTabState(null);
}

function closeAllPanels() {
  for (const panel of MENU_PANELS) closePanel(panel.id);
}

function attachMenuEvents() {
  document.getElementById("menuOverlay").addEventListener("click", closeAllPanels);

  // Seuls les onglets porteurs d'un panneau : « Données » est un lien, donc une
  // navigation ordinaire, et « Accueil » ne fait que ramener à la roue.
  document.querySelectorAll(".tabbar-item[data-panel]").forEach((item) => {
    item.addEventListener("click", () => openPanel(item.dataset.panel));
  });

  document
    .querySelector(".tabbar-item[data-home]")
    .addEventListener("click", () => closeAllPanels());

  document.querySelectorAll("[data-close-panel]").forEach((button) => {
    button.addEventListener("click", () => closePanel(button.dataset.closePanel));
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

  // Reset app
  document.getElementById("resetApp").addEventListener("click", () => {
    if (confirm("Attention : cela va effacer tout l'historique et les réglages. Continuer ?")) {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      history = [];
      settings = { ...DEFAULT_SETTINGS };
      applySettingsToDocument();
      closeAllPanels();
      window.location.reload();
    }
  });

  // Échap ne ferme que la surface du dessus. On ne réagit pas si c'est une
  // modale de la roue qui est au premier plan — app.js s'en charge.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const top = topFocusTrap();
    if (!top) return;

    if (top.classList.contains("menu-panel")) {
      closePanel(top.id.replace("panel-", ""));
    }
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
