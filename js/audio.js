// ===============================
//  audio.js — Gestion audio offline-first
// ===============================
// Les sons sont :
// 1. Pré-cachés par le Service Worker
// 2. Décodés et stockés dans IndexedDB
// 3. Disponibles immédiatement, même hors ligne

const BASE_PATH = window.location.pathname.endsWith('/') 
  ? window.location.pathname.slice(0, -1) 
  : window.location.pathname.replace(/\/index\.html$/, '');

const AUDIO_DB_NAME = 'LaRoueAudio';
const AUDIO_DB_VERSION = 1;
const AUDIO_STORE_NAME = 'sounds';
const SETTINGS_KEY = 'larouedelaservitude_settings';

// Sons disponibles
const SOUNDS = {
  spin: 'audio/wheel-spin2.mp3',      // Son de rotation (clic secteur)
  coin: 'audio/coin4.mp3',            // Son de victoire (résultat)
  bill: 'audio/frottement-papier2.mp3' // Son des billets
};

let audioContext = null;
let masterGainNode = null;
let dbInstance = null;
let decodedBuffers = {};
let isInitialized = false;
let runtimeSoundEnabled = true;

function readStoredSoundSetting() {
  try {
    const attr = document.documentElement?.getAttribute('data-sound-enabled');
    if (attr === 'true') return true;
    if (attr === 'false') return false;

    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return true;

    const parsed = JSON.parse(stored);
    return parsed.soundEnabled !== false;
  } catch (e) {
    console.warn('[AUDIO] Impossible de lire le réglage son:', e);
    return true;
  }
}

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
        db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'name' });
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
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
      const store = tx.objectStore(AUDIO_STORE_NAME);
      const request = store.get(name);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.buffer : null);
      };
      
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB audio non disponible:', e);
    return null;
  }
}

async function cacheSound(name, arrayBuffer) {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
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
    console.warn('Impossible de cacher le son dans IndexedDB:', e);
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
    console.log('[AUDIO] Son désactivé, initialisation ignorée');
    return false;
  }

  if (isInitialized) return true;
  
  // Créer le contexte audio s'il n'existe pas
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
    syncMasterGain();
  }
  
  // Charger et décoder tous les sons en arrière-plan (non-bloquant)
  const loadPromises = Object.entries(SOUNDS).map(async ([name, url]) => {
    try {
      if (decodedBuffers[name]) return;
      
      const cachedBuffer = await getCachedSound(name);
      if (cachedBuffer) {
        decodedBuffers[name] = await audioContext.decodeAudioData(cachedBuffer.slice(0));
        return;
      }
      
      // Nettoyage de l'URL pour éviter les doubles slashes
      const fullUrl = `${BASE_PATH}/${url}`.replace(/\/+/g, '/');
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      decodedBuffers[name] = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      await cacheSound(name, arrayBuffer);
    } catch (e) {
      console.error(`[AUDIO] Échec chargement ${name}:`, e);
    }
  });
  
  // On marque comme initialisé quand tout est prêt, mais on ne fait pas 'await' ici
  Promise.all(loadPromises).then(() => {
    isInitialized = true;
    console.log('[AUDIO] Système audio prêt (background load terminé)');
  });

  return true;
}

/**
 * Déverrouille le contexte audio (nécessaire suite à une interaction utilisateur)
 */
export async function unlockAudio() {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('[AUDIO] AudioContext déverrouillé');
    } catch (e) {
      console.error('[AUDIO] Échec déverrouillage:', e);
    }
  }
}

/**
 * Joue un son par son nom
 * @param {string} name - 'spin', 'coin', ou 'bill'
 * @param {number} volume - Volume (0-1), par défaut 1
 * @param {number} playbackRate - Vitesse (0.5-2), par défaut 1
 */
export function playSound(name, volume = 1, playbackRate = 1) {
  if (!runtimeSoundEnabled) {
    return;
  }

  if (!isInitialized || !decodedBuffers[name] || !masterGainNode) {
    console.warn(`[AUDIO] Son "${name}" non disponible`);
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
    
    // Nettoyage automatique
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
    
    return source;
  } catch (e) {
    console.error('[AUDIO] Erreur playback:', e);
  }
}

/**
 * Joue le son de rotation (clic secteur)
 * @param {number} velocity - Vitesse de rotation (pour le pitch)
 */
export function playSpinClick(velocity = 1) {
  const rate = Math.min(2.5, Math.max(0.5, Math.abs(velocity) * 80 + 0.5));
  playSound('spin', 0.7, rate);
}

/**
 * Joue le son de victoire
 */
export function playWinSound() {
  playSound('coin', 0.95, 1);
}

/**
 * Joue le son des billets
 * @param {number} delay - Délai en ms
 */
export function playBillSound(delay = 0) {
  setTimeout(() => {
    if (!runtimeSoundEnabled) return;
    const rate = 1.35 + Math.random() * 0.20;
    playSound('bill', 1, rate);
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
  return Object.keys(SOUNDS).every(name => !!decodedBuffers[name]);
}

/**
 * Force le rechargement des sons (pour débogage)
 */
export async function refreshSounds() {
  isInitialized = false;
  decodedBuffers = {};
  
  // Vider IndexedDB
  if (dbInstance) {
    const tx = dbInstance.transaction(AUDIO_STORE_NAME, 'readwrite');
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
    contextState: audioContext?.state || 'none',
    sounds: Object.fromEntries(
      Object.keys(SOUNDS).map(name => [name, !!decodedBuffers[name]])
    ),
    allReady: areAllSoundsReady()
  };
}

// Pour débogage dans la console
if (typeof window !== 'undefined') {
  window.__AUDIO_STATUS__ = getAudioStatus;
  window.addEventListener('soundModeChange', (event) => {
    setRuntimeSoundEnabled(event.detail !== false);
  });
}
