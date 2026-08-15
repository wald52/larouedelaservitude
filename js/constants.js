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
export const APP_VERSION = "v36";

// Chemin de base de l'application (gère le déploiement en sous-dossier,
// ex. GitHub Pages).
//
// Il est déduit de l'URL de ce module (`<base>/js/constants.js`) et non de
// celle de la page : l'application compte deux documents (index.html et
// donnees.html), servis en outre aussi bien avec que sans extension selon
// l'hébergeur. Partir de la page obligerait à connaître toutes ces formes ;
// partir du module donne la racine du site à coup sûr.
function resolveBasePath() {
  const modulePath = new URL(import.meta.url).pathname;
  if (modulePath.endsWith("/js/constants.js")) {
    return modulePath.slice(0, -"/js/constants.js".length);
  }

  // Repli (module déplacé ou renommé) : on retombe sur le chemin de la page.
  const pagePath = window.location.pathname;
  return pagePath.endsWith("/") ? pagePath.slice(0, -1) : pagePath.replace(/\/[^/]*\.html$/, "");
}

export const BASE_PATH = resolveBasePath();
