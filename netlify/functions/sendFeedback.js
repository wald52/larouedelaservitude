const axios = require("axios");

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

  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    const { resultText, userMessage, type } = JSON.parse(event.body);

    // Anti-spam simple côté serveur
    // 1. Message trop court ou vide
    if (!userMessage || userMessage.trim().length < 10) {
      return {
        statusCode: 400,
        headers,
        body: "Message trop court ou vide — merci de détailler un peu plus votre retour."
      };
    }

    // 2. Trop de liens (anti-spam)
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
      info: "46570623",   // Compléments d'information
      error: "46570630"   // Signalements d'erreurs
    };
    const categoryId = categoryIds[type] || categoryIds.info;

    // Corps de la discussion
    const discussionTitle = `${type === "error" ? "🛠️ Signalement" : "💡 Complément"} sur le résultat : ${resultText}`;
    const discussionBody = `**Résultat :** ${resultText}\n\n**Message de l'utilisateur :**\n${userMessage}`;

    // Appel à l'API GitHub avec axios
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/discussions`,
      {
        title: discussionTitle,
        body: discussionBody,
        category_id: categoryId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        }
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: response.data.html_url })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erreur serveur", details: err.message })
    };
  }
};
