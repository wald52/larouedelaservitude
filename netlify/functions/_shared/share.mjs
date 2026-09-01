export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeText(value, maxLength) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function neutralizeMentions(value) {
  // Neutralise les mentions GitHub sans altérer les adresses e-mail. Une arobase
  // précédée d'un caractère de mot reste intacte (ex. nom@example.com).
  return String(value).replace(/(^|[^\w.+-])@(?=[A-Za-z0-9])/g, "$1@\u200b");
}

export function validateImgBbHttpsUrl(value) {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("URL d'image ImgBB invalide");
  }

  const allowedHosts = new Set(["i.ibb.co", "ibb.co"]);
  if (parsedUrl.protocol !== "https:" || !allowedHosts.has(parsedUrl.hostname)) {
    throw new Error("URL d'image ImgBB invalide");
  }

  parsedUrl.username = "";
  parsedUrl.password = "";
  parsedUrl.hash = "";
  return parsedUrl.toString();
}
