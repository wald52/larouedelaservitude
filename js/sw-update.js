// ===============================
//  sw-update.js — Service worker : enregistrement et fraîcheur
// ===============================
// Objectif : le visiteur voit toujours la dernière version publiée dès qu'il
// recharge la page — et jamais autrement. Aucun rechargement n'est provoqué ici.
//
// Ce module ne pilote plus de bascule de version, parce qu'il n'y a plus de
// bascule à piloter. La cohérence d'une page ne vient plus d'un accord entre la
// page et le service worker, elle vient des URLs : le code et les styles sont
// estampillés d'un hachage de contenu, si bien qu'un HTML de la génération N ne
// peut demander que des fichiers N (voir l'en-tête de service-worker.js). Une
// page rechargée en ligne reçoit le dernier HTML, donc la dernière génération,
// en un seul chargement.
//
// Il reste donc trois choses à faire :
//   1. enregistrer le service worker, avec `updateViaCache: 'none'` pour que son
//      script ne soit jamais relu depuis le cache HTTP — sans quoi le navigateur
//      pourrait ignorer une nouvelle génération pendant 24 h ;
//   2. redemander au navigateur de vérifier les mises à jour aux moments utiles
//      (chargement, retour sur l'onglet, retour du réseau). Le nouveau service
//      worker précache alors sa génération en arrière-plan : l'instantané hors
//      ligne est prêt d'avance, et le prochain rechargement volontaire du
//      visiteur tombe sur une version déjà téléchargée ;
//   3. donner à la page la version qui la sert, pour l'afficher dans Réglages.

const SW_URL = "service-worker.js";

// Les vérifications de mise à jour sont peu coûteuses mais inutiles en rafale.
const UPDATE_CHECK_THROTTLE_MS = 30000;

const VERSION_REQUEST_TIMEOUT_MS = 3000;

let registrationRef = null;
let lastUpdateCheck = 0;

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
    // Hors ligne, typiquement : la génération en cache reste parfaitement
    // valable, c'est tout l'intérêt.
    console.warn("[SW] Vérification de mise à jour impossible :", error);
  }
}

// ===============================
//  Version servie
// ===============================

/**
 * Demande au service worker qui contrôle la page le nom de sa génération.
 * @returns {Promise<string|null>} null si aucun service worker ne contrôle
 *   encore la page (toute première visite) ou s'il ne répond pas.
 */
export function getServedVersion() {
  return new Promise((resolve) => {
    const controller = navigator.serviceWorker?.controller;
    if (!controller) return resolve(null);

    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(null), VERSION_REQUEST_TIMEOUT_MS);

    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      resolve(event.data?.version ?? null);
    };

    try {
      controller.postMessage({ type: "GET_VERSION" }, [channel.port2]);
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

// ===============================
//  Point d'entrée
// ===============================

/**
 * Enregistre le service worker et entretient sa fraîcheur.
 * Ne recharge jamais la page : c'est au visiteur de le faire.
 */
export function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .register(SW_URL, { updateViaCache: "none" })
    .then((registration) => {
      registrationRef = registration;
      console.log("[SW] Enregistré :", registration.scope);

      // Vérification immédiate : la génération suivante se précache pendant que
      // le visiteur lit celle-ci, et sera déjà là quand il rechargera.
      checkForUpdate(true);
    })
    .catch((error) => {
      console.error("[SW] Échec de l'enregistrement :", error);
    });

  // Retour sur l'onglet / retour du réseau : nouvelle occasion de préparer la
  // génération suivante. Toujours sans rien imposer à la page en cours.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkForUpdate();
  });

  window.addEventListener("online", () => {
    checkForUpdate(true);
  });
}
