// bills.js — effet billets (option C)
// Usage: spawnBills(eventOrCoords, count)
// eventOrCoords can be an Event (mousedown/touchstart) or {x:.., y:..}

// Import du module audio pour le son offline-first
import { isSoundEnabled } from "./js/settings.js";
import { BASE_PATH } from "./js/constants.js";

// Chemin du son de repli. Il était écrit en dur avec le sous-dossier de GitHub
// Pages (« /larouedelaservitude/audio/… ») : sur Netlify comme en local, chaque
// tour de roue lançait huit requêtes en 404 et le son ne jouait pas. BASE_PATH
// est déduit de l'emplacement réel des modules et vaut pour les deux cibles.
const BILL_SOUND_URL = `${BASE_PATH}/audio/frottement-papier2.mp3`;

let playBillAudio = null;

// API de l'effet, assignée par l'IIFE ci-dessous et exposée via export ESM.
export let spawnBills = null;
export let clearBills = null;

// Fonction d'initialisation (appelée par index.html)
export function initBills() {
  // Import dynamique du module audio
  import("./js/audio.js")
    .then(({ playBillSound }) => {
      playBillAudio = playBillSound;
      console.log("[BILLS] Module audio chargé pour les sons de billets");
    })
    .catch(() => {
      console.warn("[BILLS] Module audio non disponible, fallback vers Audio()");
      // Fallback vers l'ancienne méthode
      const fallbackSound = new Audio(BILL_SOUND_URL);
      fallbackSound.volume = 1;
      fallbackSound.preload = "auto";

      playBillAudio = (delay) => {
        setTimeout(() => {
          if (!isSoundEnabled()) return;
          const snd = fallbackSound.cloneNode(true);
          snd.playbackRate = 1.35 + Math.random() * 0.2;
          snd.play().catch(() => {});
        }, delay);
      };
    });
}

(() => {
  const MAX_BILLS = 64; // max éléments en DOM
  const GRAVITY = 0.4; // gravité en px/frame² (~1440 px/s² à 60fps)
  const TERMINAL_VY = 5.2; // vitesse de chute max en px/frame (le papier plane)
  const TERMINAL_EASE = 0.08; // douceur d'arrivée à la vitesse terminale
  const AIR_X = 0.965; // freinage horizontal (l'éjection s'amortit vite)
  const AIR_Y = 0.995; // freinage vertical (léger, la terminale fait le reste)
  const LIFETIME = 10000; // durée avant fade
  const SIZE_BASE = 24; // taille de base emoji
  const OUTER_FORCE = 7.5; // force initiale d'éjection
  const UP_FORCE = 8.5; // impulsion vers le haut (base)
  const UP_FORCE_VAR = 5; // variation aléatoire de l'impulsion
  const ROT_SPIN = 1.8; // degrés/frame max de rotation propre
  const ROT_SWAY = 1.6; // degrés/frame d'oscillation liée au flottement

  let recentSounds = 0;
  const MAX_SOUNDS_PER_SEC = 10;

  setInterval(() => {
    recentSounds = 0;
  }, 1000);

  function playBillSound(i) {
    if (!isSoundEnabled()) return;
    if (recentSounds >= MAX_SOUNDS_PER_SEC) return;
    recentSounds++;

    const delay = i * 40;

    // Utiliser le module audio si disponible, sinon fallback
    if (playBillAudio) {
      playBillAudio(delay);
    } else {
      // Fallback immédiat si pas encore initialisé
      setTimeout(() => {
        if (!isSoundEnabled()) return;
        const snd = new Audio(BILL_SOUND_URL);
        snd.volume = 0.5;
        snd.playbackRate = 1.35 + Math.random() * 0.2;
        snd.play().catch(() => {});
      }, delay);
    }
  }

  /* ======================================================= */

  const pool = [];
  const active = new Set();
  const doc = document;
  const root = doc.body;

  // crée le pool
  for (let i = 0; i < MAX_BILLS; i++) {
    const el = doc.createElement("div");
    el.className = "bill";
    el.textContent = "💶";
    el.style.left = "0";
    el.style.top = "0";
    el.style.opacity = "0";
    root.appendChild(el);
    pool.push({
      el,
      inUse: false,
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      born: 0,
      ttl: 0,
      lastFrame: 0,
      gravity: GRAVITY,
      terminal: TERMINAL_VY,
      swayAmp: 0,
      swayFreq: 0,
      swayPhase: 0
    });
  }

  function getOne() {
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].inUse) return pool[i];
    }
    return null;
  }

  // spawn en cercle autour du point (option C: ejection circulaire)
  spawnBills = function (ev, count = 12) {
    let x = window.innerWidth / 2,
      y = window.innerHeight / 2;

    if (ev) {
      if (ev.touches && ev.touches[0]) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
      } else if (ev.clientX !== undefined) {
        x = ev.clientX;
        y = ev.clientY;
      } else if (ev.x !== undefined && ev.y !== undefined) {
        x = ev.x;
        y = ev.y;
      }
    }

    const angleStep = (Math.PI * 2) / Math.max(1, count);
    const now = performance.now();

    for (let i = 0; i < count; i++) {
      const node = getOne();
      if (!node) break;
      node.inUse = true;

      // place un peu décalé pour ne pas coller
      const ox = Math.cos(i * angleStep) * (6 + Math.random() * 20);
      const oy = Math.sin(i * angleStep) * (6 + Math.random() * 10);
      node.x = x + ox;
      node.y = y + oy;

      // taille aléatoire
      const scale = 0.8 + Math.random() * 1.6;
      node.el.style.fontSize = Math.round(SIZE_BASE * scale) + "px";

      // vecteur initial : éjection en cercle + légère impulsion vers le haut
      const dir = i * angleStep + (Math.random() - 0.5) * (angleStep * 0.4);
      const spread = 0.6 + Math.random() * 0.9;
      const speed = OUTER_FORCE * (0.6 + Math.random() * 0.9) * spread;
      node.vx = Math.cos(dir) * speed + (Math.random() - 0.5) * 1.2;
      node.vy = Math.sin(dir) * speed * 0.45 - (UP_FORCE + Math.random() * UP_FORCE_VAR); // upward toss

      // variation par billet : chaque papier ne tombe pas exactement pareil
      node.gravity = GRAVITY * (0.85 + Math.random() * 0.3);
      node.terminal = TERMINAL_VY * (0.8 + Math.random() * 0.45);

      // flottement latéral (feuille qui vacille dans l'air)
      node.swayAmp = 0.3 + Math.random() * 0.75;
      node.swayFreq = 0.003 + Math.random() * 0.004; // rad/ms
      node.swayPhase = Math.random() * Math.PI * 2;

      // rotation
      node.rot = (Math.random() - 0.5) * 30;
      node.vrot = (Math.random() - 0.5) * ROT_SPIN;
      node.el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) rotate(${node.rot}deg)`;
      node.el.style.opacity = "1";

      node.born = now;
      node.lastFrame = now;
      node.ttl = LIFETIME + Math.random() * 900;
      active.add(node);

      /* 🎵 SON POUR CE BILLET */
      playBillSound(i);
    }
    startLoop();
  };

  // animation loop
  let raf = null;
  function step(now) {
    for (const node of Array.from(active)) {
      const previousFrameTime = node.lastFrame || now;
      const dt = Math.min(40, now - previousFrameTime) / 16.67; // approx frames
      node.lastFrame = now;

      // physics
      node.vy += node.gravity * dt;
      node.vx *= Math.pow(AIR_X, dt);
      node.vy *= Math.pow(AIR_Y, dt);

      // vitesse terminale : au-delà, l'air retient la feuille au lieu d'accélérer
      if (node.vy > node.terminal) {
        node.vy += (node.terminal - node.vy) * Math.min(1, TERMINAL_EASE * dt);
      }

      // oscillation latérale + roulis associé
      const sway = Math.sin((now - node.born) * node.swayFreq + node.swayPhase);

      node.x += (node.vx + sway * node.swayAmp) * dt;
      node.y += node.vy * dt;
      node.rot += (node.vrot + sway * ROT_SWAY) * dt;

      node.el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) rotate(${node.rot}deg)`;

      // fade out conditions
      const age = now - node.born;
      const offscreen =
        node.y > window.innerHeight + 200 || node.x < -200 || node.x > window.innerWidth + 200;
      if (age > node.ttl || offscreen) {
        node.el.style.opacity = "0";
        // release shortly after
        setTimeout(() => release(node), 420);
        active.delete(node);
      }
    }

    if (active.size > 0) {
      raf = requestAnimationFrame(step);
    } else {
      raf = null;
    }
  }

  function startLoop() {
    if (!raf) raf = requestAnimationFrame(step);
  }

  function release(node) {
    node.inUse = false;
    node.el.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
    node.el.style.opacity = "0";
    node.vx = node.vy = node.vrot = 0;
    node.x = node.y = -9999;
    node.lastFrame = 0;
  }

  // optional API to clear everything
  clearBills = function () {
    for (const node of pool) release(node);
    active.clear();
  };
})();
