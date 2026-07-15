// Helper CORS partagé par les fonctions Netlify.
// Les fichiers/dossiers préfixés par "_" ne sont pas déployés comme fonctions
// mais restent importables par les fonctions voisines.

// Origines autorisées à appeler les fonctions depuis le navigateur.
const ALLOWED_ORIGINS = [
  "https://wald52.github.io",
  "https://larouedelaservitude.netlify.app"
];

// Construit les en-têtes CORS pour une requête donnée.
// L'origine est renvoyée seulement si elle figure dans l'allow-list ;
// sinon on renvoie "null" (valeur inexploitable côté navigateur).
function corsHeaders(event) {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

module.exports = { ALLOWED_ORIGINS, corsHeaders };
