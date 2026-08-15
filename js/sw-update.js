// ===============================
//  sw-update.js — Service worker : enregistrement et bascule de version
// ===============================
// Objectif : l'utilisateur voit toujours la dernière version publiée, sans
// jamais se retrouver avec un mélange de fichiers de deux générations.
//
// Comment :
// 1. `updateViaCache: 'none'` + `registration.update()` à chaque chargement (et
//    à chaque retour sur l'onglet) : le script du service worker n'est jamais
//    lu depuis le cache HTTP du navigateur, donc pas d'attente de 24 h.
// 2. Le nouveau service worker pré-cache toute sa génération puis attend. Tant
//    qu'il attend, l'ancien continue de servir sa propre génération, entière.
// 3. Dès que la page peut se recharger sans gêner l'utilisateur (`canReload`),
//    on envoie SKIP_WAITING puis on recharge à `controllerchange`. La page
//    repart alors intégralement sur la nouvelle génération.
// 4. Une bascule refusée n'est jamais perdue : `applyPendingUpdate()` la
//    reprend dès que l'application redevient calme (fin d'animation, fermeture
//    de la carte, retour sur l'onglet, retour du réseau). Sans ce rattrapage,
//    une mise à jour prête pendant l'animation d'ouverture — 650 ms où
//    `canReload` répond non — restait en attente pour toute la visite : c'est
//    ce qui obligeait à vider le cache pour voir la dernière version.
// 5. Filet de sécurité : APP_VERSION (ce code) est comparée à CACHE_VERSION (le
//    service worker qui contrôle la page). Un écart signifie qu'on tourne avec
//    du code d'une autre génération — on se réaligne immédiatement.

import { APP_VERSION } from "./constants.js";

const SW_URL = "service-worker.js";

// Empêche une boucle de rechargement si le serveur sert durablement des
// fichiers incohérents : deux rechargements rapprochés = on s'arrête.
const RELOAD_GUARD_KEY = "larouedelaservitude_sw_reload";
const RELOAD_COOLDOWN_MS = 10000;

// Les vérifications de mise à jour sont peu coûteuses mais inutiles en rafale.
const UPDATE_CHECK_THROTTLE_MS = 30000;

const VERSION_REQUEST_TIMEOUT_MS = 3000;

let registrationRef = null;
let canReload = () => true;
let beforeReload = () => {};
let hadControllerAtStartup = false;
let reloadRequested = false;
let updatePending = false;
let lastUpdateCheck = 0;

// ===============================
//  Rechargement
// ===============================

function readReloadGuard() {
  try {
    return Number(sessionStorage.getItem(RELOAD_GUARD_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeReloadGuard(value) {
  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(value));
  } catch {
    // Navigation privée : on se passe du garde-fou.
  }
}

function reloadOnce(reason) {
  if (reloadRequested) return;

  const now = Date.now();
  if (now - readReloadGuard() < RELOAD_COOLDOWN_MS) {
    console.warn(
      "[SW] Rechargement déjà tenté il y a moins de 10 s : on s'arrête pour éviter une boucle."
    );
    return;
  }

  reloadRequested = true;
  writeReloadGuard(now);

  // Dernière occasion pour la page de mettre de côté ce qui doit survivre à la
  // bascule (la partie en cours, côté js/app.js). Une erreur ici ne doit pas
  // empêcher la mise à jour : c'est elle qu'on est venu appliquer.
  try {
    beforeReload();
  } catch (error) {
    console.warn("[SW] Sauvegarde avant rechargement impossible :", error);
  }

  console.log("[SW] Rechargement pour appliquer la nouvelle version :", reason);
  window.location.reload();
}

// ===============================
//  Bascule vers la version en attente
// ===============================

// Une bascule différée se reprend d'elle-même. Les moments calmes de
// l'application sont trop nombreux pour être tous guettés un par un — et c'est
// bien l'oubli de l'un d'eux (la fin de l'animation d'ouverture) qui laissait
// une mise à jour prête en plan jusqu'à la fin de la visite. Plutôt que
// d'allonger la liste des points d'appel, l'attente se surveille elle-même :
// tant qu'une version attend, on retente ; dès qu'elle est appliquée, on
// s'arrête. Deux secondes : assez pour paraître immédiat, assez peu pour ne
// rien coûter.
const PENDING_RETRY_MS = 2000;
let pendingRetryTimer = 0;

function schedulePendingRetry() {
  if (pendingRetryTimer) return;

  pendingRetryTimer = setInterval(() => {
    if (!updatePending) {
      stopPendingRetry();
      return;
    }
    applyPendingUpdate();
  }, PENDING_RETRY_MS);
}

function stopPendingRetry() {
  if (!pendingRetryTimer) return;
  clearInterval(pendingRetryTimer);
  pendingRetryTimer = 0;
}

function activateWaitingWorker(worker) {
  if (!worker) return;

  if (!canReload()) {
    if (!updatePending) {
      console.log("[SW] Nouvelle version prête : application différée (utilisation en cours)");
    }
    updatePending = true;
    schedulePendingRetry();
    return;
  }

  updatePending = false;
  stopPendingRetry();
  console.log("[SW] Nouvelle version prête : bascule immédiate");
  worker.postMessage({ type: "SKIP_WAITING" });
}

/**
 * Applique une mise à jour mise de côté parce que l'utilisateur était occupé.
 * Appelée par js/app.js quand l'application redevient inactive.
 */
export function applyPendingUpdate() {
  if (!updatePending) return;
  if (registrationRef?.waiting) {
    activateWaitingWorker(registrationRef.waiting);
    return;
  }
  // Plus de worker en attente : c'est peut-être un décalage de version détecté
  // plus tôt et resté sans réponse.
  if (canReload()) {
    updatePending = false;
    stopPendingRetry();
    reloadOnce("mise à jour différée");
  }
}

function trackInstallingWorker(worker) {
  if (!worker) return;

  worker.addEventListener("statechange", () => {
    // `controller` non nul = il y avait déjà une version en place : c'est une
    // mise à jour, pas une première installation.
    if (worker.state === "installed" && navigator.serviceWorker.controller) {
      activateWaitingWorker(worker);
    }
  });
}

// ===============================
//  Vérification de mise à jour
// ===============================

async function checkForUpdate(force = false) {
  if (!registrationRef) return;

  const now = Date.now();
  if (!force && now - lastUpdateCheck < UPDATE_CHECK_THROTTLE_MS) return;
  lastUpdateCheck = now;

  try {
    await registrationRef.update();
  } catch (error) {
    // Hors ligne, typiquement : la version en cache reste parfaitement valable.
    console.warn("[SW] Vérification de mise à jour impossible :", error);
  }
}

// ===============================
//  Détection d'un décalage de version
// ===============================

function askWorkerVersion(worker) {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(null), VERSION_REQUEST_TIMEOUT_MS);

    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      resolve(event.data?.version ?? null);
    };

    try {
      worker.postMessage({ type: "GET_VERSION" }, [channel.port2]);
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

// Le code de cette page et le cache qui la sert doivent appartenir à la même
// génération. Si ce n'est pas le cas (onglet restauré, mise à jour appliquée
// par un autre onglet, cache HTTP capricieux), on se réaligne.
async function verifyVersionMatch() {
  const controller = navigator.serviceWorker.controller;
  if (!controller) return;

  const swVersion = await askWorkerVersion(controller);
  if (!swVersion || swVersion === APP_VERSION) return;

  console.warn(`[SW] Décalage de version : page ${APP_VERSION}, service worker ${swVersion}`);

  await checkForUpdate(true);

  if (registrationRef?.waiting) {
    activateWaitingWorker(registrationRef.waiting);
    return;
  }

  if (canReload()) {
    reloadOnce("code et cache désynchronisés");
  } else {
    updatePending = true;
    schedulePendingRetry();
  }
}

// ===============================
//  Point d'entrée
// ===============================

/**
 * Enregistre le service worker et pilote les bascules de version.
 * @param {{canReload?: () => boolean, beforeReload?: () => void}} [options]
 *   `canReload` doit renvoyer false tant qu'un rechargement gênerait
 *   l'utilisateur (roue en rotation, fenêtre ouverte, résultat à l'écran) ;
 *   `beforeReload` est appelée juste avant le rechargement, pour mettre de côté
 *   ce qui doit lui survivre.
 */
export function initServiceWorker(options = {}) {
  if (!("serviceWorker" in navigator)) return;

  if (typeof options.canReload === "function") {
    canReload = options.canReload;
  }

  if (typeof options.beforeReload === "function") {
    beforeReload = options.beforeReload;
  }

  hadControllerAtStartup = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // Première installation : le SW prend le contrôle d'une page qui vient
    // d'être chargée depuis le réseau, tout est déjà cohérent.
    if (!hadControllerAtStartup) {
      console.log("[SW] Prise de contrôle initiale (aucun rechargement nécessaire)");
      hadControllerAtStartup = true;
      return;
    }
    reloadOnce("nouveau service worker actif");
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SW_UPDATED") {
      console.log("[SW] Version active :", event.data.version);
    }
  });

  navigator.serviceWorker
    .register(SW_URL, { updateViaCache: "none" })
    .then((registration) => {
      registrationRef = registration;
      console.log("[SW] Enregistré :", registration.scope, "- version du code :", APP_VERSION);

      // Une version peut déjà attendre depuis la visite précédente.
      if (registration.waiting && navigator.serviceWorker.controller) {
        activateWaitingWorker(registration.waiting);
      }

      trackInstallingWorker(registration.installing);

      registration.addEventListener("updatefound", () => {
        console.log("[SW] Nouvelle version en installation...");
        trackInstallingWorker(registration.installing);
      });

      // Vérification immédiate : c'est ce qui évite d'attendre 24 h ou de
      // recharger plusieurs fois pour obtenir la dernière version.
      checkForUpdate(true);
      verifyVersionMatch();
    })
    .catch((error) => {
      console.error("[SW] Échec de l'enregistrement :", error);
    });

  // Retour sur l'onglet / retour du réseau : nouvelle chance d'être à jour.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    checkForUpdate();
    applyPendingUpdate();
  });

  // Retour du réseau — le cas de l'atterrissage : on va chercher la version
  // publiée, et on applique aussitôt celle qui attendait peut-être déjà.
  window.addEventListener("online", () => {
    checkForUpdate(true);
    applyPendingUpdate();
  });
}
