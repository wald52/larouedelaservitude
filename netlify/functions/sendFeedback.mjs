import { corsHeaders, isAllowedOrigin } from "./_shared/cors.mjs";
import { errorResponse, HttpError, jsonResponse, readJsonBody } from "./_shared/http.mjs";
import { neutralizeMentions, normalizeText } from "./_shared/share.mjs";

const MAX_REQUEST_BYTES = 16 * 1024;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 3_000;
const MAX_RESULT_LENGTH = 500;
const MAX_LINKS = 3;
const GITHUB_TIMEOUT_MS = 8_000;

const DEFAULT_REPOSITORY_ID = "R_kgDOQOpIPw";
const DEFAULT_CATEGORY_IDS = {
  info: "DIC_kwDOQOpIP84Cxpx_",
  error: "DIC_kwDOQOpIP84CxpyG"
};

export const config = {
  path: ["/api/feedback", "/.netlify/functions/sendFeedback"],
  rateLimit: {
    windowLimit: 2,
    windowSize: 180,
    aggregateBy: ["ip", "domain"]
  }
};

function countLinks(value) {
  return (value.match(/https?:\/\//gi) || []).length;
}

function discussionConfiguration(type) {
  return {
    repositoryId: process.env.GITHUB_REPOSITORY_ID || DEFAULT_REPOSITORY_ID,
    categoryId:
      type === "error"
        ? process.env.GITHUB_DISCUSSION_ERROR_CATEGORY_ID || DEFAULT_CATEGORY_IDS.error
        : process.env.GITHUB_DISCUSSION_INFO_CATEGORY_ID || DEFAULT_CATEGORY_IDS.info
  };
}

function validateDiscussionUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    !url.pathname.includes("/discussions/")
  ) {
    throw new Error("URL de discussion GitHub inattendue");
  }
  return url.toString();
}

export default async function handler(request) {
  const headers = corsHeaders(request);

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(request)) {
      return jsonResponse(
        { error: "origin_not_allowed", message: "Origine non autorisée." },
        { status: 403, headers }
      );
    }
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    headers.set("Allow", "POST, OPTIONS");
    return jsonResponse(
      { error: "method_not_allowed", message: "Méthode non autorisée." },
      { status: 405, headers }
    );
  }

  if (!isAllowedOrigin(request)) {
    return jsonResponse(
      { error: "origin_not_allowed", message: "Origine non autorisée." },
      { status: 403, headers }
    );
  }

  try {
    const body = await readJsonBody(request, MAX_REQUEST_BYTES);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError(400, "invalid_payload", "Le corps de la requête est invalide.");
    }

    const honeypot = typeof body.honeypot === "string" ? body.honeypot.trim() : "";
    if (honeypot) {
      return jsonResponse({ ok: true }, { headers });
    }

    const type = body.type === "error" ? "error" : body.type === "info" ? "info" : null;
    if (!type) {
      throw new HttpError(400, "invalid_feedback_type", "Le type de retour est invalide.");
    }

    if (typeof body.userMessage !== "string") {
      throw new HttpError(400, "missing_message", "Le message est manquant.");
    }

    const userMessage = body.userMessage.trim();
    if (userMessage.length < MIN_MESSAGE_LENGTH) {
      throw new HttpError(400, "message_too_short", "Merci de détailler davantage votre retour.");
    }
    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(413, "message_too_long", "Le message est trop long.");
    }
    if (countLinks(userMessage) > MAX_LINKS) {
      throw new HttpError(
        400,
        "too_many_links",
        `Le message ne peut pas contenir plus de ${MAX_LINKS} liens.`
      );
    }

    const resultText = normalizeText(body.resultText, MAX_RESULT_LENGTH) || "résultat non précisé";
    const safeResult = neutralizeMentions(resultText);
    const safeMessage = neutralizeMentions(userMessage);
    const titlePrefix = type === "error" ? "🛠️ Signalement" : "💡 Complément";
    const title = `${titlePrefix} — ${safeResult}`.slice(0, 220);
    const discussionBody =
      `**Résultat :** ${safeResult}\n\n` + `**Message de l’utilisateur :**\n${safeMessage}`;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("Variable GITHUB_TOKEN absente");
      throw new HttpError(500, "server_configuration_error", "Configuration serveur incomplète.");
    }

    const { repositoryId, categoryId } = discussionConfiguration(type);
    const query = `
      mutation CreateDiscussion($input: CreateDiscussionInput!) {
        createDiscussion(input: $input) {
          discussion {
            url
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

    let response;
    try {
      response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "larouedelaservitude-feedback"
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              repositoryId,
              categoryId,
              title,
              body: discussionBody
            }
          }
        }),
        signal: controller.signal
      });
    } catch (error) {
      console.error("Appel GitHub impossible:", error.message);
      throw new HttpError(502, "github_unavailable", "GitHub est temporairement indisponible.");
    } finally {
      clearTimeout(timeout);
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new HttpError(502, "github_unavailable", "GitHub a renvoyé une réponse illisible.");
    }

    if (!response.ok || payload?.errors?.length) {
      const messages = payload?.errors?.map((error) => error.message).filter(Boolean).slice(0, 3);
      console.error("Échec de création de la discussion GitHub:", response.status, messages);
      throw new HttpError(
        502,
        "github_rejected_request",
        "La discussion GitHub n'a pas pu être créée."
      );
    }

    let discussionUrl;
    try {
      discussionUrl = validateDiscussionUrl(payload?.data?.createDiscussion?.discussion?.url);
    } catch {
      throw new HttpError(
        502,
        "github_invalid_response",
        "GitHub a renvoyé une adresse de discussion invalide."
      );
    }

    return jsonResponse({ url: discussionUrl }, { headers });
  } catch (error) {
    return errorResponse(error, headers);
  }
}
