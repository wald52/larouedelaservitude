exports.handler = async (event) => {
  // === 💡 Gestion des CORS ===
  const allowedOrigins = [
    "https://wald52.github.io",
    "https://wald52.github.io/larouedelaservitude",
    "https://larouedelaservitude.netlify.app"
  ];
  const origin = event.headers.origin;
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const { resultText, userMessage, type } = JSON.parse(event.body);

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

    // === 🔧 Utilitaires ===
    const escapeGraphQL = (str) =>
      str
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');

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
    const safeResult = escapeGraphQL(resultText);
    const safeMessage = escapeGraphQL(userMessage);

    const title =
      `${type === "error" ? "🛠️ Signalement" : "💡 Complément"} sur le résultat : ${safeResult}`;

    const body =
      `**Résultat :** ${safeResult}\n\n` +
      `**Message de l'utilisateur :**\n${safeMessage}`;

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
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erreur GitHub GraphQL", details: data.errors })
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
      body: JSON.stringify({ error: "Erreur serveur", details: err.message })
    };
  }
};
