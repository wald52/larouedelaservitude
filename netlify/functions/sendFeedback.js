const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { resultText, userMessage, type } = JSON.parse(event.body);

    // Configuration
    const repoOwner = "wald52";
    const repoName = "larouedelaservitude";
    const token = process.env.GITHUB_TOKEN;

    // Remplace ici avec les category_id que tu as trouvés
    const categoryIds = {
      info: "46570623",   // Compléments d'information
      error: "46570630"   // Signalements d'erreurs
    };

    const categoryId = categoryIds[type] || categoryIds.info;

    // Corps de la discussion
    const discussionTitle = `${type === "error" ? "🛠️ Signalement" : "💡 Complément"} sur le résultat : ${resultText}`;
    const discussionBody = `**Résultat :** ${resultText}\n\n**Message de l'utilisateur :**\n${userMessage}`;

    // Appel à l'API GitHub
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/discussions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: discussionTitle,
        body: discussionBody,
        category_id: categoryId
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Erreur GitHub:", err);
      return { statusCode: 500, body: "Erreur GitHub API" };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ url: data.html_url })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Erreur serveur" };
  }
};
