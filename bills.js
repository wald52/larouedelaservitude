// bills.js — effet billets (option C)
// Usage: spawnBills(eventOrCoords, count)
// eventOrCoords can be an Event (mousedown/touchstart) or {x:.., y:..}

// Import du module audio pour le son offline-first
let playBillAudio = null;
const SETTINGS_KEY = 'larouedelaservitude_settings';

function isSoundEnabled() {
  try {
    const attr = document.documentElement?.getAttribute('data-sound-enabled');
    if (attr === 'true') return true;
    if (attr === 'false') return false;

    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return true;

    const parsed = JSON.parse(stored);
    return parsed.soundEnabled !== false;
  } catch (e) {
    console.warn('[BILLS] Impossible de lire le réglage son:', e);
    return true;
  }
}

// Fonction d'initialisation (appelée par index.html)
export function initBills() {
  // Import dynamique du module audio
  import('./js/audio.js').then(({ playBillSound }) => {
    playBillAudio = playBillSound;
    console.log('[BILLS] Module audio chargé pour les sons de billets');
  }).catch(e => {
    console.warn('[BILLS] Module audio non disponible, fallback vers Audio()');
    // Fallback vers l'ancienne méthode
    const fallbackSound = new Audio('/larouedelaservitude/audio/frottement-papier2.mp3');
    fallbackSound.volume = 1;
    fallbackSound.preload = 'auto';
    
    playBillAudio = (delay) => {
      setTimeout(() => {
        if (!isSoundEnabled()) return;
        const snd = fallbackSound.cloneNode(true);
        snd.playbackRate = 1.35 + Math.random() * 0.20;
        snd.play().catch(() => {});
      }, delay);
    };
  });
}

(() => {
  const MAX_BILLS = 64;        // max éléments en DOM
  const GRAVITY = 12;          // gravité
  const AIR = 0.980;           // damping
  const LIFETIME = 10000;      // durée avant fade
  const SIZE_BASE = 24;        // taille de base emoji
  const OUTER_FORCE = 9.5;     // force initiale d'éjection
  const ROT_RANGE = 360;       // degrés max de rotation initiale

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
        const snd = new Audio('/larouedelaservitude/audio/frottement-papier2.mp3');
        snd.volume = 0.5;
        snd.playbackRate = 1.35 + Math.random() * 0.20;
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
    const el = doc.createElement('div');
    el.className = 'bill';
    el.textContent = '💶';
    el.style.left = '0';
    el.style.top = '0';
    el.style.opacity = '0';
    root.appendChild(el);
    pool.push({
      el, inUse: false, x: -9999, y: -9999, vx: 0, vy: 0, rot: 0, vrot: 0, born: 0, ttl: 0, lastFrame: 0
    });
  }

  function getOne() {
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].inUse) return pool[i];
    }
    return null;
  }

  // spawn en cercle autour du point (option C: ejection circulaire)
  window.spawnBills = function(ev, count = 12) {
    let x = window.innerWidth / 2, y = window.innerHeight / 2;

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
      node.el.style.fontSize = Math.round(SIZE_BASE * scale) + 'px';

      // vecteur initial : éjection en cercle + légère impulsion vers le haut
      const dir = i * angleStep + (Math.random() - 0.5) * (angleStep * 0.4);
      const spread = 0.6 + Math.random() * 0.9;
      const speed = OUTER_FORCE * (0.6 + Math.random() * 0.9) * spread;
      node.vx = Math.cos(dir) * speed + (Math.random() - 0.5) * 1.2;
      node.vy = Math.sin(dir) * speed * 0.45 - (3 + Math.random() * 2.5); // upward toss

      // rotation
      node.rot = (Math.random() - 0.5) * 30;
      node.vrot = (Math.random() - 0.5) * (ROT_RANGE * 0.0025);
      node.el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) rotate(${node.rot}deg)`;
      node.el.style.opacity = '1';

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
      node.vy += GRAVITY * 0.7 * dt;
      node.vx *= Math.pow(AIR, dt);
      node.vy *= Math.pow(AIR, dt);

      node.x += node.vx * dt;
      node.y += node.vy * dt;
      node.rot += node.vrot * dt;

      node.el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) rotate(${node.rot}deg)`;

      // fade out conditions
      const age = now - node.born;
      const offscreen = node.y > (window.innerHeight + 200) || node.x < -200 || node.x > window.innerWidth + 200;
      if (age > node.ttl || offscreen) {
        node.el.style.opacity = '0';
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
    node.el.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    node.el.style.opacity = '0';
    node.vx = node.vy = node.vrot = 0;
    node.x = node.y = -9999;
    node.lastFrame = 0;
  }

  // optional API to clear everything
  window.clearBills = function() {
    for (const node of pool) release(node);
    active.clear();
  };

  // pause/resume (for visibility change)
  window.pauseBills = function() { /* no-op for now */ };
  window.resumeBills = function() { /* no-op for now */ };

})();
