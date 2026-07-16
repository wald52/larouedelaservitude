const { corsHeaders: buildCorsHeaders } = require("./_shared/cors");

exports.handler = async (event) => {
  // === 💡 Gestion des CORS ===
  const corsHeaders = buildCorsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const { resultText, userMessage, type, honeypot } = JSON.parse(event.body);

    // === 🛡️ Honeypot anti-bot ===
    // Champ invisible pour les humains : s'il est rempli, c'est un bot.
    // On renvoie un 200 silencieux pour ne pas signaler au bot que le piège a fonctionné.
    if (honeypot) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true })
      };
    }

    // === 🛡️ Anti-spam ===
    if (!userMessage || userMessage.trim().length < 10) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: "Message trop court ou vide — merci de détailler un peu plus votre retour."
      };
    }

    const linkCount = (userMessage.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: `🚫 Votre message contient ${linkCount} liens. Maximum 3 autorisés.`
      };
    }

    // === 🔧 Configuration GitHub ===
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("Missing GITHUB_TOKEN");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erreur serveur" })
      };
    }

    // IDs GitHub issus du repository wald52/larouedelaservitude et de ses catégories de discussions.
    // Les vérifier avec l'API GraphQL GitHub si le dépôt ou les catégories sont recréés.
    const categoryIds = {
      info: "DIC_kwDOQOpIP84Cxpx_",
      error: "DIC_kwDOQOpIP84CxpyG"
    };
    const categoryId = categoryIds[type] || categoryIds.info;

    const repositoryId = "R_kgDOQOpIPw";

    // === 📝 Construction du titre + corps ===
    // Pas d'échappement manuel : la mutation passe ces valeurs via des variables GraphQL
    // (paramétrées), donc GitHub les traite comme du texte brut sans risque d'injection.
    const safeResult =
      typeof resultText === "string" && resultText.trim() ? resultText : "(résultat non précisé)";

    const title =
      `${type === "error" ? "🛠️ Signalement" : "💡 Complément"} sur le résultat : ${safeResult}`;

    const body =
      `**Résultat :** ${safeResult}\n\n` +
      `**Message de l'utilisateur :**\n${userMessage}`;

    // === 🧩 Mutation GraphQL ===
    const query = `
      mutation CreateDiscussion($input: CreateDiscussionInput!) {
        createDiscussion(input: $input) {
          discussion {
            id
            number
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        repositoryId,
        categoryId,
        title,
        body
      }
    };

    // === 🚀 Appel GraphQL ===
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();

    // === ❌ Gestion d'erreurs GraphQL ===
    if (data.errors) {
      console.error("Erreur GraphQL :", data.errors);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erreur lors de la création de la discussion" })
      };
    }

    // === ✅ OK ===
    const url = data.data.createDiscussion.discussion.url;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ url })
    };

  } catch (err) {
    console.error("Erreur serveur :", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Erreur serveur" })
    };
  }
};
