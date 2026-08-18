import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  promoteSelectedUser: vi.fn().mockResolvedValue({ success: true, userId: 22 }),
  updateProfile: vi.fn().mockResolvedValue({ success: true, notifiedFollowers: 2 }),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...mocks };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { buildAdminPromotionNotification, buildProfileUpdateNotifications } from "./db";

const context = (role: "admin" | "user" = "user"): TrpcContext => ({
  user: { id: 7, openId: "profile-admin-test", name: "Luna Member", email: "member@luna.test", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("profile and admin targeting contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates dedicated profile-update events only for distinct accepted followers", () => {
    expect(buildProfileUpdateNotifications(10, [2, 3, 10, 2])).toEqual([
      { recipientId: 2, actorId: 10, type: "profile_update", entityId: 10 },
      { recipientId: 3, actorId: 10, type: "profile_update", entityId: 10 },
    ]);
  });

  it("targets an admin-promotion notification at the selected account", () => {
    expect(buildAdminPromotionNotification(1, 22)).toEqual({ recipientId: 22, actorId: 1, type: "message", entityId: 22 });
  });

  it("passes the selected user id through the admin-only promotion procedure", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await caller.social.promoteUser({ userId: 22 });
    expect(mocks.promoteSelectedUser).toHaveBeenCalledWith(7, 22);
  });

  it("forbids non-admins from promoting any account", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.social.promoteUser({ userId: 22 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.promoteSelectedUser).not.toHaveBeenCalled();
  });

  it("passes profile edits through with the authenticated account id", async () => {
    const caller = appRouter.createCaller(context("user"));
    await caller.social.updateProfile({ displayName: "Updated Luna" });
    expect(mocks.updateProfile).toHaveBeenCalledWith(7, { displayName: "Updated Luna" });
  });
});
