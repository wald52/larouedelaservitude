// ===============================
//  game.js — La partie en cours
// ===============================
//
// Hors mode sans fin, une taxe tirée quitte la roue : la partie se résume donc
// à la liste des identifiants déjà sortis. Elle ne vivait que dans les
// variables de js/app.js, et disparaissait donc à chaque rechargement — or
// recharger est précisément ce qu'on demande au visiteur pour recevoir une
// nouvelle version (§7 du guide) : la mise à jour lui coûtait sa partie.
//
// `sessionStorage` et non `localStorage` : la partie appartient à l'onglet où
// elle se joue. Elle survit à un rechargement, et ne ressort pas d'elle-même
// une semaine plus tard, quand plus personne ne comprendrait pourquoi il
// manque des taxes sur la roue.
//
// Ce module est le seul à écrire cette clé : js/app.js y ajoute les tirages,
// js/menu.js l'efface (« Nouvelle partie » et « Réinitialiser l'application »).
// Aucun accès au DOM ici : c'est de l'état, rien d'autre.

import { GAME_KEY } from "./constants.js?v=b8755637";

export function loadDrawnIds() {
  try {
    const stored = sessionStorage.getItem(GAME_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("[GAME] Partie en cours illisible:", e);
    return [];
  }
}

export function saveDrawnIds(ids) {
  try {
    sessionStorage.setItem(GAME_KEY, JSON.stringify(ids));
  } catch (e) {
    // Stockage indisponible (navigation privée) ou plein : la partie ne
    // survivra pas au changement de page, mais le tour en cours n'est pas
    // affecté. Rien à signaler à l'utilisateur.
    console.warn("[GAME] Partie non enregistrée:", e);
  }
}

export function clearDrawnIds() {
  try {
    sessionStorage.removeItem(GAME_KEY);
  } catch (e) {
    console.warn("[GAME] Effacement de la partie impossible:", e);
  }
}
