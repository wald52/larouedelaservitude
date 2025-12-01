// netlify/functions/shareImage.js

exports.handler = async (event, context) => {
  // === 💡 1. Gestion des CORS Renforcée ===
  // On récupère l'origine qu'elle soit en minuscule ou majuscule
  const origin = event.headers.origin || event.headers.Origin || "";
  
  const allowedOrigins = [
    "https://wald52.github.io",
    "https://wald52.github.io/larouedelaservitude",
    "https://larouedelaservitude.netlify.app"
  ];

  // Si l'origine est autorisée, on la renvoie, sinon on renvoie la première autorisée (ou null)
  const userOrigin = allowedOrigins.find(o => origin.startsWith(o)) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Préflight OPTIONS (réponse immédiate)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // === 2. Parsing et Vérification ===
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { imageData, text } = body;

    if (!imageData || !text) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing imageData or text' }) };
    }

    // Vérification des variables d'env
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    
    if (!IMGBB_API_KEY || !GITHUB_TOKEN) {
      console.error("Missing Env Vars");
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server configuration error' }) };
    }

    // === 3. Upload vers ImgBB ===
    // On enlève le header data:image si présent
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    const imgbbFormData = new URLSearchParams();
    imgbbFormData.append('image', base64Image);

    // Timeout de sécurité pour fetch (parfois fetch pend indéfiniment)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes max pour l'upload

    try {
      const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: imgbbFormData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const imgbbResult = await imgbbResponse.json();

      if (!imgbbResult.success) {
        throw new Error(`ImgBB Error: ${imgbbResult.error ? imgbbResult.error.message : 'Unknown'}`);
      }
      
      var imageUrl = imgbbResult.data.url; // var pour portée globale dans le try
      console.log('✅ Image uploaded:', imageUrl);

    } catch (err) {
      console.error("ImgBB Upload Failed:", err);
      return { 
        statusCode: 502, 
        headers: corsHeaders, 
        body: JSON.stringify({ error: 'Failed to upload image to provider', details: err.message }) 
      };
    }

    // === 4. Création GitHub (Optimisée) ===
    const GITHUB_OWNER = "wald52";
    const GITHUB_REPO = "larouedelaservitude";
    const GITHUB_BRANCH = "main";
    const shareId = `share-${Date.now()}`;
    const cleanTitle = text.split('\n')[0].substring(0, 100).replace(/"/g, '');
    const cleanDesc = text.replace(/\n/g, ' ').substring(0, 200).replace(/"/g, '');
    const siteUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}`;

    // HTML Minifié pour gagner du poids/temps
    const htmlContent = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${cleanTitle}</title><meta property="og:title" content="${cleanTitle}"><meta property="og:description" content="${cleanDesc}"><meta property="og:image" content="${imageUrl}"><meta property="og:type" content="website"><meta property="og:url" content="${siteUrl}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${imageUrl}"><meta http-equiv="refresh" content="0; url=${siteUrl}"></head><body><script>window.location.href="${siteUrl}";</script></body></html>`;

    const base64Html = Buffer.from(htmlContent, 'utf-8').toString('base64');
    const githubPath = `shares/${shareId}.html`;

    // Requête GraphQL combinée ou simplifiée si possible, mais ici on garde la logique séquentielle
    // car on a besoin du OID.
    
    // Récupération OID
    const repoQuery = `query { repository(owner: "${GITHUB_OWNER}", name: "${GITHUB_REPO}") { object(expression: "${GITHUB_BRANCH}:") { ... on Tree { oid } } } }`;
    
    const repoResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: repoQuery })
    });
    const repoData = await repoResponse.json();
    const headOid = repoData.data?.repository?.object?.oid;

    if (!headOid) throw new Error("Impossible de récupérer l'OID GitHub");

    // Mutation
    const createMutation = `
      mutation($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) { commit { url } }
      }
    `;

    const variables = {
      input: {
        branch: { repositoryNameWithOwner: `${GITHUB_OWNER}/${GITHUB_REPO}`, branchName: GITHUB_BRANCH },
        message: { headline: `Add share ${shareId}` },
        fileChanges: { additions: [{ path: githubPath, contents: base64Html }] },
        expectedHeadOid: headOid
      }
    };

    const createResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: createMutation, variables })
    });

    const createData = await createResponse.json();
    if (createData.errors) throw new Error(JSON.stringify(createData.errors));

    const sharePageUrl = `${siteUrl}/shares/${shareId}.html`;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, imageUrl, sharePageUrl })
    };

  } catch (error) {
    console.error('Fatal Error shareImage:', error);
    // C'est ICI que l'erreur CORS arrive souvent : si le catch ne renvoie pas les headers
    return {
      statusCode: 500,
      headers: corsHeaders, // Important : renvoyer les headers même en cas d'erreur
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
