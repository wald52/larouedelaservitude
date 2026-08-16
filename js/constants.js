// ===============================
//  constants.js — Constantes partagées
// ===============================

// Clé localStorage des réglages utilisateur.
export const SETTINGS_KEY = "larouedelaservitude_settings";

// Clé sessionStorage de la partie en cours (voir js/game.js).
export const GAME_KEY = "larouedelaservitude_game";

// Chemin de base de l'application (gère le déploiement en sous-dossier,
// ex. GitHub Pages).
//
// Il est déduit de l'URL de ce module (`<base>/js/constants.js`) et non de
// celle de la page : celle-ci est servie aussi bien avec que sans son extension
// selon l'hébergeur, et porte en outre une chaîne de requête (la vue ouverte,
// les filtres). Partir de la page obligerait à connaître toutes ces formes ;
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
