import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { outgoingMessageStatus } from "../client/src/pages/Messages";

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

  it("keeps outgoing status honest without recipient-read evidence", () => {
    expect(outgoingMessageStatus({ optimistic: true })).toBe("Sending…");
    expect(outgoingMessageStatus({ optimistic: false })).toBe("Sent");
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
