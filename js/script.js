// ================================
//  script.js — Coordinateur général
// ================================

// Importation des modules (tu mettras wheel.js et ui.js juste après)
import { initWheel, spinWheel, isWheelRunning, onWheelStop } from './wheel.js';
import { 
  showOverlay, 
  hideOverlay, 
  loadDynamicButtons, 
  updateConnectivityDisplay 
} from './ui.js';

// ================================
//   Préchargement des sons
// ================================

let sounds = {
  coin: new Audio('/larouedelaservitude/audio/coin.mp3'),
  wheel: new Audio('/larouedelaservitude/audio/wheel-spin.mp3'),
  scratch: new Audio('/larouedelaservitude/audio/frottement-papier.mp3')
};

// Empêcher la lecture automatique (préchargement silencieux)
for (const s of Object.values(sounds)) {
  s.preload = 'auto';
  s.volume = 1.0;
  s.addEventListener('canplaythrough', () => {}, { once: true });
}

// ================================
//   Gestion de la fenêtre de résultat
// ================================

const overlay = document.getElementById('overlay');
const closeOverlayBtn = document.getElementById('closeOverlay');

// Désactivation de la touche espace si un overlay est ouvert
function isOverlayOpen() {
  return overlay && overlay.style.display === 'flex';
}

// Fermer la fenêtre de résultat
if (closeOverlayBtn) {
  closeOverlayBtn.addEventListener('click', () => {
    hideOverlay();
  });
}

// ================================
//   Gestion du lancement de la roue
// ================================

const canvas = document.getElementById('wheelCanvas');

function handleWheelClick(event) {
  if (isOverlayOpen()) return;     // Empêche de lancer quand la fenêtre est ouverte

  spinWheel(event.offsetX, event.offsetY);
}

if (canvas) {
  canvas.addEventListener('click', handleWheelClick);
}

// ================================
//   Gestion de la touche ESPACE
// ================================

document.addEventListener('keydown', (ev) => {
  if (ev.code === 'Space') {
    ev.preventDefault();
    if (!isOverlayOpen()) {
      // Espace lance / relance la roue
      spinWheel();
    }
  }
});

// ================================
//   Appel lorsqu’un résultat tombe
// ================================

onWheelStop((resultText) => {
  showOverlay(resultText);
});

// ================================
//   Online / Offline : Hide/Show boutons dynamiques
// ================================

function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  updateConnectivityDisplay(isOnline);
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ================================
//   Initialisation au chargement
// ================================

window.addEventListener('DOMContentLoaded', async () => {

  // 1 — Initialise la roue
  initWheel(canvas);

  // 2 — Charge les boutons dynamiques (réseaux sociaux + feedback)
  await loadDynamicButtons();

  // 3 — Met à jour suivant online/offline
  updateOnlineStatus();
});
