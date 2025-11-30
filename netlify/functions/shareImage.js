// netlify/functions/shareImage.js

exports.handler = async (event, context) => {
  // Autoriser uniquement POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Récupérer les données envoyées par le frontend
    const { imageData, text } = JSON.parse(event.body);

    // Validation basique
    if (!imageData || !text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing imageData or text' })
      };
    }

    // ✅ TOKENS SÉCURISÉS (variables d'environnement Netlify)
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = "wald52";
    const GITHUB_REPO = "larouedelaservitude";
    const GITHUB_BRANCH = "main";

    // Vérifier que les variables d'environnement sont configurées
    if (!IMGBB_API_KEY || !GITHUB_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Server configuration error: Missing environment variables' 
        })
      };
    }

    // ========================================
    // 1️⃣ UPLOAD VERS IMGBB
    // ========================================
    
    const imgbbFormData = new URLSearchParams();
    imgbbFormData.append('image', imageData.replace(/^data:image\/\w+;base64,/, ''));

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: imgbbFormData
      }
    );

    const imgbbResult = await imgbbResponse.json();

    if (!imgbbResult.success) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'ImgBB upload failed', 
          details: imgbbResult.error 
        })
      };
    }

    const imageUrl = imgbbResult.data.url;
    console.log('✅ Image uploaded to ImgBB:', imageUrl);

    // ========================================
    // 2️⃣ CRÉER PAGE OPENGRAPH SUR GITHUB
    // ========================================

    const shareId = `share-${Date.now()}`;
    const title = text.split('\n')[0].substring(0, 100);
    const description = text.replace(/\n/g, ' ').substring(0, 200);
    const siteUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}`;

    // Template HTML avec OpenGraph
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La roue de la servitude - ${title}</title>
  
  <!-- OpenGraph -->
  <meta property="og:title" content="La roue de la servitude - ${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:site_name" content="La roue de la servitude">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="La roue de la servitude - ${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirection immédiate -->
  <meta http-equiv="refresh" content="0; url=${siteUrl}">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      width: 100%;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      text-align: center;
    }
    h1 {
      color: #c00;
      font-size: 28px;
      margin-bottom: 20px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #c00;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    p { color: #666; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 La roue de la servitude</h1>
    <div class="spinner"></div>
    <p>Redirection en cours...</p>
  </div>
  <script>window.location.href = "${siteUrl}";</script>
</body>
</html>`;

    // Encoder en base64
    const base64Html = Buffer.from(htmlContent, 'utf-8').toString('base64');

    // Upload vers GitHub
    const githubPath = `shares/${shareId}.html`;
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${githubPath}`;

    const githubResponse = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add share page: ${shareId}`,
        content: base64Html,
        branch: GITHUB_BRANCH
      })
    });

    if (!githubResponse.ok) {
      const githubError = await githubResponse.json();
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'GitHub upload failed', 
          details: githubError 
        })
      };
    }

    const sharePageUrl = `${siteUrl}/shares/${shareId}.html`;
    console.log('✅ Share page created:', sharePageUrl);

    // ========================================
    // 3️⃣ RETOURNER LES URLS
    // ========================================

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        imageUrl,
        sharePageUrl
      })
    };

  } catch (error) {
    console.error('Error in shareImage function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      })
    };
  }
};
