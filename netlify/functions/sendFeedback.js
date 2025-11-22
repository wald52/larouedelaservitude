exports.handler = async (event) => {
  // === 💡 Gestion des CORS pour plusieurs domaines autorisés ===
  const allowedOrigins = [
    "https://wald52.github.io",
    "https://wald52.github.io/larouedelaservitude",
    "https://larouedelaservitude.netlify.app",
    "https://www.larouedelaservitude.fr"
  ];
  const origin = event.headers.origin;
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // ✅ Répond au prévol (préflight CORS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  const headers = { "Content-Type": "application/json" };
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    const { resultText, userMessage, type } = JSON.parse(event.body);

    // Anti-spam simple côté serveur
    if (!userMessage || userMessage.trim().length < 10) {
      return {
        statusCode: 400,
        headers,
        body: "Message trop court ou vide — merci de détailler un peu plus votre retour."
      };
    }

    const linkCount = (userMessage.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      return {
        statusCode: 400,
        headers,
        body: `🚫 Votre message contient ${linkCount} liens.
Pour éviter le spam automatique, seuls 3 liens maximum sont autorisés.
Merci de réduire le nombre de liens et de réessayer.`
      };
    }

    // Configuration
    const repoOwner = "wald52";
    const repoName = "larouedelaservitude";
    const token = process.env.GITHUB_TOKEN;
    const categoryIds = {
      info: "46570623",
      error: "46570630"
    };
    const categoryId = categoryIds[type] || categoryIds.info;

    // Corps de la discussion
    const discussionTitle = `${type === "error" ? "🛠️ Signalement" : "💡 Complément"} sur le résultat : ${resultText}`;
    const discussionBody = `**Résultat :** ${resultText}\n\n**Message de l'utilisateur :**\n${userMessage}`;

    // Appel à l'API GitHub avec fetch natif
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/discussions/`, {
    console.log("Token présent ?", !!token); // Vérifie que le jeton est chargé
    const response = await fetch("https://api.github.com/repos/wald52/larouedelaservitude/discussions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: discussionTitle,
        body: discussionBody,
        category_id: categoryId
        title: "Test Netlify",
        body: "Message de test depuis Netlify.",
        category_id: 46570623
      })
    });

    const data = await response.text();
    console.log("Réponse GitHub :", data); // Affiche la réponse brute
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erreur GitHub:", errorData);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Erreur GitHub API2", details: errorData }) };
      return { statusCode: response.status, headers, body: data };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: data.html_url })
    };
    return { statusCode: 200, headers, body: "Succès !" };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erreur serveur", details: err.message })
    };
    console.error("Erreur :", err);
    return { statusCode: 500, headers, body: err.message };
  }
};
