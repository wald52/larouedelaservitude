// ===============================
// menu.js — Gestion du menu, historique et réglages
// ===============================

const HISTORY_KEY = 'larouedelaservitude_history';
const SETTINGS_KEY = 'larouedelaservitude_settings';

// État global
let history = [];
let settings = {
  darkMode: false,
  infiniteMode: false,
  soundEnabled: true
};

// ===============================
// Historique
// ===============================

export function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    history = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Erreur chargement historique:', e);
    history = [];
  }
  return history;
}

export function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Erreur sauvegarde historique:', e);
  }
}

export function addToHistory(entry) {
  const historyEntry = {
    id: entry.id || Date.now(),
    nom: entry.nom_complet || entry.nom || entry,
    recette: entry.recette || null,
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
    console.error('Erreur chargement réglages:', e);
  }
  
  // Appliquer le dark mode si activé
  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  return settings;
}

export function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Erreur sauvegarde réglages:', e);
  }
}

export function updateSetting(key, value) {
  settings[key] = value;
  saveSettings();
  
  // Effets immédiats
  if (key === 'darkMode') {
    if (value) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
  
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

export function initMenu() {
  // Charger données
  loadHistory();
  loadSettings();
  
  // Créer le HTML du menu
  createMenuHTML();
  
  // Attacher les événements
  attachMenuEvents();
  
  console.log('[MENU] Initialisé');
}

function createMenuHTML() {
  // Bouton hamburger
  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.id = 'menuToggle';
  toggle.innerHTML = '<span></span><span></span><span></span>';
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  document.body.appendChild(toggle);
  
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.id = 'menuOverlay';
  document.body.appendChild(overlay);
  
  // Sidebar
  const sidebar = document.createElement('nav');
  sidebar.className = 'menu-sidebar';
  sidebar.id = 'menuSidebar';
  sidebar.innerHTML = `
    <div class="menu-header">
      <h2>Menu</h2>
      <button class="menu-close" id="menuClose" aria-label="Fermer le menu">✕</button>
    </div>
    <div class="menu-nav">
      <button class="menu-item" data-panel="historique">
        <span class="icon">📜</span>
        <span class="label">Historique</span>
        <span class="badge" id="historyBadge">0</span>
      </button>
      <button class="menu-item" data-panel="reglages">
        <span class="icon">⚙️</span>
        <span class="label">Réglages</span>
      </button>
    </div>
    <div class="menu-footer">
      <a href="https://github.com/wald52/larouedelaservitude" target="_blank" rel="noopener">
        GitHub
      </a>
      • v1.0
    </div>
  `;
  document.body.appendChild(sidebar);
  
  // Panel Historique
  const historyPanel = document.createElement('div');
  historyPanel.className = 'menu-panel';
  historyPanel.id = 'panelHistorique';
  historyPanel.innerHTML = `
    <div class="panel-header">
      <button class="panel-back" id="historyBack" aria-label="Retour">←</button>
      <h3 class="panel-title">Historique</h3>
    </div>
    <div class="panel-content">
      <div id="historyListContainer"></div>
      <div class="history-actions">
        <button class="btn btn-secondary" id="clearHistory">Tout effacer</button>
        <button class="btn btn-secondary" id="exportHistory">Exporter</button>
      </div>
    </div>
  `;
  document.body.appendChild(historyPanel);
  
  // Panel Réglages
  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'menu-panel';
  settingsPanel.id = 'panelReglages';
  settingsPanel.innerHTML = `
    <div class="panel-header">
      <button class="panel-back" id="settingsBack" aria-label="Retour">←</button>
      <h3 class="panel-title">Réglages</h3>
    </div>
    <div class="panel-content">
      <div class="settings-group">
        <h3>Apparence</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">Mode sombre</div>
            <span class="setting-desc">Basculer entre thème clair et sombre</span>
          </div>
          <div class="toggle" id="darkModeToggle">
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-group">
        <h3>Jeu</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">Mode sans fin</div>
            <span class="setting-desc">Ne pas retirer les taxes après chaque tour</span>
          </div>
          <div class="toggle" id="infiniteModeToggle">
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-group">
        <h3>Audio</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">Sons</div>
            <span class="setting-desc">Activer/désactiver les effets sonores</span>
          </div>
          <div class="toggle" id="soundToggle">
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>
      
      <div class="settings-group">
        <h3>Données</h3>
        <div class="setting-item">
          <div>
            <div class="setting-label">Réinitialiser l'application</div>
            <span class="setting-desc">Efface historique et réglages</span>
          </div>
          <button class="btn btn-secondary" id="resetApp">Réinitialiser</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(settingsPanel);
  
  // Mettre à jour le badge
  updateHistoryBadge();
}

function attachMenuEvents() {
  const toggle = document.getElementById('menuToggle');
  const close = document.getElementById('menuClose');
  const overlay = document.getElementById('menuOverlay');
  const sidebar = document.getElementById('menuSidebar');
  const menuItems = document.querySelectorAll('.menu-item');
  
  // Ouvrir le menu
  toggle.addEventListener('click', () => {
    openMenu();
  });
  
  // Fermer le menu
  close.addEventListener('click', () => {
    closeMenu();
  });
  
  overlay.addEventListener('click', () => {
    closeMenu();
  });
  
  // Ouvrir les panels
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const panelId = item.getAttribute('data-panel');
      if (panelId) {
        openPanel(panelId);
      }
    });
  });
  
  // Boutons retour
  document.getElementById('historyBack').addEventListener('click', () => {
    closePanel('historique');
  });
  
  document.getElementById('settingsBack').addEventListener('click', () => {
    closePanel('reglages');
  });
  
  // Actions historique
  document.getElementById('clearHistory').addEventListener('click', () => {
    if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
      clearHistory();
      renderHistory();
      updateHistoryBadge();
    }
  });
  
  document.getElementById('exportHistory').addEventListener('click', exportHistory);
  
  // Toggles réglages
  document.getElementById('darkModeToggle').addEventListener('click', function() {
    const isActive = this.classList.toggle('active');
    updateSetting('darkMode', isActive);
  });
  
  document.getElementById('infiniteModeToggle').addEventListener('click', function() {
    const isActive = this.classList.toggle('active');
    updateSetting('infiniteMode', isActive);
    // Dispatch event pour que la roue puisse écouter
    window.dispatchEvent(new CustomEvent('infiniteModeChange', { detail: isActive }));
  });
  
  document.getElementById('soundToggle').addEventListener('click', function() {
    const isActive = this.classList.toggle('active');
    updateSetting('soundEnabled', isActive);
    window.dispatchEvent(new CustomEvent('soundModeChange', { detail: isActive }));
  });
  
  // Reset app
  document.getElementById('resetApp').addEventListener('click', () => {
    if (confirm('Attention : cela va effacer tout l\'historique et les réglages. Continuer ?')) {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      history = [];
      settings = { darkMode: false, infiniteMode: false, soundEnabled: true };
      updateHistoryBadge();
      renderHistory();
      // Reset toggles
      document.querySelectorAll('.toggle').forEach(t => t.classList.remove('active'));
      alert('Application réinitialisée.');
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
    }
  });
}

function openMenu() {
  document.getElementById('menuToggle').classList.add('active');
  document.getElementById('menuOverlay').classList.add('active');
  document.getElementById('menuSidebar').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  document.getElementById('menuToggle').classList.remove('active');
  document.getElementById('menuOverlay').classList.remove('active');
  document.getElementById('menuSidebar').classList.remove('active');
  closeAllPanels();
  document.body.style.overflow = '';
}

function openPanel(panelId) {
  const panel = document.getElementById(`panel${panelId.charAt(0).toUpperCase() + panelId.slice(1)}`);
  if (panel) {
    panel.classList.add('active');
    if (panelId === 'historique') {
      renderHistory();
    } else if (panelId === 'reglages') {
      renderSettings();
    }
  }
}

function closePanel(panelId) {
  const panel = document.getElementById(`panel${panelId.charAt(0).toUpperCase() + panelId.slice(1)}`);
  if (panel) {
    panel.classList.remove('active');
  }
}

function closeAllPanels() {
  document.querySelectorAll('.menu-panel').forEach(panel => {
    panel.classList.remove('active');
  });
}

function updateHistoryBadge() {
  const badge = document.getElementById('historyBadge');
  if (badge) {
    const count = getHistoryCount();
    badge.textContent = count > 0 ? count.toString() : '';
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

function renderHistory() {
  const container = document.getElementById('historyListContainer');
  if (!container) return;
  
  const historyData = getHistory();
  
  if (historyData.length === 0) {
    container.innerHTML = '<div class="history-empty">Aucun tour enregistré pour le moment</div>';
    return;
  }
  
  const list = document.createElement('ul');
  list.className = 'history-list';
  
  historyData.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let metaHtml = `<span>📅 ${dateStr}</span>`;
    if (item.recette) {
      metaHtml += `<span>💰 ${item.recette}</span>`;
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
  
  container.innerHTML = '';
  container.appendChild(list);
}

function renderSettings() {
  const s = getSettings();
  
  // Mettre à jour les toggles
  document.getElementById('darkModeToggle').classList.toggle('active', s.darkMode);
  document.getElementById('infiniteModeToggle').classList.toggle('active', s.infiniteMode);
  document.getElementById('soundToggle').classList.toggle('active', s.soundEnabled);
}

function exportHistory() {
  const historyData = getHistory();
  
  if (historyData.length === 0) {
    alert('Aucun historique à exporter');
    return;
  }
  
  // Export CSV
  const headers = ['Date', 'Taxe', 'Recette', 'Année'];
  const rows = historyData.map(item => [
    item.date,
    `"${item.nom}"`,
    item.recette || '',
    item.annee || ''
  ]);
  
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  
  // Télécharger
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historique-roue-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  
  console.log('[MENU] Historique exporté');
}

// ===============================
// API pour le reste de l'app
// ===============================

export function recordSpin(entry) {
  addToHistory(entry);
  updateHistoryBadge();
}

export function isInfiniteMode() {
  return getSetting('infiniteMode');
}

export function isSoundEnabled() {
  return getSetting('soundEnabled');
}
