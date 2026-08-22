import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = (user?: Partial<NonNullable<TrpcContext["user"]>>): TrpcContext => ({
  user: user ? { id: 7, openId: "social-user", name: "Luna Member", email: "member@luna.test", loginMethod: "manus", role: "user", username: "luna_member", displayName: "Luna Member", bio: null, website: null, avatarUrl: null, isPrivate: false, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), ...user } : null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => undefined } as TrpcContext["res"],
});

describe("social router", () => {
  it("returns a safe empty feed when the database is unavailable", async () => {
    const result = await appRouter.createCaller(ctx()).social.feed({ limit: 10 });
    expect(result).toEqual([]);
  });

  it("returns accepted for a public follow request without a database", async () => {
    const result = await appRouter.createCaller(ctx({ id: 8 })).social.follow({ userId: 9, isPrivate: false });
    expect(result).toBe("accepted");
  });

  it("rejects invalid settings values at the procedure boundary", async () => {
    await expect(appRouter.createCaller(ctx({ id: 8 })).social.updateSettings({ allowMessages: "invalid" as never })).rejects.toThrow();
  });

  it("requires authentication for write procedures", async () => {
    const caller = appRouter.createCaller(ctx());
    await expect(caller.social.like({ postId: 1 })).rejects.toThrow();
    await expect(caller.social.save({ postId: 1 })).rejects.toThrow();
    await expect(caller.social.comment({ postId: 1, body: "hello" })).rejects.toThrow();
    await expect(caller.social.createStory({ mediaUrl: "https://example.com/story.jpg", mediaType: "image" })).rejects.toThrow();
    await expect(caller.social.report({ reason: "spam" })).rejects.toThrow();
  });

  it("rejects malformed post and profile inputs", async () => {
    const caller = appRouter.createCaller(ctx({ id: 8 }));
    await expect(caller.social.createPost({ media: [], audience: "public", commentsEnabled: true })).rejects.toThrow();
    await expect(caller.social.updateProfile({ username: "x" })).rejects.toThrow();
    await expect(caller.social.updateProfile({ avatarUrl: "ftp://example.com/avatar.png" })).rejects.toThrow();
    await expect(caller.social.createStory({ mediaUrl: "not-a-url", mediaType: "image" })).rejects.toThrow();
  });

  it("validates report and message limits", async () => {
    const caller = appRouter.createCaller(ctx({ id: 8 }));
    await expect(caller.social.report({ reason: "" })).rejects.toThrow();
    await expect(caller.social.comment({ postId: 1, body: "" })).rejects.toThrow();
  });
});
