// ===============================
//  constants.js — Constantes partagées
// ===============================

// Clé localStorage des réglages utilisateur.
export const SETTINGS_KEY = "larouedelaservitude_settings";

// Version de la génération de fichiers à laquelle appartient ce code.
// ⚠️ Doit rester identique à CACHE_VERSION dans service-worker.js : c'est la
// comparaison des deux qui permet de détecter qu'une page tourne avec du code
// d'une autre génération que celle servie par le service worker
// (voir js/sw-update.js). L'égalité est vérifiée par `npm run check:precache`.
export const APP_VERSION = "v21";

// Chemin de base de l'application (gère le déploiement en sous-dossier,
// ex. GitHub Pages, et l'accès direct à /index.html).
export const BASE_PATH = window.location.pathname.endsWith("/")
  ? window.location.pathname.slice(0, -1)
  : window.location.pathname.replace(/\/index\.html$/, "");
