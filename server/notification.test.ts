import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "notification-test-user",
      name: "Notification Tester",
      email: "notification@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("notification action contracts", () => {
  it("rejects invalid notification identifiers", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.social.markNotificationRead({ notificationId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.social.hideNotification({ notificationId: -1 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unsupported follow-request status values", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.social.updateFollowStatus({ actorId: 2, status: "blocked" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
