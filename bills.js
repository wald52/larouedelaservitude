// bills.js — effet billets (option C)
// Usage: spawnBills(eventOrCoords, count)
// eventOrCoords can be an Event (mousedown/touchstart) or {x:.., y:..}

(() => {
  const MAX_BILLS = 64;        // max éléments en DOM
  const GRAVITY = 12;         // gravité
  const AIR = 0.980;           // damping
  const LIFETIME = 10000;       // durée avant fade
  const SIZE_BASE = 24;        // taille de base emoji
  const OUTER_FORCE = 9.5;     // force initiale d'éjection
  const ROT_RANGE = 360;       // degrés max de rotation initiale

  // son joué pour chaque billet
  const billSoundBuffer = new Audio("audio/frottement-papier.mp3");
  billSoundBuffer.volume = 1;

    let recentSounds = 0;
  const MAX_SOUNDS_PER_SEC = 10;

  setInterval(() => { 
    recentSounds = 0; 
  }, 1000);

function playBillSound(i) {
  if (recentSounds >= MAX_SOUNDS_PER_SEC) return;
  recentSounds++;

  const snd = billSoundBuffer.cloneNode(true);

  // 🎵 Variation subtile du pitch
  snd.playbackRate = 1.35 + Math.random() * 0.15;

  const delay = i * 40; 
  setTimeout(() => snd.play().catch(() => {}), delay);
}

  /* ======================================================= */

  const pool = [];
  const active = new Set();
  const doc = document;
  const root = doc.body;

  // crée le pool
  for (let i=0;i<MAX_BILLS;i++){
    const el = doc.createElement('div');
    el.className = 'bill';
    el.textContent = '💶';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.opacity = '0';
    root.appendChild(el);
    pool.push({
      el, inUse:false, x:-9999, y:-9999, vx:0, vy:0, rot:0, vrot:0, born:0, ttl:0
    });
  }

  function getOne(){
    for (let i=0;i<pool.length;i++) if (!pool[i].inUse) return pool[i];
    return null;
  }

  // spawn en cercle autour du point (option C: ejection circulaire)
  window.spawnBills = function(ev, count = 12) {
    let x = window.innerWidth/2, y = window.innerHeight/2;

    if (ev) {
      if (ev.touches && ev.touches[0]) { x = ev.touches[0].clientX; y = ev.touches[0].clientY; }
      else if (ev.clientX !== undefined) { x = ev.clientX; y = ev.clientY; }
      else if (ev.x !== undefined && ev.y !== undefined) { x = ev.x; y = ev.y; }
    }

    const angleStep = (Math.PI*2) / Math.max(1, count);
    const now = performance.now();

    for (let i=0;i<count;i++){
      const node = getOne();
      if (!node) break;
      node.inUse = true;
      node.el.style.opacity = '1';

      // place un peu décalé pour ne pas coller
      const ox = Math.cos(i*angleStep) * (6 + Math.random()*20);
      const oy = Math.sin(i*angleStep) * (6 + Math.random()*10);
      node.x = x + ox;
      node.y = y + oy;
      node.el.style.left = (node.x) + 'px';
      node.el.style.top = (node.y) + 'px';

      // taille aléatoire
      const scale = 0.8 + Math.random()*1.6;
      node.el.style.fontSize = Math.round(SIZE_BASE * scale) + 'px';

      // vecteur initial : éjection en cercle + légère impulsion vers le haut
      const dir = i*angleStep + (Math.random()-0.5)*(angleStep*0.4);
      const spread = 0.6 + Math.random()*0.9;
      const speed = OUTER_FORCE * (0.6 + Math.random()*0.9) * spread;
      node.vx = Math.cos(dir) * speed + (Math.random()-0.5)*1.2;
      node.vy = Math.sin(dir) * speed * 0.45 - (3 + Math.random()*2.5); // upward toss

      // rotation
      node.rot = (Math.random()-0.5)*30;
      node.vrot = (Math.random()-0.5) * (ROT_RANGE * 0.0025);

      node.born = now;
      node.ttl = LIFETIME + Math.random()*900;
      active.add(node);

      /* 🎵 SON POUR CE BILLET */
      playBillSound(i);
    }
    startLoop();
  };

  // animation loop
  let raf = null;
  function step(now){
    for (const node of Array.from(active)) {
      const dt = Math.min(40, now - node.born) / 16.67; // approx frames
      // physics
      node.vy += GRAVITY * (Math.min(40, performance.now()-node.born)/1000) * 0.7; // small scaling
      node.vx *= AIR;
      node.vy *= AIR;

      node.x += node.vx;
      node.y += node.vy;
      node.rot += node.vrot;

      node.el.style.left = node.x + 'px';
      node.el.style.top = node.y + 'px';
      node.el.style.transform = `translate3d(0,0,0) rotate(${node.rot}deg)`;

      // fade out conditions
      const age = performance.now() - node.born;
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

  function startLoop(){
    if (!raf) raf = requestAnimationFrame(step);
  }

  function release(node){
    node.inUse = false;
    node.el.style.left = '-9999px';
    node.el.style.top = '-9999px';
    node.el.style.transform = 'translate3d(0,0,0) rotate(0deg)';
    node.el.style.opacity = '0';
    node.vx = node.vy = node.vrot = 0;
    node.x = node.y = -9999;
  }

  // optional API to clear everything
  window.clearBills = function(){
    for (const node of pool) release(node);
    active.clear();
  };

  // pause/resume (for visibility change)
  window.pauseBills = function(){ /* no-op for now */ };
  window.resumeBills = function(){ /* no-op for now */ };

})();
