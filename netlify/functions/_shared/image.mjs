import { HttpError } from "./http.mjs";

export const MAX_IMAGE_BASE64_LENGTH = 4 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const DATA_URI_RE = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

function hasPngSignature(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return signature.every((value, index) => bytes[index] === value);
}

function hasJpegSignature(bytes) {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function hasWebpSignature(bytes) {
  return (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function signatureMatches(mime, bytes) {
  if (mime === "image/png") return hasPngSignature(bytes);
  if (mime === "image/jpeg") return hasJpegSignature(bytes);
  if (mime === "image/webp") return hasWebpSignature(bytes);
  return false;
}

export function inspectImageDataUri(imageData) {
  if (typeof imageData !== "string" || imageData.length === 0) {
    throw new HttpError(400, "missing_image", "L'image est manquante.");
  }

  if (imageData.length > MAX_IMAGE_BASE64_LENGTH + 64) {
    throw new HttpError(413, "image_too_large", "L'image est trop volumineuse.");
  }

  const match = DATA_URI_RE.exec(imageData);
  if (!match) {
    throw new HttpError(
      400,
      "invalid_image_data",
      "L'image doit être un data-URI PNG, JPEG ou WebP en base64."
    );
  }

  const [, mime, base64] = match;
  if (base64.length > MAX_IMAGE_BASE64_LENGTH || base64.length % 4 !== 0) {
    throw new HttpError(413, "image_too_large", "L'image est trop volumineuse.");
  }

  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    throw new HttpError(413, "image_too_large", "L'image est trop volumineuse.");
  }

  const normalizedInput = base64.replace(/=+$/, "");
  const normalizedDecoded = bytes.toString("base64").replace(/=+$/, "");
  if (normalizedDecoded !== normalizedInput || !signatureMatches(mime, bytes)) {
    throw new HttpError(
      400,
      "invalid_image_data",
      "Le contenu ne correspond pas à une image valide."
    );
  }

  return { mime, base64, bytes };
}
