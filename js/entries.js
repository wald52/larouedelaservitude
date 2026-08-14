// ===============================
//  entries.js — Chargement 2 niveaux
// ===============================
// 1. Chargement initial : données légères (noms courts) pour afficher la roue rapidement
// 2. Chargement background : données complètes (recette, année) pour l'overlay
// 3. Cache IndexedDB pour fonctionnement offline
//
// Fraîcheur : le cache est servi immédiatement (peinture rapide), puis
// revalidé en tâche de fond contre le réseau. C'est le champ "version" des
// deux fichiers JSON qui décide, pas l'âge du cache — bumper cette version
// suffit donc à propager une correction de données aux visiteurs déjà venus.
// Quand les données changent, un événement `entriesUpdated` est émis sur
// window (même motif de découplage que soundModeChange / infiniteModeChange).

import { BASE_PATH } from "./constants.js";

const DB_NAME = "LaRoueDeLaServitude";
const DB_VERSION = 1;
const STORE_NAME = "cache";

const LIGHT_KEY = "entries-light";
const FULL_KEY = "entries-full";

let entriesLight = null;
let entriesFull = null;
let entriesFullById = null;
let fullDataPromise = null;
let dbInstance = null;

// Version des données actuellement en mémoire (null = inconnue).
let lightVersion = null;
let fullVersion = null;

// Revalidations en cours, pour ne pas les lancer en double.
let lightRevalidation = null;
let fullRevalidation = null;

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
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

// Renvoie l'enregistrement complet { data, version } ou null. La fraîcheur
// n'est plus jugée sur l'âge mais sur la version des données : voir
// revalidate() plus bas.
async function getFromCache(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? { data: result.data, version: result.version ?? null } : null);
      };

      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn("IndexedDB non disponible:", e);
    return null;
  }
}

async function saveToCache(key, data, version) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      store.put({
        key,
        data,
        version: version ?? null,
        timestamp: Date.now()
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn("Impossible de sauvegarder dans IndexedDB:", e);
  }
}

async function clearCache() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn("Impossible de vider le cache:", e);
  }
}

// ===============================
//  Chargement réseau + revalidation
// ===============================

// Accepte les deux formes : { version, entries: [...] } et le tableau nu des
// anciennes versions du fichier (et des caches déjà posés chez les visiteurs).
function unwrap(payload) {
  if (Array.isArray(payload)) return { version: null, entries: payload };
  return { version: payload?.version ?? null, entries: payload?.entries || [] };
}

// `fresh` demande la copie du serveur, pas une copie en cache.
//
// Le paramètre ?fresh= n'est pas décoratif : index.html précharge
// data/entries-light.json (<link rel="preload">), et un fetch vers la même URL
// réutilise cette réponse préchargée sans jamais repasser par le réseau ni par
// le service worker — { cache: 'reload' } seul n'y change rien. Une URL
// distincte est le seul moyen fiable d'obtenir la version publiée.
// Le service worker laisse passer ces requêtes (voir son gestionnaire fetch).
async function fetchEntries(file, { fresh = false } = {}) {
  const url = fresh ? `${BASE_PATH}/data/${file}?fresh=${Date.now()}` : `${BASE_PATH}/data/${file}`;

  const res = await fetch(url, fresh ? { cache: "reload" } : undefined);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return unwrap(await res.json());
}

// Prévient l'application que les données ont changé sous ses pieds.
// `scope` vaut 'light' (la roue doit être reconstruite) ou 'full'.
function notifyEntriesUpdated(scope) {
  window.dispatchEvent(new CustomEvent("entriesUpdated", { detail: { scope } }));
}

// Une version en cache identique à celle du réseau = rien à faire. Un cache
// sans version (posé par une version antérieure de l'application) est toujours
// considéré comme périmé, une seule fois.
function isUpToDate(cachedVersion, networkVersion) {
  return cachedVersion !== null && cachedVersion === networkVersion;
}

function revalidateLight() {
  if (lightRevalidation) return lightRevalidation;

  lightRevalidation = fetchEntries("entries-light.json", { fresh: true })
    .then(async ({ version, entries }) => {
      if (!entries.length || isUpToDate(lightVersion, version)) return;

      entriesLight = entries;
      lightVersion = version;
      await saveToCache(LIGHT_KEY, entries, version);
      console.log("[DATA] Données légères mises à jour:", version);
      notifyEntriesUpdated("light");
    })
    .catch((e) => {
      // Hors ligne : le cache déjà servi fait parfaitement l'affaire.
      console.warn("[DATA] Revalidation du fichier léger impossible:", e);
    })
    .finally(() => {
      lightRevalidation = null;
    });

  return lightRevalidation;
}

function revalidateFull() {
  if (fullRevalidation) return fullRevalidation;

  fullRevalidation = fetchEntries("entries-full.json", { fresh: true })
    .then(async ({ version, entries }) => {
      if (!entries.length || isUpToDate(fullVersion, version)) return;

      entriesFull = entries;
      entriesFullById = new Map(entries.map((entry) => [entry.id, entry]));
      fullVersion = version;
      await saveToCache(FULL_KEY, entries, version);
      console.log("[DATA] Données complètes mises à jour:", version);
      notifyEntriesUpdated("full");
    })
    .catch((e) => {
      console.warn("[DATA] Revalidation du fichier complet impossible:", e);
    })
    .finally(() => {
      fullRevalidation = null;
    });

  return fullRevalidation;
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

  // Cache d'abord, pour dessiner la roue sans attendre le réseau.
  const cached = await getFromCache(LIGHT_KEY);
  const cachedEntries = unwrap(cached?.data).entries;

  if (cachedEntries.length) {
    entriesLight = cachedEntries;
    lightVersion = cached.version;
    revalidateLight();
    return entriesLight;
  }

  try {
    const { version, entries } = await fetchEntries("entries-light.json");
    entriesLight = entries;
    lightVersion = version;
    await saveToCache(LIGHT_KEY, entries, version);
  } catch (e) {
    console.error("Échec chargement entries-light:", e);
    // Fallback: données vides
    entriesLight = [];
  }

  return entriesLight;
}

/**
 * Charge les données complètes en arrière-plan
 * @returns {Promise<Array<{id: string, nom: string, nom_complet: string, recette: string|null, recette_meur: number|null, annee: number|null}>>}
 */
export async function loadFullData() {
  if (entriesFull) return entriesFull;
  if (fullDataPromise) return fullDataPromise;

  fullDataPromise = (async () => {
    const cached = await getFromCache(FULL_KEY);
    const cachedEntries = unwrap(cached?.data).entries;

    if (cachedEntries.length) {
      entriesFull = cachedEntries;
      fullVersion = cached.version;
      revalidateFull();
    } else {
      try {
        const { version, entries } = await fetchEntries("entries-full.json");
        entriesFull = entries;
        fullVersion = version;
        await saveToCache(FULL_KEY, entries, version);
      } catch (e) {
        console.error("Échec chargement entries-full:", e);
        // Fallback: données vides
        entriesFull = [];
      }
    }

    entriesFullById = new Map(entriesFull.map((entry) => [entry.id, entry]));
    fullDataPromise = null;
    return entriesFull;
  })().catch((error) => {
    fullDataPromise = null;
    throw error;
  });

  return fullDataPromise;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  await loadFullData();
  const fullEntry = entriesFullById?.get(lightEntry.id);

  return (
    fullEntry || {
      id: lightEntry.id,
      nom: lightEntry.nom,
      nom_complet: lightEntry.nom,
      recette: null,
      recette_meur: null,
      annee: null
    }
  );
}

/**
 * Récupère une entrée par son ID
 * @param {string} id - ID de l'entrée
 * @returns {Promise<{id: string, nom: string, nom_complet: string, recette: string|null, annee: number|null}|null>}
 */
export async function getEntryById(id) {
  await loadFullData();
  return entriesFullById?.get(id) || null;
}

/**
 * Version du jeu de données actuellement en mémoire (celle du fichier complet
 * s'il est chargé, sinon celle du fichier léger). C'est la valeur qui décide
 * de la fraîcheur du cache : la page d'analyse l'affiche pour que la donnée
 * exportée soit datable.
 * @returns {string|null} null tant qu'aucune donnée n'est chargée
 */
export function getDataVersion() {
  return fullVersion ?? lightVersion;
}

const NUMBER_FORMAT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/**
 * Met en forme la recette d'une entrée.
 * La source est `recette_meur` (nombre, en millions d'euros) ; on retombe sur
 * l'ancienne chaîne `recette` pour les entrées d'historique enregistrées avant
 * l'introduction du champ numérique.
 * @param {object} entry - Entrée complète, ou entrée d'historique
 * @returns {string} Chaîne vide si aucune recette n'est connue
 */
export function formatRecette(entry) {
  const montant = entry?.recette_meur;

  if (montant === null || montant === undefined || !Number.isFinite(montant)) {
    return entry?.recette ? String(entry.recette) : "";
  }

  if (Math.abs(montant) >= 1000) {
    const milliards = montant / 1000;
    return `${NUMBER_FORMAT.format(milliards)} milliard${Math.abs(milliards) >= 2 ? "s" : ""} d'euros`;
  }

  return `${NUMBER_FORMAT.format(montant)} million${Math.abs(montant) >= 2 ? "s" : ""} d'euros`;
}

/**
 * Formate le texte pour l'overlay de résultat
 * @param {object} entry - Entrée complète
 * @returns {string}
 */
export function formatEntryForDisplay(entry) {
  if (!entry) return "";

  const parts = [];

  // Nom complet en premier
  parts.push(`<strong>${escapeHtml(entry.nom_complet)}</strong>`);

  // Recette si disponible
  const recette = formatRecette(entry);
  if (recette) {
    parts.push(`<br>💰 Recette : ${escapeHtml(recette)}`);
  }

  // Année si disponible
  if (entry.annee) {
    parts.push(`<br>📅 Date de création : ${escapeHtml(entry.annee)}`);
  }

  return parts.join("<br>");
}

/**
 * Force le rechargement des données (pour débogage ou mise à jour)
 */
export async function refreshData() {
  await clearCache();
  entriesLight = null;
  entriesFull = null;
  entriesFullById = null;
  fullDataPromise = null;
  lightVersion = null;
  fullVersion = null;
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
  return data.map((e) => e.nom);
};
