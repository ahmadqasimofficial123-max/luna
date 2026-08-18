import { HttpError } from "@shared/_core/errors";

export function validateMediaUpload(body: Buffer, contentType?: string) {
  if (!body.length) return { ok: false as const, statusCode: 400, error: "Media body is required" };
  const normalizedType = contentType?.split(";", 1)[0] || "";
  if (!normalizedType.startsWith("image/") && !normalizedType.startsWith("video/")) {
    return { ok: false as const, statusCode: 415, error: "Only image and video uploads are supported" };
  }
  return { ok: true as const, contentType: normalizedType };
}

export function normalizeUploadFilename(encodedName: string) {
  let decodedName: string;
  try {
    decodedName = decodeURIComponent(encodedName);
  } catch {
    throw new HttpError(400, "Invalid media filename");
  }
  return decodedName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "upload";
}

export function mediaUploadErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return { statusCode: error.statusCode, error: error.message };
  }
  return { statusCode: 500, error: "Could not upload media" };
}
