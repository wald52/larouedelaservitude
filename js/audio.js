// ===============================
//  audio.js — Gestion audio offline-first
// ===============================
// Les sons sont :
// 1. Pré-cachés par le Service Worker
// 2. Décodés et stockés dans IndexedDB
// 3. Disponibles immédiatement, même hors ligne

import { BASE_PATH } from "./constants.js?v=2713e882";
import { isSoundEnabled as readStoredSoundSetting } from "./settings.js?v=d7e3f5e3";

const AUDIO_DB_NAME = "LaRoueAudio";
const AUDIO_DB_VERSION = 1;
const AUDIO_STORE_NAME = "sounds";

// Sons disponibles
const SOUNDS = {
  spin: "audio/wheel-spin2.mp3", // Son de rotation (clic secteur)
  coin: "audio/coin4.mp3", // Son de victoire (résultat)
  bill: "audio/frottement-papier2.mp3" // Son des billets
};

let audioContext = null;
let masterGainNode = null;
let dbInstance = null;
let decodedBuffers = {};
let isInitialized = false;
let runtimeSoundEnabled = true;
let soundLoadPromises = {};
let secondarySoundsScheduled = false;

function syncMasterGain() {
  if (masterGainNode) {
    masterGainNode.gain.value = runtimeSoundEnabled ? 1 : 0;
  }
}

function setRuntimeSoundEnabled(enabled) {
  runtimeSoundEnabled = enabled;
  syncMasterGain();
}

export function isSoundEnabled() {
  return readStoredSoundSetting();
}

// ===============================
//  IndexedDB Helpers
// ===============================

function openAudioDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(AUDIO_DB_NAME, AUDIO_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME, { keyPath: "name" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

async function getCachedSound(name) {
  try {
    const db = await openAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE_NAME, "readonly");
      const store = tx.objectStore(AUDIO_STORE_NAME);
      const request = store.get(name);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.buffer : null);
      };

      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn("IndexedDB audio non disponible:", e);
    return null;
  }
}

async function cacheSound(name, arrayBuffer) {
  try {
    const db = await openAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE_NAME, "readwrite");
      const store = tx.objectStore(AUDIO_STORE_NAME);

      store.put({
        name,
        buffer: arrayBuffer,
        timestamp: Date.now()
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn("Impossible de cacher le son dans IndexedDB:", e);
  }
}

// ===============================
//  Initialisation audio
// ===============================

/**
 * Initialise le système audio
 * Doit être appelé uniquement quand le son est nécessaire.
 * @returns {Promise<boolean>} true si l'initialisation démarre, false si le son est désactivé
 */
export async function initAudio() {
  runtimeSoundEnabled = readStoredSoundSetting();

  if (!runtimeSoundEnabled) {
    console.log("[AUDIO] Son désactivé, initialisation ignorée");
    return false;
  }

  if (isInitialized) return true;

  ensureAudioContext();

  // Le son de rotation est le seul son critique au premier geste.
  // Les sons plus lourds/moins urgents sont préparés quand le navigateur est au repos
  // afin d'éviter un pic CPU/réseau pendant l'animation de la roue sur mobile.
  await loadSound("spin");
  isInitialized = true;
  scheduleSecondarySoundsLoad();

  return true;
}

function ensureAudioContext() {
  if (audioContext) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGainNode = audioContext.createGain();
  masterGainNode.connect(audioContext.destination);
  syncMasterGain();
}

async function loadSound(name) {
  if (decodedBuffers[name]) return decodedBuffers[name];
  if (soundLoadPromises[name]) return soundLoadPromises[name];

  soundLoadPromises[name] = (async () => {
    ensureAudioContext();

    const cachedBuffer = await getCachedSound(name);
    if (cachedBuffer) {
      decodedBuffers[name] = await audioContext.decodeAudioData(cachedBuffer.slice(0));
      return decodedBuffers[name];
    }

    const url = SOUNDS[name];
    const fullUrl = `${BASE_PATH}/${url}`.replace(/\/+/g, "/");
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    decodedBuffers[name] = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    await cacheSound(name, arrayBuffer);
    return decodedBuffers[name];
  })()
    .catch((error) => {
      console.error(`[AUDIO] Échec chargement ${name}:`, error);
      return null;
    })
    .finally(() => {
      soundLoadPromises[name] = null;
    });

  return soundLoadPromises[name];
}

function scheduleSecondarySoundsLoad() {
  if (secondarySoundsScheduled) return;
  secondarySoundsScheduled = true;

  const loadSecondarySounds = () => {
    Promise.all(["coin", "bill"].map(loadSound)).then(() => {
      console.log("[AUDIO] Sons secondaires prêts");
    });
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(loadSecondarySounds, { timeout: 4000 });
  } else {
    setTimeout(loadSecondarySounds, 1200);
  }
}

/**
 * Déverrouille le contexte audio (nécessaire suite à une interaction utilisateur)
 */
export async function unlockAudio() {
  if (audioContext && audioContext.state === "suspended") {
    try {
      await audioContext.resume();
      console.log("[AUDIO] AudioContext déverrouillé");
    } catch (e) {
      console.error("[AUDIO] Échec déverrouillage:", e);
    }
  }
}

/**
 * Joue un son par son nom
 * @param {string} name - 'spin', 'coin', ou 'bill'
 * @param {number} volume - Volume (0-1), par défaut 1
 * @param {number} playbackRate - Vitesse (0.5-2), par défaut 1
 * @param {{maxDuration?: number, release?: number}} [options] - maxDuration coupe le son
 *   au bout de N secondes (avec un fondu de `release` s) pour éviter que des sons
 *   rapprochés ne s'empilent en bourdonnement.
 */
export function playSound(name, volume = 1, playbackRate = 1, options = {}) {
  if (!runtimeSoundEnabled) {
    return;
  }

  if (!decodedBuffers[name] || !masterGainNode) {
    if (isInitialized && SOUNDS[name]) {
      loadSound(name);
    }
    return;
  }

  try {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = decodedBuffers[name];
    source.playbackRate.value = playbackRate;

    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(masterGainNode);

    source.start(0);

    const { maxDuration = 0, release = 0.025 } = options;
    if (maxDuration > 0) {
      const startTime = audioContext.currentTime;
      const stopTime = startTime + maxDuration;
      const fadeStart = Math.max(startTime, stopTime - release);
      // exponentialRamp exige une valeur de départ strictement positive.
      gainNode.gain.setValueAtTime(Math.max(volume, 0.0001), fadeStart);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);
      source.stop(stopTime);
    }

    // Nettoyage automatique
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };

    return source;
  } catch (e) {
    console.error("[AUDIO] Erreur playback:", e);
  }
}

/**
 * Joue un clic de rotation.
 * La cadence et le dosage sont décidés par l'appelant (app.js), qui connaît la
 * vitesse de la roue ; ici on se contente de jouer un clic court et net.
 * @param {{volume?: number, rate?: number, maxDuration?: number}} [options]
 */
export function playSpinClick(options = {}) {
  const { volume = 0.45, rate = 1, maxDuration = 0.1 } = options;

  playSound("spin", volume, rate, { maxDuration });
}

/**
 * Joue le son de victoire
 */
export function playWinSound() {
  playSound("coin", 0.95, 1);
}

/**
 * Joue le son des billets
 * @param {number} delay - Délai en ms
 */
export function playBillSound(delay = 0) {
  setTimeout(() => {
    if (!runtimeSoundEnabled) return;
    const rate = 1.35 + Math.random() * 0.2;
    playSound("bill", 1, rate);
  }, delay);
}

/**
 * Vérifie si un son est prêt
 * @param {string} name - Nom du son
 * @returns {boolean}
 */
export function isSoundReady(name) {
  return isInitialized && !!decodedBuffers[name];
}

/**
 * Vérifie si TOUS les sons sont prêts
 * @returns {boolean}
 */
export function areAllSoundsReady() {
  if (!isInitialized) return false;
  return Object.keys(SOUNDS).every((name) => !!decodedBuffers[name]);
}

/**
 * Force le rechargement des sons (pour débogage)
 */
export async function refreshSounds() {
  isInitialized = false;
  decodedBuffers = {};
  soundLoadPromises = {};
  secondarySoundsScheduled = false;

  // Vider IndexedDB
  if (dbInstance) {
    const tx = dbInstance.transaction(AUDIO_STORE_NAME, "readwrite");
    tx.objectStore(AUDIO_STORE_NAME).clear();
  }

  await initAudio();
}

// ===============================
//  Export des infos
// ===============================

export function getAudioStatus() {
  return {
    initialized: isInitialized,
    soundEnabled: runtimeSoundEnabled,
    contextState: audioContext?.state || "none",
    sounds: Object.fromEntries(Object.keys(SOUNDS).map((name) => [name, !!decodedBuffers[name]])),
    allReady: areAllSoundsReady()
  };
}

// Pour débogage dans la console
if (typeof window !== "undefined") {
  window.__AUDIO_STATUS__ = getAudioStatus;
  window.addEventListener("soundModeChange", (event) => {
    setRuntimeSoundEnabled(event.detail !== false);
  });
}
