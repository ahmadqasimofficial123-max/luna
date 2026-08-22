import { COOKIE_NAME } from "@shared/const";

export type RealtimeMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string | null;
  attachmentUrl?: string | null;
  attachmentType?: "image" | "video" | "voice" | null;
  createdAt: string;
  readAt?: string | null;
  reaction?: string | null;
};

export type RealtimeStatus = "idle" | "connecting" | "connected" | "reconnecting" | "offline";

export function realtimeStatusLabel(status: RealtimeStatus) {
  if (status === "connected") return "Live";
  if (status === "reconnecting") return "Reconnecting";
  if (status === "offline") return "Offline · polling fallback";
  if (status === "connecting") return "Connecting";
  return "Live updates paused";
}

export function realtimeRetryDelay(attempt: number) {
  return Math.min(15_000, 1_000 * 2 ** Math.min(attempt, 4));
}

export function realtimeStreamPath(conversationId: number) {
  return `/api/realtime/messages/${conversationId}`;
}

function authHeaders(): HeadersInit {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (raw) {
      const cookieName = `${COOKIE_NAME}=`;
      const token = raw.split(";").find(item => item.trim().startsWith(cookieName))?.trim().slice(cookieName.length);
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Session storage is optional; the regular cookie is sent below.
  }
  return {};
}

function parseSseBlock(block: string) {
  let event = "message";
  let data = "";
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return null;
  try {
    return { event, payload: JSON.parse(data) as { messages?: RealtimeMessage[] } };
  } catch {
    return null;
  }
}

export async function readConversationStream(conversationId: number, onMessages: (messages: RealtimeMessage[]) => void, signal: AbortSignal) {
  const response = await fetch(realtimeStreamPath(conversationId), { headers: { Accept: "text/event-stream", ...authHeaders() }, credentials: "include", signal });
  if (!response.ok) throw new Error(`Realtime stream failed with ${response.status}`);
  if (!response.body) throw new Error("Realtime stream is unavailable");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || "";
    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (parsed?.event === "messages" && Array.isArray(parsed.payload.messages)) onMessages(parsed.payload.messages);
    }
  }
  if (!signal.aborted) throw new Error("Realtime stream closed");
}
