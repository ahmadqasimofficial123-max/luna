export function resolvePublishedPostMediaUrl(uploadedUrl: string | null | undefined, fallbackUrl: string) {
  const normalized = uploadedUrl?.trim();
  return normalized || fallbackUrl;
}

export function resolvePublishedPostId(persistedId: number | null | undefined, temporaryId: number) {
  return persistedId && persistedId > 0 ? persistedId : temporaryId;
}

export function dedupeById<T extends { id: number }>(items: T[]) {
  const seen = new Set<number>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

