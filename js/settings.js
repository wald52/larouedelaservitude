// ===============================
//  settings.js — Lecture des réglages utilisateur
// ===============================

import { SETTINGS_KEY } from "./constants.js?v=b8755637";

// Détermine si le son est activé. La source de vérité est l'attribut
// data-sound-enabled sur <html> (posé par le menu), avec repli sur le
// localStorage. Par défaut : activé.
export function isSoundEnabled() {
  try {
    const attr = document.documentElement?.getAttribute("data-sound-enabled");
    if (attr === "true") return true;
    if (attr === "false") return false;

    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return true;

    const parsed = JSON.parse(stored);
    return parsed.soundEnabled !== false;
  } catch (e) {
    console.warn("[SETTINGS] Impossible de lire le réglage son:", e);
    return true;
  }
}
