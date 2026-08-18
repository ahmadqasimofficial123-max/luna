import { COOKIE_NAME } from "@shared/const";

export type UploadedMedia = { key: string; url: string };

function previewAuthorization(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    const prefix = `${COOKIE_NAME}=`;
    const pair = raw?.split(";").find(value => value.trim().startsWith(prefix));
    const token = pair?.trim().slice(prefix.length);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function uploadMediaFile(file: File): Promise<UploadedMedia> {
  const response = await fetch("/api/media/upload", {
    method: "POST",
    credentials: "include",
    headers: new Headers({
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
      ...previewAuthorization(),
    }),
    body: file,
  });

  const raw = await response.text();
  let payload: { key?: string; url?: string; error?: string } = {};
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    throw new Error(`Media upload failed (${response.status})`);
  }

  if (!response.ok || !payload.url || !payload.key) {
    throw new Error(payload.error || `Media upload failed (${response.status})`);
  }
  return { key: payload.key, url: payload.url };
}
