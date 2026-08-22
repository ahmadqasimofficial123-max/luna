import type { Express, Request, Response } from "express";
import { conversationMembers } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getDb, listMessages } from "./db";
import { sdk } from "./_core/sdk";

export const REALTIME_MESSAGE_POLL_MS = 2000;
export const REALTIME_HEARTBEAT_MS = 20_000;

export type RealtimeStreamMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string | null;
  attachmentUrl?: string | null;
  attachmentType?: "image" | "video" | "voice" | null;
  createdAt: Date;
  readAt?: Date | null;
  reaction?: string | null;
};

export function parseConversationId(value: string | undefined) {
  const conversationId = Number(value);
  return Number.isInteger(conversationId) && conversationId > 0 ? conversationId : null;
}

export async function isConversationMember(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return false;
  const membership = await db.select({ id: conversationMembers.id }).from(conversationMembers).where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId))).limit(1);
  return Boolean(membership[0]);
}

export function realtimeAuthorizationStatus(isMember: boolean) {
  return isMember ? 200 : 403;
}

export function serializeRealtimeEvent(messages: RealtimeStreamMessage[]) {
  return `event: messages\ndata: ${JSON.stringify({ messages })}\n\n`;
}

export function realtimeMessageSignature(messages: RealtimeStreamMessage[]) {
  return messages.map(message => [message.id, message.body, message.attachmentUrl, message.attachmentType, message.readAt ? new Date(message.readAt).getTime() : null, message.reaction || null]).map(row => row.join("|")).join(";");
}

export function registerRealtimeRoutes(app: Express) {
  app.get("/api/realtime/messages/:conversationId", async (req: Request, res: Response) => {
    const conversationId = parseConversationId(req.params.conversationId);
    if (!conversationId) return res.status(400).json({ error: "A valid conversation id is required" });
    try {
      const user = await sdk.authenticateRequest(req);
      if (realtimeAuthorizationStatus(await isConversationMember(user.id, conversationId)) === 403) return res.status(403).json({ error: "You are not a member of this conversation" });

      res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
      res.flushHeaders();
      let closed = false;
      let lastSignature = "";
      let hasEmittedInitialState = false;
      let lastHeartbeat = Date.now();
      const writeMessagesIfChanged = async () => {
        if (closed) return;
        try {
          const messages = await listMessages(user.id, conversationId) as RealtimeStreamMessage[];
          const signature = realtimeMessageSignature(messages);
          if (!hasEmittedInitialState || signature !== lastSignature) {
            hasEmittedInitialState = true;
            lastSignature = signature;
            res.write(serializeRealtimeEvent(messages));
          }
          if (Date.now() - lastHeartbeat >= REALTIME_HEARTBEAT_MS) {
            res.write(": keep-alive\n\n");
            lastHeartbeat = Date.now();
          }
        } catch (error) {
          console.error("[Realtime] Conversation stream query failed:", error);
        }
      };
      await writeMessagesIfChanged();
      const pollTimer = setInterval(() => { void writeMessagesIfChanged(); }, REALTIME_MESSAGE_POLL_MS);
      const cleanup = () => { if (closed) return; closed = true; clearInterval(pollTimer); };
      req.on("close", cleanup);
      res.on("close", cleanup);
    } catch (error) {
      if (!res.headersSent) return res.status(401).json({ error: "Authentication required" });
      console.error("[Realtime] Stream failed:", error);
      res.end();
    }
  });
}
