import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  markNotificationRead: vi.fn().mockResolvedValue({ success: true }),
  hideNotification: vi.fn().mockResolvedValue({ success: true }),
  muteNotificationType: vi.fn().mockResolvedValue({ success: true }),
  updateFollowStatus: vi.fn().mockResolvedValue({ success: true }),
  recordNotificationAction: vi.fn().mockResolvedValue({ success: true, action: "hide" }),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...mocks };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: { id: 1, openId: "notification-success", name: "Tester", email: "tester@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("notification action success paths", () => {
  it("delegates mark-read, hide, and mute actions to persistence helpers", async () => {
    const caller = appRouter.createCaller(createContext());
    await caller.social.markNotificationRead({ notificationId: 7 });
    await caller.social.hideNotification({ notificationId: 7 });
    await caller.social.muteNotification({ notificationType: "comment" });
    expect(mocks.markNotificationRead).toHaveBeenCalledWith(1, 7);
    expect(mocks.hideNotification).toHaveBeenCalledWith(1, 7);
    expect(mocks.muteNotificationType).toHaveBeenCalledWith(1, "comment");
  });

  it("persists the selected action label for a notification", async () => {
    const caller = appRouter.createCaller(createContext());
    await caller.social.recordNotificationAction({ notificationId: 7, action: "hide" });
    expect(mocks.recordNotificationAction).toHaveBeenCalledWith(1, 7, "hide");
  });

  it("delegates approve, decline, and cancel with their intended statuses", async () => {
    const caller = appRouter.createCaller(createContext());
    await caller.social.updateFollowStatus({ actorId: 9, status: "accepted" });
    await caller.social.updateFollowStatus({ actorId: 10, status: "declined" });
    await caller.social.updateFollowStatus({ actorId: 11, status: "cancelled" });
    expect(mocks.updateFollowStatus).toHaveBeenNthCalledWith(1, 1, 9, "accepted");
    expect(mocks.updateFollowStatus).toHaveBeenNthCalledWith(2, 1, 10, "declined");
    expect(mocks.updateFollowStatus).toHaveBeenNthCalledWith(3, 1, 11, "cancelled");
  });
});
