exports.handler = async (event) => {
  // === 💡 Gestion des CORS ===
  const allowedOrigins = [
    "https://wald52.github.io",
    "https://wald52.github.io/larouedelaservitude",
    "https://larouedelaservitude.netlify.app",
    "https://www.larouedelaservitude.fr"
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

    // === 🔧 Configuration GitHub ===
    const token = process.env.GITHUB_TOKEN;

    const categoryIds = {
      info: "DIC_kwDOQOpIP84Cxpx_",
      error: "DIC_kwDOQOpIP84CxpyG"
    };
    const categoryId = categoryIds[type] || categoryIds.info;

    // ⚠️ IMPORTANT : ID du REPOSITORY, pas son nom !
    const repositoryId = "R_kgDOQOpIPw";

    // === 📝 Construction du titre + corps ===
    const title =
      `${type === "error" ? "🛠️ Signalement" : "💡 Complément"} sur le résultat : ${resultText}`;

    const body =
      `**Résultat :** ${resultText}\n\n` +
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

    if (data.errors) {
      console.error("Erreur GraphQL :", data.errors);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erreur GitHub GraphQL", details: data.errors })
      };
    }

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
