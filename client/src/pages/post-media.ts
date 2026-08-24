export function resolvePublishedPostMediaUrl(uploadedUrl: string | null | undefined, fallbackUrl: string) {
  const normalized = uploadedUrl?.trim();
  return normalized || fallbackUrl;
}

export function resolvePublishedPostId(persistedId: number | null | undefined, temporaryId: number) {
  return persistedId && persistedId > 0 ? persistedId : temporaryId;
}

