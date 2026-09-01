const UTF8 = new TextEncoder();

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export function jsonResponse(payload, { status = 200, headers } = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders
  });
}

export function textResponse(body, { status = 200, headers } = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "text/plain; charset=utf-8");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(body, {
    status,
    headers: responseHeaders
  });
}

export async function readJsonBody(request, maxBytes) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "unsupported_media_type", "Le corps doit être envoyé en JSON.");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpError(413, "payload_too_large", "La requête est trop volumineuse.");
  }

  const rawBody = await request.text();
  if (UTF8.encode(rawBody).byteLength > maxBytes) {
    throw new HttpError(413, "payload_too_large", "La requête est trop volumineuse.");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, "invalid_json", "Le corps JSON est invalide.");
  }
}

export function errorResponse(error, headers) {
  if (error instanceof HttpError) {
    return jsonResponse(
      {
        error: error.code,
        message: error.message
      },
      { status: error.status, headers }
    );
  }

  console.error("Erreur inattendue de fonction Netlify:", error);
  return jsonResponse(
    {
      error: "internal_error",
      message: "Erreur interne du serveur."
    },
    { status: 500, headers }
  );
}
