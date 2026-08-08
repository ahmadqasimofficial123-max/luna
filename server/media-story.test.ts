import { beforeEach, describe, expect, it, vi } from "vitest";

const { createPostMock, createStoryMock, reactToStoryMock, replyToStoryMock, storagePutMock } = vi.hoisted(() => ({
  createPostMock: vi.fn().mockResolvedValue(321),
  createStoryMock: vi.fn().mockResolvedValue({ id: 654, expiresAt: new Date("2030-01-01T00:00:00.000Z") }),
  reactToStoryMock: vi.fn().mockResolvedValue({ success: true }),
  replyToStoryMock: vi.fn().mockResolvedValue({ success: true }),
  storagePutMock: vi.fn().mockResolvedValue({ key: "posts/night.jpg", url: "https://cdn.example.test/night.jpg" }),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, createPost: createPostMock, createStory: createStoryMock, reactToStory: reactToStoryMock, replyToStory: replyToStoryMock };
});
vi.mock("./storage", async () => {
  const actual = await vi.importActual<typeof import("./storage")>("./storage");
  return { ...actual, storagePut: storagePutMock };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function authContext(): TrpcContext {
  return {
    user: { id: 7, openId: "media-test", name: "Media Tester", email: "media@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("media and story contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uploads media through the storage procedure", async () => {
    const caller = appRouter.createCaller(authContext());
    const result = await caller.media.upload({ filename: "night.jpg", contentType: "image/jpeg", data: "aGVsbG8=" });
    expect(result.url).toBe("https://cdn.example.test/night.jpg");
    expect(storagePutMock).toHaveBeenCalledOnce();
  });

  it("passes structured post metadata and media dimensions to the creator", async () => {
    const caller = appRouter.createCaller(authContext());
    await expect(caller.social.createPost({ caption: "A night walk", hashtags: "#night,#luna", mentions: "@maya", location: "Moon Bay", audience: "public", commentsEnabled: true, media: [{ url: "https://cdn.example.test/night.jpg", mediaType: "image", width: 1200, height: 900 }] })).resolves.toBe(321);
    expect(createPostMock).toHaveBeenCalledWith(7, expect.objectContaining({ hashtags: "#night,#luna", mentions: "@maya", media: [expect.objectContaining({ width: 1200, height: 900 })] }));
  });

  it("returns persisted story identity and expiry on creation", async () => {
    const caller = appRouter.createCaller(authContext());
    await expect(caller.social.createStory({ mediaUrl: "https://cdn.example.test/story.jpg", mediaType: "image", caption: "Tonight" })).resolves.toEqual({ id: 654, expiresAt: new Date("2030-01-01T00:00:00.000Z") });
    expect(createStoryMock).toHaveBeenCalledWith(7, "https://cdn.example.test/story.jpg", "image", "Tonight");
  });

  it("validates media and story inputs and covers story success paths", async () => {
    const caller = appRouter.createCaller(authContext());
    await expect(caller.social.createPost({ caption: "Missing media", audience: "public", commentsEnabled: true, media: [] })).rejects.toThrow();
    await expect(caller.social.reactStory({ storyId: 4, reaction: "star" })).resolves.toEqual({ success: true });
    await expect(caller.social.replyStory({ storyId: 4, body: "Beautiful moment." })).resolves.toEqual({ success: true });
    await expect(caller.social.reactStory({ storyId: 0, reaction: "star" })).rejects.toThrow();
    await expect(caller.social.replyStory({ storyId: 4, body: "" })).rejects.toThrow();
    expect(reactToStoryMock).toHaveBeenCalledWith(7, 4, "star");
    expect(replyToStoryMock).toHaveBeenCalledWith(7, 4, "Beautiful moment.");
  });
});
