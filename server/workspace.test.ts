import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { calculateConversationUnreadCount, isDirectConversationMemberCount, normalizeMemberSearchTerm } from "./db";
import type { TrpcContext } from "./_core/context";
import { outgoingMessageStatus } from "../client/src/pages/messages-status";
import { callStatusCopy } from "../client/src/pages/messages-call";
import { selectConversationAfterInboxRefresh, selectedConversationIsKnown } from "../client/src/pages/messages-selection";
import { realtimeRetryDelay, realtimeStatusLabel, realtimeStreamPath } from "../client/src/pages/messages-realtime";
import { parseConversationId, realtimeAuthorizationStatus, realtimeMessageSignature, serializeRealtimeEvent } from "./realtime";

function createContext(): TrpcContext {
  const now = new Date();
  return {
    user: { id: 77, openId: "workspace-user", name: "Workspace User", email: "workspace@example.com", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("workspace procedure contracts", () => {
  it("serves discovery, messages, notifications, and moderation collections", async () => {
    const caller = appRouter.createCaller(createContext());
    const [feed, messages, notifications, reports] = await Promise.all([
      caller.social.feed({ limit: 12 }),
      caller.social.messages(),
      caller.social.notifications(),
      caller.social.reports(),
    ]);
    expect(Array.isArray(feed)).toBe(true);
    expect(Array.isArray(messages)).toBe(true);
    expect(Array.isArray(notifications)).toBe(true);
    expect(Array.isArray(reports)).toBe(true);
  });

  it("accepts conversation-scoped message queries and attachment payloads", async () => {
    const caller = appRouter.createCaller(createContext());
    const messages = await caller.social.messages({ conversationId: 1 });
    expect(Array.isArray(messages)).toBe(true);
    await expect(caller.social.sendMessage({ conversationId: 1, body: "", attachmentUrl: "https://cdn.example.com/photo.png", attachmentType: "image" })).rejects.toThrow("not a member");
  });

  it("derives unread counts only from unread messages sent by other members", () => {
    const now = new Date("2026-08-17T12:00:00Z");
    expect(calculateConversationUnreadCount([], 77, null)).toBe(0);
    expect(calculateConversationUnreadCount([{ senderId: 77, createdAt: now }], 77, null)).toBe(0);
    expect(calculateConversationUnreadCount([{ senderId: 88, createdAt: now }], 77, now)).toBe(0);
    expect(calculateConversationUnreadCount([{ senderId: 88, createdAt: new Date(now.getTime() + 1000) }], 77, now)).toBe(1);
  });

  it("normalizes member search terms and rejects invalid or self-chat requests", async () => {
    expect(normalizeMemberSearchTerm("  @MayaChan  ")).toBe("mayachan");
    expect(isDirectConversationMemberCount(2)).toBe(true);
    expect(isDirectConversationMemberCount(3)).toBe(false);
    const caller = appRouter.createCaller(createContext());
    await expect(caller.social.memberSearch({ query: "a" })).rejects.toThrow();
    await expect(caller.social.openDirectConversation({ memberId: 77 })).rejects.toThrow("yourself");
  });

  it("waits for inbox refresh before selecting a newly created direct chat", async () => {
    const events: string[] = [];
    await selectConversationAfterInboxRefresh({
      conversationId: 42,
      refreshInbox: async () => { events.push("refresh-start"); await Promise.resolve(); events.push("refresh-done"); },
      clearSearch: () => events.push("clear-search"),
      navigate: path => events.push(`navigate:${path}`),
    });
    expect(events).toEqual(["refresh-start", "refresh-done", "clear-search", "navigate:/messages/42"]);
    expect(selectedConversationIsKnown(42, [42, 43])).toBe(true);
    expect(selectedConversationIsKnown(42, [43])).toBe(false);
  });

  it("keeps outgoing status honest without recipient-read evidence", () => {
    expect(outgoingMessageStatus({ optimistic: true })).toBe("Sending…");
    expect(outgoingMessageStatus({ optimistic: false })).toBe("Sent");
  });

  it("labels voice and video calls as local previews without claiming remote signaling", () => {
    expect(callStatusCopy("voice", "Waiz Siddiqui")).toEqual({
      title: "Local voice preview",
      detail: "Microphone is active on this device. Remote signaling is not connected, so Waiz Siddiqui has not been invited.",
    });
    expect(callStatusCopy("video", "Waiz Siddiqui").detail).toContain("Camera and microphone are active");
    expect(callStatusCopy("video", "Waiz Siddiqui").detail).toContain("has not been invited");
  });

  it("keeps realtime status honest and reconnect delays bounded", () => {
    expect(realtimeStatusLabel("connected")).toBe("Live");
    expect(realtimeStatusLabel("offline")).toContain("polling fallback");
    expect(realtimeRetryDelay(0)).toBe(1000);
    expect(realtimeRetryDelay(99)).toBe(15000);
    expect(realtimeStreamPath(42)).toBe("/api/realtime/messages/42");
    expect(parseConversationId("42")).toBe(42);
    expect(parseConversationId("0")).toBeNull();
    expect(realtimeAuthorizationStatus(true)).toBe(200);
    expect(realtimeAuthorizationStatus(false)).toBe(403);
  });

  it("serializes conversation events without changing message identity", () => {
    const event = serializeRealtimeEvent([{ id: 9, conversationId: 42, senderId: 77, body: "hello", createdAt: new Date("2026-08-22T12:00:00Z") }]);
    expect(event).toContain("event: messages");
    expect(event).toContain('"conversationId":42');
    expect(realtimeMessageSignature([{ id: 9, conversationId: 42, senderId: 77, body: "hello", createdAt: new Date("2026-08-22T12:00:00Z") }])).toContain("9|hello");
  });

  it("rejects interaction mutations for conversations the user cannot access", async () => {
    const caller = appRouter.createCaller(createContext());
    const reaction = await caller.social.reactToMessage({ messageId: 1, reaction: "❤️" });
    const read = await caller.social.markMessagesRead({ conversationId: 1 });
    expect(reaction.success).toBe(false);
    expect(read.success).toBe(false);
  });

  it("accepts a persisted message payload and settings update contract", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.social.sendMessage({ conversationId: 1, body: "A signal from the workspace" })).rejects.toThrow("not a member");
    const settings = await caller.social.updateSettings({ pushNotifications: false, allowMessages: "followers" });
    expect(settings).toBeUndefined();
  });
});
