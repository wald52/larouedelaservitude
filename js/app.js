import { initWheel, loadFullData, getEntryDetails, formatEntryForDisplay } from "./entries.js";
import { initAudio, unlockAudio, isSoundEnabled, playSpinClick, playWinSound } from "./audio.js";
import { initMenu, loadHistory, loadSettings, recordSpin, isInfiniteMode } from "./menu.js";
import { initServiceWorker, applyPendingUpdate } from "./sw-update.js";
import { pushFocusTrap, popFocusTrap, hasFocusTrap } from "./focus-trap.js";

function requireElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`[APP] Élément DOM introuvable : #${id}`);
  }
  return element;
}

const canvas = requireElement("wheelCanvas");
const ctx = canvas.getContext("2d");
const wheelArea = requireElement("wheelArea");
const btn = requireElement("spinBtn");
const countInfo = requireElement("countInfo");
const installPromptBanner = document.getElementById("installPrompt");
const installPromptAction = document.getElementById("installPromptAction");
const installPromptClose = document.getElementById("installPromptClose");
const overlay = requireElement("overlay");
const overlayText = requireElement("overlayText");
const overlayClose = requireElement("overlayClose");
const copyBtn = requireElement("copyText");
const shareButtons = document.querySelectorAll("#shareBar button[data-platform]");
if (shareButtons.length === 0) {
  throw new Error("[APP] Aucun bouton de partage trouvé.");
}
const sectorLayer = document.createElement("canvas");
const sectorCtx = sectorLayer.getContext("2d");
const labelLayer = document.createElement("canvas");
const labelCtx = labelLayer.getContext("2d");

/* Tuning */
const rotationFactor = 1.4;
const MAX_VEL = 0.45 * rotationFactor;
const BOOST = 0.05 * rotationFactor;
const BASE_DAMPING = 0.9945 + (rotationFactor - 1) * 0.0015;
const LERP = 0.1;
const INTRO_DURATION_MS = 650;
const CENTER_INTRO_DURATION_MS = 360;
const LABEL_MIN_ARC_PX = 20;
const INSTALL_PROMPT_SPIN_THRESHOLD = 3;
// Amortissement appliqué quand l'utilisateur demande moins d'animation : la
// roue tourne une fraction de seconde puis livre son résultat.
const REDUCED_MOTION_DAMPING = 0.93;

// Préférence système « mouvement réduit ». Interrogée en direct (et non figée
// au démarrage) pour suivre un changement de réglage sans rechargement.
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}

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
let menuInitialized = false;
let fullDataLoadScheduled = false;
let deferredInstallPrompt = null;
let completedSpinCount = 0;
let installPromptDismissed = false;
let installPromptPendingAfterOverlay = false;
let billsInitPromise = null;
let billsModule = null;
let animFrameId = null;
let frictionResumeTimer = 0;
let installPromptHideTimer = 0;
// Mise à jour de données reçue pendant une rotation, appliquée à l'arrêt.
let pendingEntriesRefresh = false;

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
const COLOR_PALETTE = [
  "#f87171",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#c084fc"
];

/* IMAGE CENTRALE */
const centerImg = new Image();
centerImg.decoding = "async";
centerImg.src = "images/center3.avif";
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
  return (
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
  );
}

function isOverlayOpen() {
  return overlay.getAttribute("aria-hidden") === "false";
}

function showInstallPromptBanner() {
  if (!installPromptBanner || isAppInstalled()) return;
  installPromptBanner.hidden = false;
  installPromptBanner.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    installPromptBanner.classList.add("is-visible");
  });
}

function hideInstallPromptBanner() {
  if (!installPromptBanner) return;
  installPromptBanner.classList.remove("is-visible");
  installPromptBanner.setAttribute("aria-hidden", "true");
  clearTimeout(installPromptHideTimer);
  installPromptHideTimer = setTimeout(() => {
    if (!installPromptBanner.classList.contains("is-visible")) {
      installPromptBanner.hidden = true;
    }
  }, 260);
}

function shouldShowInstallPrompt() {
  return (
    Boolean(deferredInstallPrompt) &&
    !installPromptDismissed &&
    !isAppInstalled() &&
    completedSpinCount >= INSTALL_PROMPT_SPIN_THRESHOLD
  );
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

/* =======================
   MODALES : FOCUS
   ======================= */
// Les deux modales (résultat et retour utilisateur) partagent le même
// comportement : le focus entre dedans à l'ouverture, y reste tant qu'elles
// sont ouvertes, et revient à son point de départ à la fermeture.

// La mécanique elle-même (pile de surfaces, capture du Tab, restitution du
// focus) vit dans js/focus-trap.js, partagée avec le menu.
function openModal(container, initialFocus) {
  pushFocusTrap(container, { initialFocus });
}

function closeModal(container) {
  popFocusTrap(container);
}

function hideResultOverlay() {
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
  closeModal(overlay);

  if (installPromptPendingAfterOverlay) {
    syncInstallPromptVisibility();
  }

  // Moment calme : si une mise à jour attendait que l'utilisateur soit
  // disponible, c'est ici qu'elle s'applique.
  applyPendingUpdate();
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncInstallPromptVisibility();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installPromptDismissed = true;
  installPromptPendingAfterOverlay = false;
  hideInstallPromptBanner();
});

if (installPromptClose) {
  installPromptClose.addEventListener("click", () => {
    installPromptDismissed = true;
    installPromptPendingAfterOverlay = false;
    hideInstallPromptBanner();
  });
}

if (installPromptAction) {
  installPromptAction.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    const installEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    installPromptPendingAfterOverlay = false;
    hideInstallPromptBanner();

    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch (error) {
      console.warn("[PWA] Impossible d’ouvrir le prompt d’installation :", error);
    }
  });
}

const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");
if (standaloneMediaQuery.addEventListener) {
  standaloneMediaQuery.addEventListener("change", syncInstallPromptVisibility);
}

function scheduleAnimationFrame() {
  if (animFrameId) return;
  animFrameId = requestAnimationFrame(animate);
}

function stopAnimationFrame() {
  if (!animFrameId) return;
  cancelAnimationFrame(animFrameId);
  animFrameId = null;
}

function resetContext(targetCtx) {
  targetCtx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = "high";
}

function resizeLayer(targetCanvas, targetCtx, size) {
  const pixelSize = Math.max(1, Math.round(size * deviceScale));
  targetCanvas.width = pixelSize;
  targetCanvas.height = pixelSize;
  resetContext(targetCtx);
}

function getCanvasScale(viewportWidth = window.innerWidth) {
  const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  const deviceMemory = Number(navigator.deviceMemory) || Infinity;
  const isSmallViewport = viewportWidth <= 768;
  const isTouchViewport = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isConstrainedDevice = deviceMemory <= 4 || prefersReducedMotion();
  const scaleCap = isSmallViewport || isTouchViewport || isConstrainedDevice ? 1.5 : 2;

  return Math.min(pixelRatio, scaleCap);
}

function syncCanvasSize(forceRebuild = false) {
  const rect = canvas.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const nextSize = Math.max(1, Math.round(rect.width || Math.min(viewportWidth * 0.8, 540)));
  const nextScale = getCanvasScale(viewportWidth);
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
  const summary = ENTRIES.length + " éléments restants" + suffix;
  countInfo.textContent = summary;
  // La roue est un canvas : sans nom accessible, un lecteur d'écran ne voit
  // rien du tout à cet endroit de la page.
  canvas.setAttribute("aria-label", `Roue des taxes et prélèvements français — ${summary}`);
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

  const rawProgress = Math.min(
    1,
    Math.max(0, (now - centerIntroState.startTime) / centerIntroState.duration)
  );

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
  const scale = 0.82 + 0.18 * progress;
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
  if (!isSoundEnabled()) {
    audioInitPromise = null;
    return Promise.resolve(false);
  }

  if (audioReady) return Promise.resolve(true);
  if (audioInitPromise) return audioInitPromise;

  audioInitPromise = initAudio()
    .then((initialized) => {
      audioReady = initialized === true;
      if (audioReady) {
        console.log("[APP] Audio prêt après interaction");
      }
      return audioReady;
    })
    .catch((error) => {
      audioInitPromise = null;
      console.error("[APP] Erreur initialisation audio:", error);
    });

  return audioInitPromise;
}

function scheduleFullDataLoad(reason = "interaction") {
  if (fullDataLoadScheduled) return;
  fullDataLoadScheduled = true;

  loadFullData()
    .then(() => {
      console.log(`[APP] Données complètes chargées (${reason})`);
    })
    .catch((error) => {
      fullDataLoadScheduled = false;
      console.error("[APP] Erreur chargement données complètes:", error);
    });
}

function scheduleDeferredInit() {
  const launch = () => {
    if (!menuInitialized) {
      menuInitialized = true;
      initMenu();
      updateCountInfo();
      console.log("[APP] Menu initialisé (lazy)");
    }
  };

  if ("requestIdleCallback" in window) {
    // On attend que le navigateur soit au repos, avec un délai max de 3s
    requestIdleCallback(launch, { timeout: 3000 });
  } else {
    // Fallback : on attend 2 secondes après le rendu initial
    setTimeout(launch, 2000);
  }
}

function shouldAnimate() {
  return (
    introState.active ||
    centerIntroState.active ||
    Math.abs(angularVelocity) > 0.001 ||
    Math.abs(targetVelocity) > 0.001
  );
}

async function initializeApp() {
  try {
    loadHistory();
    loadSettings();

    syncCanvasSize();

    const lightData = await initWheel();
    ENTRIES = lightData.map((entry) => entry.nom);

    buildColors();
    buildWheelLayers();
    updateCountInfo();
    drawWheel(angle);
    runIntroBuild();
    attachWheelListeners();
    scheduleDeferredInit();

    // 🔊 Préserve le déverrouillage audio mobile sans charger/décoder les sons.
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);

    console.log("[APP] Roue initialisée avec", ENTRIES.length, "entrées");
  } catch (e) {
    console.error("[APP] Erreur initialisation:", e);
    ENTRIES = ["Erreur de chargement", "Veuillez rafraîchir la page"];
    syncCanvasSize(true);
    buildWheelLayers();
    drawWheel(angle);
  }
}

/* =======================
   MISE À JOUR DES DONNÉES
   ======================= */
// entries.js sert le cache puis revalide contre le réseau ; quand la version
// des données a changé, il émet `entriesUpdated` et la roue se reconstruit.

function applyEntriesUpdate() {
  pendingEntriesRefresh = false;

  // Hors mode sans fin, les entrées déjà tirées ont été retirées de la roue :
  // tout reconstruire annulerait la partie en cours. La prochaine visite
  // prendra la mise à jour.
  if (completedSpinCount > 0 && !isInfiniteMode()) {
    console.log("[APP] Données mises à jour, reconstruction reportée à la prochaine visite");
    return;
  }

  initWheel()
    .then((lightData) => {
      ENTRIES = lightData.map((entry) => entry.nom);
      ENTRY_COLORS.length = 0;
      buildColors();
      buildWheelLayers();
      updateCountInfo();
      drawWheel(angle);
      console.log("[APP] Roue reconstruite avec", ENTRIES.length, "entrées");
    })
    .catch((error) => {
      console.warn("[APP] Reconstruction de la roue impossible:", error);
    });
}

window.addEventListener("entriesUpdated", (event) => {
  if (event.detail?.scope !== "light") return;

  // Ne jamais changer le contenu des secteurs pendant que la roue tourne :
  // le pointeur désignerait soudain autre chose.
  if (shouldAnimate()) {
    pendingEntriesRefresh = true;
    return;
  }

  applyEntriesUpdate();
});

/* =======================
   INTERACTION / BOOST
   ======================= */

function spawnBillsWhenReady(event, count) {
  if (billsModule && typeof billsModule.spawnBills === "function") {
    billsModule.spawnBills(event, count);
    return;
  }

  if (!billsInitPromise) {
    billsInitPromise = import("../bills.js")
      .then((mod) => {
        if (mod.initBills) {
          mod.initBills();
        }
        billsModule = mod;
        return true;
      })
      .catch((error) => {
        billsInitPromise = null;
        console.warn("[APP] Effet billets indisponible:", error);
        return false;
      });
  }

  billsInitPromise.then((ready) => {
    if (ready && billsModule && typeof billsModule.spawnBills === "function") {
      billsModule.spawnBills(event, count);
    }
  });
}

function boostWheel(e) {
  if (ENTRIES.length === 0) {
    console.warn("[BOOST] ENTRIES est vide !");
    return;
  }

  finishIntroBuild();
  completeCenterIntro();
  ensureAudioInitialized();
  scheduleFullDataLoad("premier boost");
  hasBeenSpun = true;

  // Les billets sont purement décoratifs : on ne les lance pas à qui demande
  // moins d'animation.
  if (!prefersReducedMotion()) {
    spawnBillsWhenReady(e, 8);
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
  clearTimeout(frictionResumeTimer);
  // En mouvement réduit, pas de sursis de 600 ms avant le freinage : la roue
  // ralentit immédiatement.
  frictionResumeTimer = setTimeout(
    () => {
      frictionActive = true;
    },
    prefersReducedMotion() ? 0 : 600
  );

  showedResult = false;
  resetSectorClick();
  lastTime = performance.now();
  scheduleAnimationFrame();
}

function attachWheelListeners() {
  if (canvas && btn) {
    canvas.addEventListener("pointerdown", boostWheel);
    btn.addEventListener("click", boostWheel);
  } else {
    console.error("[BOOST] canvas ou btn non trouvé !");
  }
}

/* =======================
   SON PAR PASSAGE DE SECTEUR
   ======================= */

// La roue compte plusieurs centaines de secteurs : à pleine vitesse elle en
// traverse plus de 2000 par seconde. Un clic par secteur réel est donc
// injouable (il sature en bourdonnement dès la première frame).
// On pilote à la place une CADENCE de clics dérivée de la vitesse : dense
// quand la roue est lancée, elle se raréfie d'elle-même jusqu'au dernier
// « tic » quand la roue s'immobilise.
//
// Réglable à chaud depuis la console via window.__SPIN_CLICK__ pendant un spin.
const SPIN_CLICK = {
  maxRate: 18, // clics/s à pleine vitesse (plafond anti-mitraillette)
  minRate: 0.8, // en dessous, on arrête de cliquer
  curve: 0.5, // <1 = garde des clics audibles à basse vitesse (0.5 = racine)
  volumeMin: 0.3, // volume du dernier clic (roue presque arrêtée)
  volumeMax: 0.55, // volume à pleine vitesse
  pitchMin: 0.95, // plage de hauteur VOLONTAIREMENT étroite :
  pitchMax: 1.2, // au-delà, on entend une sirène qui monte et descend
  pitchJitter: 0.04, // variation aléatoire, évite l'effet « boucle » mécanique
  clickDecay: 1.2 // longueur d'un clic = clickDecay / cadence (borné ci-dessous)
  // >1.5 : les clics se chevauchent et « bavent » ; <1 : très sec
};

const SPIN_CLICK_MAX_DURATION = 0.12; // s — coupe la queue du sample
const FRAME_SECONDS = 16.67 / 1000;

// Fraction de clic accumulée ; atteint 1 → on joue un clic.
let clickPhase = 0;

/** Réarme la cadence pour que le prochain mouvement claque immédiatement. */
function resetSectorClick() {
  clickPhase = 1;
}

/**
 * Fait avancer la cadence de clics.
 * @param {number} deltaFrames - Temps écoulé, en frames de 16.67 ms.
 */
function updateSectorClick(deltaFrames) {
  if (!audioReady || ENTRIES.length === 0) return;

  const speedRatio = Math.min(1, Math.abs(angularVelocity) / MAX_VEL);
  const eased = Math.pow(speedRatio, SPIN_CLICK.curve);
  const clickRate = SPIN_CLICK.maxRate * eased;

  if (clickRate < SPIN_CLICK.minRate) {
    // Roue à l'arrêt (ou presque) : on réarme sans jouer.
    clickPhase = Math.min(clickPhase, 1);
    return;
  }

  clickPhase += clickRate * deltaFrames * FRAME_SECONDS;
  if (clickPhase < 1) return;

  // Pas de rattrapage : si plusieurs clics étaient « dus » (onglet en arrière-plan,
  // frame longue), on n'en joue qu'un seul au lieu d'une rafale.
  clickPhase = 0;
  playSectorClick(eased, clickRate);
}

function playSectorClick(eased, clickRate) {
  const volume = SPIN_CLICK.volumeMin + (SPIN_CLICK.volumeMax - SPIN_CLICK.volumeMin) * eased;
  const jitter = 1 + (Math.random() * 2 - 1) * SPIN_CLICK.pitchJitter;
  const rate = (SPIN_CLICK.pitchMin + (SPIN_CLICK.pitchMax - SPIN_CLICK.pitchMin) * eased) * jitter;
  const maxDuration = Math.min(SPIN_CLICK_MAX_DURATION, SPIN_CLICK.clickDecay / clickRate);

  playSpinClick({ volume, rate, maxDuration });
}

if (typeof window !== "undefined") {
  window.__SPIN_CLICK__ = SPIN_CLICK;
}

/* =======================
   SELECTION / OVERLAY
   ======================= */
function getSelectedIndex(a) {
  const n = ENTRIES.length;
  if (n === 0) return -1;
  const step = (Math.PI * 2) / n;
  let theta = (-Math.PI / 2 - a) % (Math.PI * 2);
  if (theta < 0) theta += Math.PI * 2;
  return Math.floor(theta / step);
}

async function showOverlay(entryIndex) {
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
  const intro = intros[Math.floor(Math.random() * intros.length)];

  // Récupérer les détails complets de l'entrée
  const entry = await getEntryDetails(entryIndex);
  const formatted = formatEntryForDisplay(entry);

  // 💬 contenu principal du résultat
  overlayText.innerHTML = `
    ${intro}<br><br>${formatted}
    <div class="feedback-buttons">
      <button id="btn-info" type="button" class="btn btn-inverse btn-sm">Donner un complément d'information</button>
      <button id="btn-error" type="button" class="btn btn-inverse btn-sm">Signaler une erreur</button>
    </div>
  `;

  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");
  // .bubble porte tabindex="-1" : y placer le focus fait annoncer le dialogue
  // par les lecteurs d'écran et amorce le piège de focus.
  openModal(overlay, overlay.querySelector(".bubble"));
}

// 🧩 Attache les écouteurs de feedback UNE SEULE FOIS au démarrage.
// Délégué sur #overlayText (et non document) car .bubble stoppe la propagation des clics.
overlayText.addEventListener("click", (e) => {
  const infoBtn = e.target.closest("#btn-info");
  const errorBtn = e.target.closest("#btn-error");

  if (!infoBtn && !errorBtn) return;

  // On récupère le texte du résultat actuel dans l'overlay
  const feedbackText = overlayText.innerText.split("\n\n")[1] || overlayText.innerText;

  openFeedback(feedbackText, infoBtn ? "info" : "error");
});

// === Feedback modal ===
// Si le site n'est pas sur Netlify (ex. GitHub Pages), on cible directement le domaine
// Netlify du projet qui héberge la fonction serverless.
const isNetlifyHost = window.location.hostname.includes("netlify.app");
const FEEDBACK_ENDPOINT = isNetlifyHost
  ? "/.netlify/functions/sendFeedback"
  : "https://larouedelaservitude.netlify.app/.netlify/functions/sendFeedback";

const modal = requireElement("feedbackModal");
const form = requireElement("feedbackForm");
const closeBtn = requireElement("closeFeedback");
const status = requireElement("feedbackStatus");

// Limite anti-abus côté client : 1 envoi par minute max
let lastFeedbackTime = 0;

function openFeedback(resultText, type = "info") {
  requireElement("formResult").value = resultText;
  requireElement("formType").value = type;
  requireElement("formMessage").value = "";
  requireElement("honeypot").value = "";
  status.style.display = "none";
  modal.style.display = "flex";
  openModal(modal, requireElement("formMessage"));
}

function closeFeedback() {
  modal.style.display = "none";
  closeModal(modal);
}

closeBtn.addEventListener("click", closeFeedback);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeFeedback();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (modal.style.display === "flex") {
    closeFeedback();
  } else if (isOverlayOpen()) {
    hideResultOverlay();
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const now = Date.now();
  if (now - lastFeedbackTime < 60000) {
    status.style.display = "block";
    status.textContent = "Merci d’attendre une minute avant d’envoyer un nouveau message.";
    return;
  }

  status.style.display = "block";
  status.textContent = "Envoi en cours…";
  const payload = {
    resultText: requireElement("formResult").value,
    userMessage: requireElement("formMessage").value,
    type: requireElement("formType").value || "info",
    honeypot: requireElement("honeypot").value || ""
  };
  try {
    const resp = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      status.textContent = "Erreur lors de l’envoi : " + (text || resp.status);
      return;
    }

    lastFeedbackTime = now;
    const json = await resp.json().catch(() => ({}));
    status.textContent = "Merci — votre message a été envoyé !";
    if (json.url) {
      const ticketUrl = new URL(json.url, window.location.origin);
      const lineBreak = document.createElement("br");
      const link = document.createElement("a");
      link.href = ticketUrl.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Voir le ticket sur GitHub";
      status.append(lineBreak, link);
    }
    setTimeout(closeFeedback, 1500);
  } catch (err) {
    console.error(err);
    status.textContent = "Erreur réseau lors de l’envoi.";
  }
});

overlayClose.addEventListener("click", hideResultOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    hideResultOverlay();
  }
});
overlay.querySelector(".bubble").addEventListener("click", (e) => e.stopPropagation());
copyBtn &&
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(overlayText.innerText);
      copyBtn.textContent = "✅";
      setTimeout(() => (copyBtn.textContent = "📋"), 800);
    } catch {
      alert("Impossible de copier");
    }
  });

/* =======================
   ANIMATION
   ======================= */
function finalizeSpinResult(idx) {
  getEntryDetails(idx).then((entry) => {
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
      resetSectorClick();
    }

    drawWheel(angle);
    setTimeout(() => {
      hasBeenSpun = false;
    }, 300);
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
  animFrameId = null;

  const previousTime = lastTime || now;
  const deltaTime = Math.min(10, (now - previousTime) / 16.67);
  lastTime = now;

  angularVelocity += (targetVelocity - angularVelocity) * (LERP * deltaTime);
  angle += angularVelocity * deltaTime;

  updateSectorClick(deltaTime);

  if (targetVelocity > 0.001) {
    if (!frictionActive) {
      frictionActive = true;
      frictionTimer = 0;
      frictionDuration = 180 + Math.random() * 120;
      scheduleFullDataLoad("ralentissement");
    }
    const damping = prefersReducedMotion() ? REDUCED_MOTION_DAMPING : BASE_DAMPING;
    const t = frictionTimer / frictionDuration;
    if (t < 1) {
      targetVelocity *= Math.pow(damping - t * 0.03, deltaTime);
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

    if (pendingEntriesRefresh) {
      applyEntriesUpdate();
    }
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
    resetSectorClick();

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
        const optimized = canvas
          .toDataURL("image/webp", quality)
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

// Capture de la zone de roue, dessinée à la main.
//
// html2canvas était téléchargé depuis un CDN au premier partage : hors ligne —
// c'est-à-dire dans le cas d'usage que cette PWA revendique — il ne se
// chargeait pas et le partage échouait sans recours. Or la zone ne contient que
// trois choses : un fond, le canvas de la roue et le triangle du curseur. Les
// redessiner tient en quelques lignes, marche hors ligne, et supprime au
// passage 200 ko de dépendance tierce.
const CAPTURE_SCALE = 2;

// .pointer est un triangle CSS fait de bordures : son rectangle englobant donne
// directement la base et la hauteur à reproduire.
function fillPointer(ctx, rect, area, scale) {
  const left = (rect.left - area.left) * scale;
  const top = (rect.top - area.top) * scale;
  const width = rect.width * scale;
  const height = rect.height * scale;

  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + width, top);
  ctx.lineTo(left + width / 2, top + height);
  ctx.closePath();
  ctx.fill();
}

async function captureWheelArea() {
  const area = wheelArea.getBoundingClientRect();
  const output = document.createElement("canvas");
  output.width = Math.round(area.width * CAPTURE_SCALE);
  output.height = Math.round(area.height * CAPTURE_SCALE);

  const ctx = output.getContext("2d");
  const board = document.querySelector(".board") || document.body;

  // Le fond suit le thème : la capture était figée en clair, et le partage d'un
  // utilisateur en thème sombre sortait sur un fond qui n'était pas le sien.
  ctx.fillStyle = getComputedStyle(board).backgroundColor;
  ctx.fillRect(0, 0, output.width, output.height);

  const wheel = canvas.getBoundingClientRect();
  ctx.drawImage(
    canvas,
    (wheel.left - area.left) * CAPTURE_SCALE,
    (wheel.top - area.top) * CAPTURE_SCALE,
    wheel.width * CAPTURE_SCALE,
    wheel.height * CAPTURE_SCALE
  );

  const pointer = wheelArea.querySelector(".pointer");
  if (pointer) {
    ctx.fillStyle = getComputedStyle(pointer).borderTopColor;
    fillPointer(ctx, pointer.getBoundingClientRect(), area, CAPTURE_SCALE);
  }

  return output;
}

/* =======================
   PARTAGE / CAPTURE amélioré
   ======================= */

// L'attente est signalée par une classe (.is-busy, buttons.css) et non par un
// style inline : l'apparence reste dans la feuille de style, et un seul appel
// suffit à revenir à l'état initial — d'où le `finally` plus bas.
function setShareButtonBusy(button) {
  button.disabled = true;
  button.classList.add("is-busy");
  button.dataset.restoreLabel = button.textContent;
  button.textContent = "⏳";
}

function clearShareButtonBusy(button) {
  if (!("restoreLabel" in button.dataset)) return;
  button.disabled = false;
  button.classList.remove("is-busy");
  button.textContent = button.dataset.restoreLabel;
  delete button.dataset.restoreLabel;
}

shareButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const platform = btn.dataset.platform;
    const text = overlayText.innerText;

    // CAS SPÉCIAUX : Téléchargement direct (Instagram, TikTok, Snapchat)
    if (["instagram", "tiktok", "snapchat"].includes(platform)) {
      try {
        const canvasCap = await captureWheelArea();

        const rawBase64 = canvasCap.toDataURL("image/png");

        // On passe à 800px de large max et qualité 0.6 (suffisant pour Twitter/FB)
        // Cela peut diviser le poids du fichier par 4 ou 5.
        const optimizedBase64 = await optimizeImageWebP(rawBase64, 800, 0.6);

        const imageData = "data:image/webp;base64," + optimizedBase64;
        const a = document.createElement("a");
        a.href = imageData;
        a.download = `roue-${platform}-${Date.now()}.webp`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        alert(
          `✅ Image téléchargée !\n\n📱 Ouvrez ${platform.toUpperCase()} et publiez l'image depuis votre galerie.`
        );
      } catch (error) {
        console.error("Erreur téléchargement:", error);
        alert("❌ Erreur lors du téléchargement de l'image.");
      }
      return;
    }

    // AUTRES PLATEFORMES : Netlify Function
    try {
      setShareButtonBusy(btn);

      const canvasCap = await captureWheelArea();

      const rawBase64 = canvasCap.toDataURL("image/png");
      const optimizedBase64 = await optimizeImageWebP(rawBase64, 1200, 0.85);

      const SHARE_IMAGE_URL = window.location.hostname.includes("netlify.app")
        ? "/.netlify/functions/shareImage"
        : "https://larouedelaservitude.netlify.app/.netlify/functions/shareImage";

      const response = await fetch(SHARE_IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: optimizedBase64,
          text: text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur serveur");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload échoué");
      }

      const { imageUrl, sharePageUrl } = result;

      const msg = encodeURIComponent(text);
      const siteUrl = window.location.origin + window.location.pathname;
      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`;
          break;
        case "x":
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(text.split("\n")[0])}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl)}`;
          break;
        case "pinterest":
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(siteUrl)}&media=${encodeURIComponent(imageUrl)}&description=${msg}`;
          break;
        case "whatsapp":
          shareUrl = `https://api.whatsapp.com/send?text=${msg}%0A%0A${encodeURIComponent(imageUrl)}`;
          break;
        case "telegram":
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${msg}`;
          break;
        default:
          alert("Plateforme non supportée");
          return;
      }

      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("❌ Erreur lors du partage:", error);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      clearShareButtonBusy(btn);
    }
  });
});

/* =======================
   INIT
   ======================= */
function updateBg() {
  const d = Math.sqrt(innerWidth ** 2 + innerHeight ** 2);
  document.documentElement.style.setProperty("--bg-size", `${Math.ceil(d * 1.2)}px`);
  const base = Math.max(36, Math.min(Math.round(innerWidth / 12), 160));
  document.documentElement.style.setProperty("--emoji-size", `${base}px`);
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

addEventListener("resize", scheduleResizeRecalculation);
addEventListener("orientationchange", scheduleResizeRecalculation);
updateBg();
initializeApp();

// Vrai dès qu'une surface recouvre la roue : résultat, formulaire, menu ou
// panneau. Toutes passent par le piège à focus, donc une seule question suffit —
// avant, la touche Espace et canReloadForUpdate répétaient chacune la liste des
// sélecteurs du menu, et l'oubli d'un cas passait inaperçu.
function isAnySurfaceOpen() {
  return hasFocusTrap() || isOverlayOpen();
}

// ✅ Gère la touche Espace uniquement quand aucune fenêtre n'est ouverte
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;

  // Espace appartient d'abord au contrôle qui a le focus : il doit l'activer
  // normalement (bouton, interrupteur des réglages, champ de saisie). Sans cette
  // sortie, le preventDefault ci-dessous annulait cette activation native et les
  // contrôles devenaient inutilisables au clavier.
  if (e.target instanceof Element && e.target.closest("button, a, input, textarea, select")) {
    return;
  }

  // La roue n'est pilotée qu'ici : on neutralise le défilement par Espace.
  e.preventDefault();

  if (!isAnySurfaceOpen()) {
    boostWheel();
  }
});

window.addEventListener("infiniteModeChange", () => {
  updateCountInfo();
});

/* =======================
   SERVICE WORKER
   ======================= */

// Un rechargement automatique ne doit jamais interrompre l'utilisateur : ni
// pendant une rotation, ni fenêtre ouverte, ni une fois la partie commencée
// (hors mode sans fin, les entrées tirées ont été retirées de la roue et
// seraient restaurées par le rechargement). Tant que cette fonction renvoie
// false, l'ancienne version continue d'être servie *entièrement* : aucun
// mélange de générations n'est possible pendant l'attente.
function canReloadForUpdate() {
  if (shouldAnimate()) return false;
  if (isAnySurfaceOpen()) return false;
  if (completedSpinCount > 0 && !isInfiniteMode()) return false;
  return true;
}

// Enregistrement après `load` pour ne pas disputer la bande passante au premier
// affichage : le pré-cache complet de la PWA démarre juste après.
window.addEventListener("load", () => {
  initServiceWorker({ canReload: canReloadForUpdate });
});

// L'effet billets est chargé à la première utilisation pour alléger le démarrage.
