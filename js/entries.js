// ===============================
//  entries.js — Liste centralisée
// ===============================

// 🎡 Cette liste contient les entrées affichées sur la roue.
// Chaque entrée possède un texte et une couleur stable.
// Le format garantit que la roue reste identique même si elle perd des cases.

// ⚠️ IMPORTANT :
// Si tu veux supprimer ou ajouter des entrées,
// fais-le ici et uniquement ici.
// Le reste du code va automatiquement s’adapter.

export const ENTRIES = [
  { text: "RSA", color: "#ff7675" },
  { text: "CAF", color: "#74b9ff" },
  { text: "Aide médicale", color: "#55efc4" },
  { text: "APL", color: "#ffeaa7" },
  { text: "ARE", color: "#fab1a0" },
  { text: "AAH", color: "#fd79a8" },
  { text: "Prime activité", color: "#a29bfe" },
  { text: "Minima sociaux", color: "#81ecec" },
  { text: "Pension retr.", color: "#e17055" },
  { text: "Aide logement", color: "#00cec9" },
  { text: "Bourse étude", color: "#6c5ce7" },
  { text: "Aide enfant", color: "#fdcb6e" },
];

// Fonction utilitaire pour récupérer la liste complète.
// (Utile si un jour tu veux faire des variantes.)
export function getEntries() {
  return ENTRIES;
}
