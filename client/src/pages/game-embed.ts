const KNOWN_FRAME_BLOCKERS = ["poki.com", "crazygames.com"];

export function isKnownBlockedEmbedUrl(sourceUrl: string) {
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();
    return KNOWN_FRAME_BLOCKERS.some(host => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}
