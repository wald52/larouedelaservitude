// ===============================
// 🎵 Gestion des sons de la roue
// ===============================

// Préchargement des sons
const coinSound = new Audio('/larouedelaservitude/audio/coin3.mp3');
const tickSound = new Audio('/larouedelaservitude/audio/wheel-spin2.mp3');

// Empêcher les délais sur mobile (important !)
coinSound.preload = "auto";
tickSound.preload = "auto";

// Ajuster le volume
coinSound.volume = 0.85;
tickSound.volume = 0.55;

// Permet au son des ticks d’être rejoué immédiatement
tickSound.preservesPitch = false;
tickSound.playbackRate = 1;

// Empêche les erreurs "play interrupted"
function safePlay(audioEl) {
  const p = audioEl.play();
  if (p && typeof p.catch === "function") {
    p.catch(() => {});
  }
}

// 📣 Son déclenché au moment où l'utilisateur appuie sur la roue
export function playCoin() {
  coinSound.currentTime = 0;
  safePlay(coinSound);
}

// 📣 Son déclenché à chaque fois que la flèche passe sur une nouvelle case
export function playTick() {
  // Le bruit doit être punchy même lorsque la roue est rapide
  tickSound.currentTime = 0;
  safePlay(tickSound);
}
