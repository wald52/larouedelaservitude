import {
  corsHeaders,
  getApiSiteOrigin,
  getPublicSiteUrl,
  isAllowedOrigin
} from "./_shared/cors.mjs";
import { errorResponse, HttpError, jsonResponse, readJsonBody } from "./_shared/http.mjs";
import { inspectImageDataUri, MAX_IMAGE_BASE64_LENGTH } from "./_shared/image.mjs";
import { normalizeText, validateImgBbHttpsUrl } from "./_shared/share.mjs";

const MAX_REQUEST_BYTES = MAX_IMAGE_BASE64_LENGTH + 16 * 1024;
const MAX_SHARE_TEXT_LENGTH = 2_000;
const IMGBB_TIMEOUT_MS = 8_000;

export const config = {
  path: ["/api/share-image", "/.netlify/functions/shareImage"],
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};

export function getShareMetadata(text) {
  const compact = normalizeText(text, MAX_SHARE_TEXT_LENGTH);
  return {
    title: compact.slice(0, 100) || "La roue de la servitude",
    description: compact.slice(0, 200) || "Résultat partagé depuis La roue de la servitude."
  };
}

async function uploadToImgBb(base64, apiKey) {
  const formData = new URLSearchParams({
    key: apiKey,
    image: base64
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMGBB_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Réponse ImgBB illisible (HTTP ${response.status})`);
    }

    if (!response.ok || !payload?.success) {
      throw new Error(`Échec ImgBB (HTTP ${response.status})`);
    }

    return validateImgBbHttpsUrl(payload.data?.url);
  } finally {
    clearTimeout(timeout);
  }
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

    const { imageData, text } = body;
    if (typeof text !== "string" || text.trim() === "") {
      throw new HttpError(400, "missing_text", "Le texte de partage est manquant.");
    }
    if (text.length > MAX_SHARE_TEXT_LENGTH) {
      throw new HttpError(413, "text_too_large", "Le texte de partage est trop long.");
    }

    const { base64 } = inspectImageDataUri(imageData);
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("Variable IMGBB_API_KEY absente");
      throw new HttpError(500, "server_configuration_error", "Configuration serveur incomplète.");
    }

    let imageUrl;
    try {
      imageUrl = await uploadToImgBb(base64, apiKey);
    } catch (error) {
      console.error("Échec du téléversement ImgBB:", error.message);
      throw new HttpError(502, "image_upload_failed", "Le téléversement de l'image a échoué.");
    }

    const publicSiteUrl = getPublicSiteUrl();
    const apiOrigin = getApiSiteOrigin(request);
    const { title, description } = getShareMetadata(text);
    const shareParams = new URLSearchParams({
      image: imageUrl,
      title,
      description,
      redirect: publicSiteUrl
    });
    const sharePageUrl = `${apiOrigin}/.netlify/functions/sharePage?${shareParams.toString()}`;

    return jsonResponse(
      {
        success: true,
        imageUrl,
        sharePageUrl
      },
      { headers }
    );
  } catch (error) {
    return errorResponse(error, headers);
  }
}
