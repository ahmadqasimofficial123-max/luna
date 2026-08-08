import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

  it("accepts a persisted message payload and settings update contract", async () => {
    const caller = appRouter.createCaller(createContext());
    const message = await caller.social.sendMessage({ conversationId: 1, body: "A signal from the workspace" });
    expect(message.body).toBe("A signal from the workspace");
    const settings = await caller.social.updateSettings({ pushNotifications: false, allowMessages: "followers" });
    expect(settings).toBeUndefined();
  });
});
