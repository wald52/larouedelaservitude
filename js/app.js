import { initWheel, loadFullData, getEntryDetails, formatEntryForDisplay } from "./entries.js";
import { initAudio, unlockAudio, playSpinClick, playWinSound } from "./audio.js";
import { initMenu, loadHistory, loadSettings, recordSpin, isInfiniteMode } from "./menu.js";

function requireElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`[APP] Élément DOM introuvable : #${id}`);
  }
  return element;
}

const canvas = requireElement('wheelCanvas');
const ctx = canvas.getContext('2d');
const wheelArea = requireElement('wheelArea');
const btn = requireElement('spinBtn');
const countInfo = requireElement('countInfo');
const installPromptBanner = document.getElementById('installPrompt');
const installPromptAction = document.getElementById('installPromptAction');
const installPromptClose = document.getElementById('installPromptClose');
const overlay = requireElement('overlay');
const overlayText = requireElement('overlayText');
const overlayClose = requireElement('overlayClose');
const copyBtn = requireElement('copyText');
const shareButtons = document.querySelectorAll('.share-btn[data-platform]');
if (shareButtons.length === 0) {
  throw new Error('[APP] Aucun bouton de partage trouvé.');
}
const sectorLayer = document.createElement('canvas');
const sectorCtx = sectorLayer.getContext('2d');
const labelLayer = document.createElement('canvas');
const labelCtx = labelLayer.getContext('2d');

/* Tuning */
const rotationFactor = 1.4;
const MAX_VEL = 0.45 * rotationFactor;
const BOOST = 0.05 * rotationFactor;
const BASE_DAMPING = 0.9945 + (rotationFactor - 1) * 0.0015;
const LERP = 0.10;
const INTRO_DURATION_MS = 650;
const CENTER_INTRO_DURATION_MS = 360;
const LABEL_MIN_ARC_PX = 20;
const HTML2CANVAS_SRC = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
const INSTALL_PROMPT_SPIN_THRESHOLD = 3;

/* STATE */
let ENTRIES = [];
let ENTRY_COLORS = [];
let angle = -Math.PI / 2;
let angularVelocity = 0;
let targetVelocity = 0;
let frictionTimer = 0;
let frictionDuration = 0;
let frictionActive = false;
let showedResult = false;
let hasBeenSpun = false;
let lastTime = 0;
let canvasSize = 0;
let deviceScale = 1;
let W = 0;
let H = 0;
let CX = 0;
let CY = 0;
let R = 0;
let labelRadius = 0;
let audioReady = false;
let audioInitPromise = null;
let html2canvasPromise = null;
let menuInitialized = false;
let fullDataLoadScheduled = false;
let deferredInstallPrompt = null;
let completedSpinCount = 0;
let installPromptDismissed = false;
let installPromptPendingAfterOverlay = false;

const introState = {
  active: false,
  startTime: 0,
  duration: INTRO_DURATION_MS
};

const centerIntroState = {
  active: false,
  completed: false,
  pending: false,
  startTime: 0,
  duration: CENTER_INTRO_DURATION_MS
};

/* COLORS PERSISTANTES */
const COLOR_PALETTE = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb923c", "#2dd4bf", "#c084fc"];

/* IMAGE CENTRALE */
const centerImg = new Image();
centerImg.decoding = 'async';
centerImg.src = 'images/center3.avif';
let centerLoaded = false;
centerImg.onload = () => {
  centerLoaded = true;
  if (centerIntroState.pending && !centerIntroState.completed) {
    centerIntroState.pending = false;
    startCenterIntro();
    return;
  }
  drawWheel(angle);
};

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isOverlayOpen() {
  return overlay.getAttribute('aria-hidden') === 'false';
}

function showInstallPromptBanner() {
  if (!installPromptBanner || isAppInstalled()) return;
  installPromptBanner.hidden = false;
  installPromptBanner.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    installPromptBanner.classList.add('is-visible');
  });
}

function hideInstallPromptBanner() {
  if (!installPromptBanner) return;
  installPromptBanner.classList.remove('is-visible');
  installPromptBanner.setAttribute('aria-hidden', 'true');
  clearTimeout(window._installPromptHideTimer);
  window._installPromptHideTimer = setTimeout(() => {
    if (!installPromptBanner.classList.contains('is-visible')) {
      installPromptBanner.hidden = true;
    }
  }, 260);
}

function shouldShowInstallPrompt() {
  return Boolean(deferredInstallPrompt)
    && !installPromptDismissed
    && !isAppInstalled()
    && completedSpinCount >= INSTALL_PROMPT_SPIN_THRESHOLD;
}

function syncInstallPromptVisibility() {
  if (!shouldShowInstallPrompt()) {
    installPromptPendingAfterOverlay = false;
    hideInstallPromptBanner();
    return;
  }

  if (isOverlayOpen()) {
    installPromptPendingAfterOverlay = true;
    hideInstallPromptBanner();
    return;
  }

  installPromptPendingAfterOverlay = false;
  showInstallPromptBanner();
}

function registerCompletedSpin() {
  completedSpinCount += 1;
  syncInstallPromptVisibility();
}

function hideResultOverlay() {
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');

  if (installPromptPendingAfterOverlay) {
    syncInstallPromptVisibility();
  }
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncInstallPromptVisibility();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installPromptDismissed = true;
  installPromptPendingAfterOverlay = false;
  hideInstallPromptBanner();
});

if (installPromptClose) {
  installPromptClose.addEventListener('click', () => {
    installPromptDismissed = true;
    installPromptPendingAfterOverlay = false;
    hideInstallPromptBanner();
  });
}

if (installPromptAction) {
  installPromptAction.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;

    const installEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    installPromptPendingAfterOverlay = false;
    hideInstallPromptBanner();

    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch (error) {
      console.warn('[PWA] Impossible d’ouvrir le prompt d’installation :', error);
    }
  });
}

const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
if (standaloneMediaQuery.addEventListener) {
  standaloneMediaQuery.addEventListener('change', syncInstallPromptVisibility);
}

function scheduleAnimationFrame() {
  if (window._animFrame) return;
  window._animFrame = requestAnimationFrame(animate);
}

function stopAnimationFrame() {
  if (!window._animFrame) return;
  cancelAnimationFrame(window._animFrame);
  window._animFrame = null;
}

function resetContext(targetCtx) {
  targetCtx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
}

function resizeLayer(targetCanvas, targetCtx, size) {
  const pixelSize = Math.max(1, Math.round(size * deviceScale));
  targetCanvas.width = pixelSize;
  targetCanvas.height = pixelSize;
  resetContext(targetCtx);
}

function syncCanvasSize(forceRebuild = false) {
  const rect = canvas.getBoundingClientRect();
  const nextSize = Math.max(1, Math.round(rect.width || Math.min(window.innerWidth * 0.8, 540)));
  const nextScale = Math.min(window.devicePixelRatio || 1, 2);
  const changed = nextSize !== canvasSize || nextScale !== deviceScale;

  if (!changed && !forceRebuild) {
    return false;
  }

  canvasSize = nextSize;
  deviceScale = nextScale;
  W = canvasSize;
  H = canvasSize;
  CX = W / 2;
  CY = H / 2;
  R = Math.min(W, H) * 0.48;
  labelRadius = R * 0.76;

  resizeLayer(canvas, ctx, canvasSize);
  resizeLayer(sectorLayer, sectorCtx, canvasSize);
  resizeLayer(labelLayer, labelCtx, canvasSize);

  if (ENTRIES.length > 0) {
    buildWheelLayers();
  }

  drawWheel(angle);
  return true;
}

function buildColors() {
  if (ENTRY_COLORS.length === 0) {
    for (let i = 0; i < ENTRIES.length; i++) {
      ENTRY_COLORS.push(COLOR_PALETTE[i % COLOR_PALETTE.length]);
    }
  }

  while (ENTRY_COLORS.length < ENTRIES.length) {
    ENTRY_COLORS.push(COLOR_PALETTE[ENTRY_COLORS.length % COLOR_PALETTE.length]);
  }

  return ENTRY_COLORS;
}

function getSliceArcPx(entryCount = ENTRIES.length) {
  if (!entryCount || !labelRadius) return 0;
  return (Math.PI * 2 * labelRadius) / entryCount;
}

function shouldShowLabels(entryCount = ENTRIES.length) {
  return getSliceArcPx(entryCount) >= LABEL_MIN_ARC_PX;
}

function updateCountInfo() {
  if (!countInfo) return;
  const suffix = isInfiniteMode() ? " · mode sans fin" : "";
  countInfo.textContent = ENTRIES.length + " éléments restants" + suffix;
}

function buildSectorLayer() {
  resetContext(sectorCtx);
  sectorCtx.clearRect(0, 0, W, H);

  const n = ENTRIES.length;
  if (!n) return;

  const colors = buildColors();
  const step = (Math.PI * 2) / n;

  sectorCtx.save();
  sectorCtx.translate(CX, CY);

  for (let i = 0; i < n; i++) {
    sectorCtx.beginPath();
    sectorCtx.moveTo(0, 0);
    sectorCtx.arc(0, 0, R, i * step, (i + 1) * step);
    sectorCtx.closePath();
    sectorCtx.fillStyle = colors[i];
    sectorCtx.fill();
  }

  sectorCtx.restore();
}

function buildLabelLayer() {
  resetContext(labelCtx);
  labelCtx.clearRect(0, 0, W, H);

  const n = ENTRIES.length;
  if (!n || !shouldShowLabels(n)) return;

  const step = (Math.PI * 2) / n;
  const sliceArcPx = getSliceArcPx(n);
  const maxWidthBase = Math.min(R * 0.44, sliceArcPx * 0.9);

  labelCtx.save();
  labelCtx.translate(CX, CY);
  labelCtx.fillStyle = "#111";
  labelCtx.textAlign = "center";
  labelCtx.textBaseline = "middle";

  for (let i = 0; i < n; i++) {
    const text = String(ENTRIES[i] || "");
    const mid = (i + 0.5) * step;
    const x = Math.cos(mid) * labelRadius;
    const y = Math.sin(mid) * labelRadius;
    let fontSize = Math.min(18, Math.max(10, sliceArcPx * 0.58, 16 - text.length / 18));

    labelCtx.save();
    labelCtx.translate(x, y);
    labelCtx.rotate(mid);
    labelCtx.font = `${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;

    while (labelCtx.measureText(text).width > maxWidthBase && fontSize > 8) {
      fontSize -= 1;
      labelCtx.font = `${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    }

    let truncated = text;
    while (labelCtx.measureText(truncated).width > maxWidthBase && truncated.length > 3) {
      truncated = truncated.slice(0, -1);
    }
    if (truncated.length < text.length) {
      truncated = truncated.trim() + "…";
    }

    labelCtx.fillText(truncated, 0, 0);
    labelCtx.restore();
  }

  labelCtx.restore();
}

function buildWheelLayers() {
  buildSectorLayer();
  buildLabelLayer();
}

function resetCenterIntro() {
  centerIntroState.active = false;
  centerIntroState.completed = false;
  centerIntroState.pending = false;
  centerIntroState.startTime = 0;
}

function drawBuiltSectors(progress = 1) {
  if (progress >= 1 || ENTRIES.length === 0) {
    ctx.drawImage(sectorLayer, -CX, -CY, W, H);
    return;
  }

  const n = ENTRIES.length;
  const step = (Math.PI * 2) / n;
  const scaledProgress = progress * n;
  const fullSlices = Math.floor(scaledProgress);
  const partialProgress = scaledProgress - fullSlices;

  if (fullSlices > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, 0, fullSlices * step);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(sectorLayer, -CX, -CY, W, H);
    ctx.restore();
  }

  if (partialProgress > 0 && fullSlices < n) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, fullSlices * step, fullSlices * step + step * easeOutCubic(partialProgress));
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(sectorLayer, -CX, -CY, W, H);
    ctx.restore();
  }
}

function startCenterIntro(now = performance.now()) {
  if (centerIntroState.completed || centerIntroState.active) return;

  if (!centerLoaded) {
    centerIntroState.pending = true;
    return;
  }

  centerIntroState.pending = false;
  centerIntroState.active = true;
  centerIntroState.startTime = now;
  scheduleAnimationFrame();
}

function completeCenterIntro() {
  centerIntroState.active = false;
  centerIntroState.pending = false;
  centerIntroState.completed = true;
}

function getCenterIntroProgress(now = performance.now()) {
  if (centerIntroState.completed) {
    return 1;
  }

  if (!centerLoaded) {
    return 0;
  }

  if (!centerIntroState.active) {
    return 0;
  }

  const rawProgress = Math.min(1, Math.max(0, (now - centerIntroState.startTime) / centerIntroState.duration));

  if (rawProgress >= 1) {
    completeCenterIntro();
    return 1;
  }

  return easeOutCubic(rawProgress);
}

function drawCenterLayer(now = performance.now()) {
  if (!centerLoaded) return;

  const progress = getCenterIntroProgress(now);
  if (progress <= 0) return;

  const imgSize = R * 1.05;
  ctx.save();
  ctx.rotate(Math.PI / 2);
  ctx.globalAlpha = progress;
  const scale = 0.82 + (0.18 * progress);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(centerImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
  ctx.restore();
}

function getIntroProgress(now = performance.now()) {
  if (!introState.active) {
    return 1;
  }

  const rawProgress = Math.min(1, Math.max(0, (now - introState.startTime) / introState.duration));

  if (rawProgress >= 1) {
    introState.active = false;
    startCenterIntro(now);
    return 1;
  }

  return easeOutCubic(rawProgress);
}

function finishIntroBuild() {
  if (!introState.active) return;
  introState.active = false;
  completeCenterIntro();
  drawWheel(angle);
}

function runIntroBuild() {
  resetCenterIntro();
  introState.active = true;
  introState.startTime = performance.now();
  introState.duration = INTRO_DURATION_MS;
  lastTime = introState.startTime;
  scheduleAnimationFrame();
}

function drawWheel(a, now = performance.now()) {
  if (!W || !H) return;

  resetContext(ctx);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(a);

  const introProgress = getIntroProgress(now);
  drawBuiltSectors(introProgress);

  if (introProgress >= 1 && shouldShowLabels()) {
    ctx.drawImage(labelLayer, -CX, -CY, W, H);
  }

  drawCenterLayer(now);
  ctx.restore();
}

function ensureAudioInitialized() {
  if (audioReady) return Promise.resolve();
  if (audioInitPromise) return audioInitPromise;

  audioInitPromise = initAudio()
    .then(() => {
      audioReady = true;
      console.log('[APP] Audio prêt après interaction');
    })
    .catch((error) => {
      audioInitPromise = null;
      console.error('[APP] Erreur initialisation audio:', error);
    });

  return audioInitPromise;
}

function ensureHtml2Canvas() {
  if (window.html2canvas) {
    return Promise.resolve(window.html2canvas);
  }

  if (html2canvasPromise) {
    return html2canvasPromise;
  }

  html2canvasPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-html2canvas-loader="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.html2canvas), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Impossible de charger le module de partage.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = HTML2CANVAS_SRC;
    script.async = true;
    script.dataset.html2canvasLoader = 'true';
    script.onload = () => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
      } else {
        reject(new Error('Le module de capture est indisponible.'));
      }
    };
    script.onerror = () => reject(new Error('Impossible de charger le module de partage.'));
    document.head.appendChild(script);
  }).catch((error) => {
    html2canvasPromise = null;
    throw error;
  });

  return html2canvasPromise;
}

function scheduleFullDataLoad() {
  if (fullDataLoadScheduled) return;
  fullDataLoadScheduled = true;

  const load = () => {
    loadFullData().then(() => {
      console.log('[APP] Données complètes chargées');
    }).catch((error) => {
      console.error('[APP] Erreur chargement données complètes:', error);
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load, { timeout: 1200 });
  } else {
    setTimeout(load, 0);
  }
}

function scheduleDeferredInit() {
  const launch = () => {
    if (!menuInitialized) {
      menuInitialized = true;
      initMenu();
      updateCountInfo();
      console.log('[APP] Menu initialisé (lazy)');
    }
    scheduleFullDataLoad();
  };

  if ('requestIdleCallback' in window) {
    // On attend que le navigateur soit au repos, avec un délai max de 3s
    requestIdleCallback(launch, { timeout: 3000 });
  } else {
    // Fallback : on attend 2 secondes après le rendu initial
    setTimeout(launch, 2000);
  }
}

function shouldAnimate() {
  return introState.active || centerIntroState.active || Math.abs(angularVelocity) > 0.001 || Math.abs(targetVelocity) > 0.001;
}

async function initializeApp() {
  try {
    loadHistory();
    loadSettings();

    syncCanvasSize();

    const lightData = await initWheel();
    ENTRIES = lightData.map(entry => entry.nom);

    buildColors();
    buildWheelLayers();
    updateCountInfo();
    drawWheel(angle);
    runIntroBuild();
    attachWheelListeners();
    scheduleDeferredInit();

    // 🔊 Chargement audio différé (Priorité au rendu visuel)
    const startAudio = () => {
      initAudio();
      const unlock = () => {
        unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('touchstart', unlock);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(startAudio);
    } else {
      setTimeout(startAudio, 1500);
    }

    console.log('[APP] Roue initialisée avec', ENTRIES.length, 'entrées');
  } catch (e) {
    console.error('[APP] Erreur initialisation:', e);
    ENTRIES = ['Erreur de chargement', 'Veuillez rafraîchir la page'];
    syncCanvasSize(true);
    buildWheelLayers();
    drawWheel(angle);
  }
}

/* =======================
   INTERACTION / BOOST
   ======================= */
function boostWheel(e) {
  console.log('[BOOST] boostWheel appelé, ENTRIES.length =', ENTRIES.length);

  if (ENTRIES.length === 0) {
    console.warn('[BOOST] ENTRIES est vide !');
    return;
  }

  finishIntroBuild();
  completeCenterIntro();
  ensureAudioInitialized();
  hasBeenSpun = true;

  if (typeof window.spawnBills === 'function') {
    window.spawnBills(e, 8);
  }

  if (Math.abs(angularVelocity) < 0.01) {
    targetVelocity = Math.min(MAX_VEL, targetVelocity + BOOST * 3.0);
    angularVelocity = Math.min(MAX_VEL, angularVelocity + BOOST * 1.0);
  } else {
    const boostFactor = 1 + Math.min(Math.abs(angularVelocity) * 8, 1.8);
    targetVelocity = Math.min(MAX_VEL, targetVelocity + BOOST * boostFactor);
    angularVelocity = Math.min(MAX_VEL, angularVelocity + BOOST * 0.6);
  }

  frictionActive = false;
  frictionTimer = 0;
  clearTimeout(window._frictionResume);
  window._frictionResume = setTimeout(() => {
    frictionActive = true;
  }, 600);

  showedResult = false;
  lastTime = performance.now();
  scheduleAnimationFrame();
  console.log('[BOOST] angularVelocity:', angularVelocity, 'targetVelocity:', targetVelocity);
}

function attachWheelListeners() {
  if (canvas && btn) {
    canvas.addEventListener('pointerdown', boostWheel);
    btn.addEventListener('click', boostWheel);
    console.log('[BOOST] Écouteurs attachés');
  } else {
    console.error('[BOOST] canvas ou btn non trouvé !');
  }
}

/* =======================
   SON PAR PASSAGE DE SECTEUR
   ======================= */

animate && (animate.prevIndex = -1);

function playSectorClick() {
  if (!audioReady) return;
  playSpinClick(Math.abs(angularVelocity));
}

/* =======================
   SELECTION / OVERLAY
   ======================= */
function getSelectedIndex(a){
  const n = ENTRIES.length;
  if (n === 0) return -1;
  const step = (Math.PI*2)/n;
  let theta = (-Math.PI/2 - a) % (Math.PI*2);
  if (theta < 0) theta += Math.PI*2;
  return Math.floor(theta / step);
}

async function showOverlay(entryIndex){
  const intros = [
    "🎯 Le Fisc a parlé !",
    "✨ Voici votre contribution :",
    "🍀 Et le grand gagnant est… votre portefeuille !",
    "💸 Félicitations, vous venez de gagner une nouvelle taxe !",
    "🎉 Bravo, vous avez été sélectionné pour payer plus !",
    "💰 La taxe du jour :",
    "🎁 Surprise ! Une nouvelle taxe pour vous !",
    "🏅 Médaille d'or pour votre contribution fiscale !",
    "💣 Boom ! Voici votre prochaine taxe !"
  ];
  const intro = intros[Math.floor(Math.random()*intros.length)];
  
  // Récupérer les détails complets de l'entrée
  const entry = await getEntryDetails(entryIndex);
  const formatted = formatEntryForDisplay(entry);

  // 💬 contenu principal du résultat
  overlayText.innerHTML = `
    ${intro}<br><br>${formatted}
    <div class="feedback-buttons">
      <a id="btn-info" class="feedback-btn" href="#">Donner un complément d'information</a>
      <a id="btn-error" class="feedback-btn" href="#">Signaler une erreur</a>
    </div>
  `;

  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden','false');
}

// 🧩 Attache les écouteurs de feedback UNE SEULE FOIS au démarrage
document.addEventListener('click', (e) => {
  const infoBtn = e.target.closest('#btn-info');
  const errorBtn = e.target.closest('#btn-error');
  
  if (!infoBtn && !errorBtn) return;
  e.preventDefault();

  // On récupère le texte du résultat actuel dans l'overlay
  const feedbackText = overlayText.innerText.split('\n\n')[1] || overlayText.innerText;

  if (infoBtn) {
    const userMsg = prompt("💬 Ajoutez votre complément d'information :");
    if (userMsg) sendFeedbackToGitHub(feedbackText, userMsg, "info");
  } else if (errorBtn) {
    const userMsg = prompt("⚠️ Décrivez l'erreur que vous avez trouvée :");
    if (userMsg) sendFeedbackToGitHub(feedbackText, userMsg, "error");
  }
});

// handlers for the feedback modal (adapt to your showOverlay call)
const openBtn = requireElement('openFeedbackForm');
const modal = requireElement('feedbackModal');
const form = requireElement('feedbackForm');
const closeBtn = requireElement('closeFeedback');
const status = requireElement('feedbackStatus');

function openFeedback(resultText){
  requireElement('formResult').value = resultText;
  requireElement('formMessage').value = '';
  requireElement('formEmail').value = '';
  requireElement('honeypot').value = '';
  status.style.display = 'none';
  modal.style.display = 'flex';
}

closeBtn.addEventListener('click', ()=> modal.style.display='none');
modal.addEventListener('click', (e)=> { if (e.target === modal) modal.style.display='none'; });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.style.display = 'block'; status.textContent = 'Envoi en cours…';
  const payload = {
    resultText: requireElement('formResult').value,
    userMessage: requireElement('formMessage').value,
    userEmail: requireElement('formEmail').value,
    honeypot: requireElement('honeypot').value || ''
  };
  try {
    const resp = await fetch('/.netlify/functions/sendFeedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await resp.json();
    if (json.ok) {
      status.textContent = 'Merci — votre message a été envoyé !';
      if (json.url) {
        const ticketUrl = new URL(json.url, window.location.origin);
        const lineBreak = document.createElement('br');
        const link = document.createElement('a');
        link.href = ticketUrl.href;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Voir le ticket sur GitHub';
        status.append(lineBreak, link);
      }
      setTimeout(()=> modal.style.display='none', 1500);
    } else {
      status.textContent = 'Erreur lors de l’envoi : ' + (json.error || 'unknown');
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Erreur réseau lors de l’envoi.';
  }
});

overlayClose.addEventListener('click', hideResultOverlay);
overlay.addEventListener('click', e => { if (e.target === overlay) { hideResultOverlay(); }});
overlay.querySelector('.bubble').addEventListener('click', e => e.stopPropagation());
copyBtn && copyBtn.addEventListener('click', async ()=>{
  try { await navigator.clipboard.writeText(overlayText.innerText); copyBtn.textContent = '✅'; setTimeout(()=>copyBtn.textContent='📋',800); }
  catch(e){ alert('Impossible de copier'); }
});

/* =======================
   ANIMATION
   ======================= */
function finalizeSpinResult(idx) {
  getEntryDetails(idx).then(entry => {
    if (entry) {
      recordSpin(entry);
    }

    registerCompletedSpin();
    showOverlay(idx);

    if (!isInfiniteMode()) {
      ENTRIES.splice(idx, 1);
      ENTRY_COLORS.splice(idx, 1);
      buildWheelLayers();
      updateCountInfo();
      animate.prevIndex = -1;
    }

    drawWheel(angle);
    setTimeout(() => { hasBeenSpun = false; }, 300);
  });
}

function completeSpinIfNeeded() {
  if (!hasBeenSpun || showedResult) return false;

  const idx = getSelectedIndex(angle);
  if (idx < 0 || ENTRIES[idx] === undefined) return false;

  showedResult = true;
  if (audioReady) {
    playWinSound();
  }
  finalizeSpinResult(idx);
  return true;
}

function animate(now) {
  window._animFrame = null;

  const previousTime = lastTime || now;
  const deltaTime = Math.min(10, (now - previousTime) / 16.67);
  lastTime = now;

  angularVelocity += (targetVelocity - angularVelocity) * (LERP * deltaTime);
  angle += angularVelocity * deltaTime;

  const isMoving = Math.abs(angularVelocity) > 0.001 || Math.abs(targetVelocity) > 0.001;
  const n = ENTRIES.length;

  if (isMoving && n > 0) {
    const step = (Math.PI * 2) / n;
    let pointerAngle = (-Math.PI / 2 - angle) % (Math.PI * 2);
    if (pointerAngle < 0) pointerAngle += Math.PI * 2;
    const currentIndex = Math.floor(pointerAngle / step);
    if (currentIndex !== (animate.prevIndex ?? -1)) {
      animate.prevIndex = currentIndex;
      playSectorClick();
    }
  }

  if (targetVelocity > 0.001) {
    if (!frictionActive) {
      frictionActive = true;
      frictionTimer = 0;
      frictionDuration = 180 + Math.random() * 120;
    }
    const t = frictionTimer / frictionDuration;
    if (t < 1) {
      targetVelocity *= Math.pow(BASE_DAMPING - t * 0.03, deltaTime);
      frictionTimer += deltaTime;
    } else {
      targetVelocity *= Math.pow(0.9, deltaTime);
    }
  } else {
    frictionActive = false;
    frictionTimer = 0;
  }

  if (Math.abs(angularVelocity) <= 0.001 && Math.abs(targetVelocity) <= 0.001) {
    angularVelocity = 0;
    targetVelocity = 0;
    completeSpinIfNeeded();
  }

  drawWheel(angle, now);

  if (shouldAnimate()) {
    scheduleAnimationFrame();
  }
}

/* =======================
   VISIBILITY / ONGLET
   ======================= */
let hiddenAt = null;
let wasAnimating = false;

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenAt = performance.now();
    wasAnimating = shouldAnimate();
    stopAnimationFrame();
  } else {
    const now = performance.now();
    const elapsed = hiddenAt ? now - hiddenAt : 0;
    hiddenAt = null;

    if (Math.abs(angularVelocity) > 0.001 || Math.abs(targetVelocity) > 0.001) {
      const decay = Math.exp(-elapsed / 3000);
      angularVelocity *= decay;
      targetVelocity *= decay;

      if (Math.abs(angularVelocity) <= 0.001 && Math.abs(targetVelocity) <= 0.001) {
        angularVelocity = 0;
        targetVelocity = 0;
        completeSpinIfNeeded();
      }
    }

    drawWheel(angle, now);
    lastTime = now;

    if (wasAnimating && shouldAnimate()) {
      scheduleAnimationFrame();
    }

    wasAnimating = false;
  }
});


async function optimizeImageWebP(base64, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        if (img.width === 0 || img.height === 0) {
          throw new Error("Dimensions d'image invalides");
        }
        const ratio = img.width / img.height;
        const targetWidth = Math.min(img.width, maxWidth);
        const targetHeight = targetWidth / ratio;
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const optimized = canvas.toDataURL("image/webp", quality)
          .replace(/^data:image\/webp;base64,/, "");
        resolve(optimized);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => {
      console.error("Erreur de chargement de l'image :", e);
      reject(new Error("Impossible de charger l'image"));
    };
    img.src = base64;
  });
}

async function captureWheelArea() {
  const html2canvas = await ensureHtml2Canvas();
  const shareBar = document.getElementById('shareBar');
  const previousDisplay = shareBar.style.display;

  shareBar.style.display = 'none';

  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    const rect = wheelArea.getBoundingClientRect();
    return await html2canvas(document.body, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      scale: 2,
      useCORS: true,
      backgroundColor: '#f7f7f7',
      logging: false
    });
  } finally {
    shareBar.style.display = previousDisplay;
  }
}



  
/* =======================
   PARTAGE / CAPTURE amélioré
   ======================= */
shareButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const platform = btn.dataset.platform;
    const text = overlayText.innerText;
    const originalText = btn.textContent;

    // CAS SPÉCIAUX : Téléchargement direct (Instagram, TikTok, Snapchat)
    if (['instagram', 'tiktok', 'snapchat'].includes(platform)) {
      try {
        const canvasCap = await captureWheelArea();

        const rawBase64 = canvasCap.toDataURL("image/png");

        // On passe à 800px de large max et qualité 0.6 (suffisant pour Twitter/FB)
        // Cela peut diviser le poids du fichier par 4 ou 5.
        const optimizedBase64 = await optimizeImageWebP(rawBase64, 800, 0.60);

        // Log pour vérifier la taille dans la console avant envoi
        console.log("Taille approximative de l'image (ko):", Math.round(optimizedBase64.length / 1024));
        
        const imageData = "data:image/webp;base64," + optimizedBase64;
        const a = document.createElement('a');
        a.href = imageData;
        a.download = `roue-${platform}-${Date.now()}.webp`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        alert(`✅ Image téléchargée !\n\n📱 Ouvrez ${platform.toUpperCase()} et publiez l'image depuis votre galerie.`);
      } catch (error) {
        console.error('Erreur téléchargement:', error);
        alert('❌ Erreur lors du téléchargement de l\'image.');
      }
      return;
    }

    // AUTRES PLATEFORMES : Netlify Function
    try {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.textContent = '⏳';

      console.log("📸 Capture en cours...");
      const canvasCap = await captureWheelArea();

      console.log("🔄 Optimisation de l'image...");
      const rawBase64 = canvasCap.toDataURL("image/png");
      const optimizedBase64 = await optimizeImageWebP(rawBase64, 1200, 0.85);

      console.log("☁️ Upload sécurisé vers Netlify Function...");

      const SHARE_IMAGE_URL = window.location.hostname.includes("netlify.app")
        ? "/.netlify/functions/shareImage"
        : "https://larouedelaservitude.netlify.app/.netlify/functions/shareImage";

      
      const response = await fetch(SHARE_IMAGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: optimizedBase64,
          text: text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur serveur');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload échoué');
      }

      const { imageUrl, sharePageUrl } = result;
      console.log("✅ Upload réussi:", sharePageUrl);

      const msg = encodeURIComponent(text);
      const siteUrl = window.location.origin + window.location.pathname;
      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`;
          break;
        case 'x':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(text.split('\n')[0])}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl)}`;
          break;
        case 'pinterest':
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(siteUrl)}&media=${encodeURIComponent(imageUrl)}&description=${msg}`;
          break;
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${msg}%0A%0A${encodeURIComponent(imageUrl)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${msg}`;
          break;
        default:
          alert('Plateforme non supportée');
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.textContent = originalText;
          return;
      }

      console.log("🚀 Ouverture du partage...");
      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = originalText;

    } catch (error) {
      console.error('❌ Erreur lors du partage:', error);
      alert(`❌ Erreur : ${error.message}`);
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = originalText;
    }
  });
});

/* =======================
   INIT
   ======================= */
function updateBg(){
  const d = Math.sqrt(innerWidth**2 + innerHeight**2);
  document.documentElement.style.setProperty('--bg-size', `${Math.ceil(d*1.2)}px`);
  const base = Math.max(36, Math.min(Math.round(innerWidth/12), 160));
  document.documentElement.style.setProperty('--emoji-size', `${base}px`);
}

function handleResize() {
  updateBg();
  const resized = syncCanvasSize();
  if (resized && shouldAnimate()) {
    lastTime = performance.now();
    scheduleAnimationFrame();
  }
}

let resizePending = false;

function scheduleResizeRecalculation() {
  if (resizePending) return;
  resizePending = true;

  requestAnimationFrame(() => {
    resizePending = false;
    handleResize();
  });
}

addEventListener('resize', scheduleResizeRecalculation);
addEventListener('orientationchange', scheduleResizeRecalculation);
updateBg();
initializeApp();

// ✅ Gère la touche Espace uniquement quand aucune fenêtre n'est ouverte
document.addEventListener('keydown',(e)=>{
  if (e.code === 'Space') {
    e.preventDefault();

    // Vérifie si une fenêtre (overlay) est visible
    const anyModalOpen =
      document.getElementById('overlay')?.style.display === 'flex' ||
      document.getElementById('feedbackForm')?.style.display === 'flex' ||
      document.getElementById('menuSidebar')?.classList.contains('active') ||
      document.querySelector('.menu-panel.active');

    // Si aucune fenêtre ouverte -> autorise la rotation
    if (!anyModalOpen) {
      boostWheel();
    }
  }
});

window.addEventListener('infiniteModeChange', () => {
  updateCountInfo();
});

// === Détection automatique de l'environnement (Netlify ou autre) ===
const isNetlifyHost = window.location.hostname.includes("netlify.app");

// Si le site n'est pas sur Netlify, on cible directement le domaine Netlify du projet
const NETLIFY_FUNCTION_URL = isNetlifyHost
  ? "/.netlify/functions/sendFeedback"
  : "https://larouedelaservitude.netlify.app/.netlify/functions/sendFeedback";

// 🧩 Limite anti-abus côté client : 1 envoi par minute max
let lastFeedbackTime = 0;
  
// === 🧩 Fonction d’envoi vers GitHub Discussions via Netlify ===
function sendFeedbackToGitHub(resultText, userMessage, type) {
  const now = Date.now();

  // Vérifie s'il y a eu un envoi récent
  if (now - lastFeedbackTime < 60000) { // 60 000 ms = 1 minute
    alert("Merci d’attendre une minute avant d’envoyer un nouveau message.");
    return;
  }

  // Met à jour la dernière heure d'envoi
  lastFeedbackTime = now;

  // Envoi normal
  console.log("📡 Envoi du feedback vers :", NETLIFY_FUNCTION_URL);
  
  fetch(NETLIFY_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resultText, userMessage, type })
  })
  .then(async res => {
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();  // lit toujours la réponse, même si ce n’est pas du JSON

  // si JSON → on parse
    if (contentType.includes("application/json")) {
      try {
        const data = JSON.parse(text);
        if (!res.ok) throw data;
        return data;
      } catch (e) {
        throw {
          ok: false,
          error: "Réponse JSON invalide",
          raw: text
        };
      }
    }

  // si texte brut → c’est sûrement un message d’erreur humain du serveur
    if (!res.ok) {
      throw {
        ok: false,
        error: text   // c’est ici que "Message trop court..." remontera proprement
      };
    }

    return { ok: true, text };
  })
  .then(data => {
  // succès : message envoyé
    alert("Merci pour votre retour !");
  })
  .catch(err => {
  // ici, on affiche l’erreur lisible
    alert(err.error || "Erreur inconnue");
  });

}

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker enregistré avec succès : ', registration.scope);
          
          // 🔄 Détecter les mises à jour du Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[SW] Nouvelle version en installation...');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouveau SW installé, prêt à activer
                console.log('[SW] Nouvelle version prête. Activation immédiate...');
                // Le nouveau SW va prendre le contrôle automatiquement grâce à skipWaiting() + claim()
              }
            });
          });
        })
        .catch((error) => {
          console.log('Échec de l\'enregistrement du ServiceWorker : ', error);
        });
      
      // 📨 Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('[SW] Mise à jour détectée:', event.data.cache);
          // Optionnel : Afficher une notification ou refresh auto
          // window.location.reload(); // Décommenter pour refresh automatique
        }
      });
    });
  }

  // Initialiser les billets (module ES6)
  import('../bills.js').then(({ initBills }) => {
    if (initBills) {
      initBills();
      console.log('[APP] Bills initialisés');
    }
  });
