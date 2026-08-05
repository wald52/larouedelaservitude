import test from 'node:test';
import assert from 'node:assert/strict';

import { collectPrecacheIssues } from '../scripts/check-precache.mjs';

// Le pré-cache est la seule chose qui rend l'application utilisable hors ligne
// après un unique chargement : une ressource oubliée ne se voit qu'en coupant
// le réseau sur un appareil vierge. D'où ce garde-fou automatique.
test('le pré-cache couvre toutes les ressources locales et les versions sont alignées', () => {
  assert.deepEqual(collectPrecacheIssues(), []);
});
