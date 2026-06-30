// ===============================
//  entries.js — Chargement 2 niveaux
// ===============================
// 1. Chargement initial : données légères (noms courts) pour afficher la roue rapidement
// 2. Chargement background : données complètes (recette, année) pour l'overlay
// 3. Cache IndexedDB pour fonctionnement offline

const BASE_PATH = window.location.pathname.endsWith('/') 
  ? window.location.pathname.slice(0, -1) 
  : window.location.pathname.replace(/\/index\.html$/, '');
const DB_NAME = 'LaRoueDeLaServitude';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

let entriesLight = null;
let entriesFull = null;
let dbInstance = null;

// ===============================
//  IndexedDB Helpers
// ===============================

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    
    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function getFromCache(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        // Vérifier si le cache est expiré (24h)
        if (result && result.timestamp && Date.now() - result.timestamp < 24 * 60 * 60 * 1000) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB non disponible:', e);
    return null;
  }
}

async function saveToCache(key, data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      store.put({
        key,
        data,
        timestamp: Date.now()
      });
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('Impossible de sauvegarder dans IndexedDB:', e);
  }
}

async function clearCache() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('Impossible de vider le cache:', e);
  }
}

// ===============================
//  API Publique
// ===============================

/**
 * Initialise la roue avec les données légères
 * @returns {Promise<Array<{id: string, nom: string}>>}
 */
export async function initWheel() {
  if (entriesLight) return entriesLight;
  
  // Try IndexedDB first (offline)
  entriesLight = await getFromCache('entries-light');
  
  if (!entriesLight) {
    try {
      const res = await fetch(`${BASE_PATH}/data/entries-light.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      entriesLight = await res.json();
      await saveToCache('entries-light', entriesLight);
    } catch (e) {
      console.error('Échec chargement entries-light:', e);
      // Fallback: données vides
      entriesLight = [];
    }
  }
  
  return entriesLight;
}

/**
 * Charge les données complètes en arrière-plan
 * @returns {Promise<Array<{id: string, nom: string, nom_complet: string, recette: string|null, annee: number|null}>>}
 */
export async function loadFullData() {
  if (entriesFull) return entriesFull;
  
  entriesFull = await getFromCache('entries-full');
  
  if (!entriesFull) {
    try {
      const res = await fetch(`${BASE_PATH}/data/entries-full.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      entriesFull = Array.isArray(data) ? data : (data.entries || []);
      await saveToCache('entries-full', entriesFull);
    } catch (e) {
      console.error('Échec chargement entries-full:', e);
      // Fallback: données vides
      entriesFull = [];
    }
  }
  
  return entriesFull;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Récupère les détails complets d'une entrée par son index
 * @param {number} index - Index dans le tableau light
 * @returns {Promise<{id: string, nom: string, nom_complet: string, recette: string|null, annee: number|null}|null>}
 */
export async function getEntryDetails(index) {
  if (!entriesLight || index < 0 || index >= entriesLight.length) {
    return null;
  }
  
  const lightEntry = entriesLight[index];
  const full = await loadFullData();
  const fullEntry = full.find(e => e.id === lightEntry.id);
  
  return fullEntry || {
    id: lightEntry.id,
    nom: lightEntry.nom,
    nom_complet: lightEntry.nom,
    recette: null,
    annee: null
  };
}

/**
 * Récupère une entrée par son ID
 * @param {string} id - ID de l'entrée
 * @returns {Promise<{id: string, nom: string, nom_complet: string, recette: string|null, annee: number|null}|null>}
 */
export async function getEntryById(id) {
  const full = await loadFullData();
  return full.find(e => e.id === id) || null;
}

/**
 * Formate le texte pour l'overlay de résultat
 * @param {object} entry - Entrée complète
 * @returns {string}
 */
export function formatEntryForDisplay(entry) {
  if (!entry) return '';
  
  const parts = [];
  
  // Nom complet en premier
  parts.push(`<strong>${escapeHtml(entry.nom_complet)}</strong>`);
  
  // Recette si disponible
  if (entry.recette) {
    parts.push(`<br>💰 Recette : ${escapeHtml(entry.recette)}`);
  }
  
  // Année si disponible
  if (entry.annee) {
    parts.push(`<br>📅 Date de création : ${escapeHtml(entry.annee)}`);
  }
  
  return parts.join('<br>');
}

/**
 * Force le rechargement des données (pour débogage ou mise à jour)
 */
export async function refreshData() {
  await clearCache();
  entriesLight = null;
  entriesFull = null;
  await initWheel();
  await loadFullData();
}

// ===============================
//  Compatibilité avec l'ancien code
// ===============================

// Getter pour ENTRIES qui retourne les données light (pour compatibilité)
export const getEntries = async () => {
  const data = await initWheel();
  // Retourner juste les noms pour compatibilité avec l'ancien code
  return data.map(e => e.nom);
};
