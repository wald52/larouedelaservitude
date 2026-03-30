#!/usr/bin/env node
/**
 * Script de conversion des entrées vers format JSON light + full
 * Usage: node scripts/convert-entries.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Lire le fichier entries.js actuel
let entriesContent = readFileSync(join(rootDir, 'js/entries.js'), 'utf-8');

// Supprimer les lignes commentées (qui commencent par //)
entriesContent = entriesContent
  .split('\n')
  .filter(line => !line.trim().startsWith('//'))
  .join('\n');

// Extraire le tableau ENTRIES (regex pour attraper le contenu entre [ et ])
const match = entriesContent.match(/export const ENTRIES = \[(.*?)\];/s);
if (!match) {
  console.error('❌ Impossible de trouver ENTRIES dans entries.js');
  process.exit(1);
}

// Parser les entrées (chaînes entre guillemets) - exclure les couleurs hex
const entriesRaw = match[1].match(/"([^"#][^"]*(?:\\.[^"]*)*)"/g);
if (!entriesRaw) {
  console.error('❌ Aucune entrée trouvée');
  process.exit(1);
}

// Fonction pour parser une entrée brute
function parseEntry(raw) {
  // Enlever les guillemets et échapper
  let text = raw.slice(1, -1).replace(/\\"/g, '"');
  const originalText = text;
  
  // Extraire recette (peut contenir "millions", "milliards", "euros", "€")
  let recette = null;
  const recettePatterns = [
    /Recette\s*:\s*([\d\.\,]+\s*(?:millions?|milliards?|M|Md)\s*(?:d'?|\s*)?(?:euros?|€)?)/i,
    /Recette\s*:\s*([\d\.\,]+\s*millions?)/i,
    /Recette\s*:\s*([\d\.\,]+\s*milliards?)/i
  ];
  
  for (const pattern of recettePatterns) {
    const match = text.match(pattern);
    if (match) {
      recette = match[1].trim();
      text = text.replace(match[0], ' ');
      break;
    }
  }
  
  // Extraire année
  let annee = null;
  const anneeMatch = text.match(/Date de création\s*:\s*(\d{4})/i);
  if (anneeMatch) {
    annee = parseInt(anneeMatch[1], 10);
    text = text.replace(anneeMatch[0], ' ');
  } else {
    // Chercher année seule (<1979 par exemple)
    const anneeMatch2 = text.match(/Date de création\s*:\s*<(\d{4})/i);
    if (anneeMatch2) {
      annee = parseInt(anneeMatch2[1], 10);
      text = text.replace(anneeMatch2[0], ' ');
    }
  }
  
  // Nettoyer le nom - enlever espaces multiples et deux-points finaux
  let nom = text
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*/g, ': ')
    .trim();
  
  // Enlever les deux-points et espaces superflus à la fin
  nom = nom.replace(/[:\s]+$/, '');
  
  // Si le nom contient encore "Recette", le couper avant
  const recetteIndex = nom.toLowerCase().indexOf('recette');
  if (recetteIndex > 0) {
    nom = nom.slice(0, recetteIndex).trim().replace(/[:\s]+$/, '');
  }
  
  // Générer un ID unique
  const id = nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  
  // Nom court pour la roue (max 25 chars)
  let nomCourt = nom;
  if (nomCourt.length > 25) {
    // Essayer de couper au premier espace après 18 chars
    const cutIndex = nomCourt.indexOf(' ', 18);
    if (cutIndex > 0) {
      nomCourt = nomCourt.slice(0, cutIndex) + '…';
    } else {
      nomCourt = nomCourt.slice(0, 23) + '…';
    }
  }
  
  return {
    id,
    nom,
    nom_court: nomCourt,
    nom_complet: nom,
    recette: recette || null,
    annee: annee || null
  };
}

// Parser toutes les entrées
const entries = entriesRaw.map(parseEntry);

// Créer entries-light.json
const lightData = entries.map(e => ({
  id: e.id,
  nom: e.nom_court
}));

// Créer entries-full.json
const fullData = {
  version: new Date().toISOString().split('T')[0],
  entries: entries.map(e => ({
    id: e.id,
    nom: e.nom_court,
    nom_complet: e.nom_complet,
    recette: e.recette,
    annee: e.annee
  }))
};

// Écrire les fichiers
writeFileSync(
  join(rootDir, 'data/entries-light.json'),
  JSON.stringify(lightData, null, 2),
  'utf-8'
);
console.log(`✅ entries-light.json créé (${lightData.length} entrées)`);

writeFileSync(
  join(rootDir, 'data/entries-full.json'),
  JSON.stringify(fullData, null, 2),
  'utf-8'
);
console.log(`✅ entries-full.json créé (${fullData.entries.length} entrées)`);

// Afficher stats
const lightSize = JSON.stringify(lightData).length;
const fullSize = JSON.stringify(fullData).length;
console.log(`\n📊 Tailles:`);
console.log(`   Light: ${(lightSize / 1024).toFixed(2)} KB`);
console.log(`   Full:  ${(fullSize / 1024).toFixed(2)} KB`);
console.log(`   Gain:  ${((1 - lightSize / fullSize) * 100).toFixed(1)}%`);
