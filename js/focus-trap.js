// ===============================
// focus-trap.js — Piège à focus partagé
// ===============================
//
// Toute surface qui recouvre la page (modale, tiroir de menu, panneau) doit
// retenir le focus tant qu'elle est ouverte, puis le rendre à son point de
// départ. app.js le faisait pour ses deux modales, le menu ne le faisait pas du
// tout : ses contrôles restaient atteignables au clavier une fois refermé.
//
// Les surfaces s'empilent — le tiroir, puis le panneau ouvert par-dessus — d'où
// une pile plutôt qu'une seule surface active. Seul le sommet retient le focus,
// et fermer une surface ferme aussi tout ce qu'elle portait.

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

// { container, restoreTo } — restoreTo est l'élément qui avait le focus avant
// l'ouverture de cette surface.
const stack = [];

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetWidth > 0 || element.offsetHeight > 0
  );
}

function focusIfPossible(element) {
  if (element && typeof element.focus === "function" && document.contains(element)) {
    element.focus();
    return true;
  }
  return false;
}

// Ouvre une surface : mémorise d'où vient le focus et l'amène dedans.
//
// L'appelant vient de révéler la surface (une classe ajoutée). Lire une
// propriété de mise en page force le recalcul du style avant de déplacer le
// focus : sans cela, `focus()` s'applique à un sous-arbre encore
// `visibility: hidden` et est ignoré en silence.
export function pushFocusTrap(container, { initialFocus } = {}) {
  stack.push({ container, restoreTo: document.activeElement });

  void container.offsetHeight;
  focusIfPossible(initialFocus || getFocusableElements(container)[0] || container);
}

// Ferme une surface, ainsi que toutes celles empilées au-dessus, et rend le
// focus à l'élément qui l'avait avant son ouverture.
export function popFocusTrap(container) {
  const index = stack.findIndex((entry) => entry.container === container);
  if (index === -1) return;

  const [entry] = stack.splice(index, stack.length - index);
  focusIfPossible(entry.restoreTo);
}

// Vrai dès qu'une surface est ouverte : sert à savoir si l'utilisateur est
// occupé (bascule de version, raccourcis clavier globaux).
export function hasFocusTrap() {
  return stack.length > 0;
}

// La surface qui est au-dessus, ou null. Permet à un gestionnaire d'Échap de
// ne fermer que ce que l'utilisateur voit au premier plan.
export function topFocusTrap() {
  return stack.length ? stack[stack.length - 1].container : null;
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || stack.length === 0) return;

  const { container } = stack[stack.length - 1];
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!container.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
