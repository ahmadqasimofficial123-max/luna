import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createPost: vi.fn().mockResolvedValue(42),
  toggleLike: vi.fn().mockResolvedValue(true),
  toggleSave: vi.fn().mockResolvedValue(true),
  addComment: vi.fn().mockResolvedValue(undefined),
  createStory: vi.fn().mockResolvedValue(undefined),
  listStories: vi.fn().mockResolvedValue([{ story: { id: 1 }, author: { id: 8 } }]),
  createReport: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockResolvedValue({ userId: 8, theme: "dark" }),
  updateSettings: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./db", () => ({ ...dbMocks, getFeed: vi.fn().mockResolvedValue([]), getProfile: vi.fn(), followUser: vi.fn(), toggleBlock: vi.fn(), toggleMute: vi.fn(), listMessages: vi.fn(), listNotifications: vi.fn() }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (): TrpcContext => ({ user: { id: 8, openId: "success-user", name: "Success User", email: "success@luna.test", loginMethod: "manus", role: "user", username: "success_user", displayName: "Success User", bio: null, website: null, avatarUrl: null, isPrivate: false, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("social success paths", () => {
  beforeEach(() => vi.clearAllMocks());
  it("creates posts and toggles likes, saves, and comments", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.social.createPost({ caption: "A night worth remembering", audience: "public", commentsEnabled: true, media: [{ url: "https://example.com/photo.jpg", mediaType: "image" }] })).resolves.toBe(42);
    await expect(caller.social.like({ postId: 42 })).resolves.toBe(true);
    await expect(caller.social.save({ postId: 42 })).resolves.toBe(true);
    await expect(caller.social.comment({ postId: 42, body: "Beautiful moment" })).resolves.toBeUndefined();
    expect(dbMocks.createPost).toHaveBeenCalled();
    expect(dbMocks.addComment).toHaveBeenCalledWith(8, 42, "Beautiful moment", undefined);
  });
  it("creates and lists stories and records reports", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.social.createStory({ mediaUrl: "https://example.com/story.jpg", mediaType: "image", caption: "Tonight" })).resolves.toBeUndefined();
    await expect(caller.social.stories()).resolves.toHaveLength(1);
    await expect(caller.social.report({ postId: 42, reason: "spam", details: "Unwanted promotion" })).resolves.toBeUndefined();
    expect(dbMocks.createStory).toHaveBeenCalledWith(8, "https://example.com/story.jpg", "image", "Tonight");
    expect(dbMocks.createReport).toHaveBeenCalledWith(8, { postId: 42, reason: "spam", details: "Unwanted promotion" });
  });
  it("updates profile and settings through persistence helpers", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.social.updateProfile({ displayName: "Updated Luna Member", bio: "Orbiting thoughtfully.", avatarUrl: "/manus-storage/8/profile/avatar.png" })).resolves.toBeUndefined();
    await expect(caller.social.settings()).resolves.toMatchObject({ theme: "dark" });
    await expect(caller.social.updateSettings({ theme: "light", pushNotifications: false })).resolves.toBeUndefined();
    expect(dbMocks.updateProfile).toHaveBeenCalledWith(8, { displayName: "Updated Luna Member", bio: "Orbiting thoughtfully.", avatarUrl: "/manus-storage/8/profile/avatar.png" });
    expect(dbMocks.updateSettings).toHaveBeenCalledWith(8, { theme: "light", pushNotifications: false });
  });
});
