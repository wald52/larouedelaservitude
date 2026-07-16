// ===============================
//  constants.js — Constantes partagées
// ===============================

// Clé localStorage des réglages utilisateur.
export const SETTINGS_KEY = "larouedelaservitude_settings";

// Chemin de base de l'application (gère le déploiement en sous-dossier,
// ex. GitHub Pages, et l'accès direct à /index.html).
export const BASE_PATH = window.location.pathname.endsWith("/")
  ? window.location.pathname.slice(0, -1)
  : window.location.pathname.replace(/\/index\.html$/, "");
