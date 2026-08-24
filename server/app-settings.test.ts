import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getAppSettings: vi.fn().mockResolvedValue({ id: 1, appName: "Luna Social", tagline: "Find your people under the same sky.", theme: "dark", accentColor: "#a98cff", logoUrl: "/manus-storage/luna-logo_a35d2e32.png", updatedBy: null }),
  updateAppSettings: vi.fn().mockResolvedValue({ id: 1, appName: "Nightline", tagline: "A calmer place to connect.", theme: "light", accentColor: "#ff7ac8", logoUrl: "/manus-storage/luna-logo_a35d2e32.png", updatedBy: 8 }),
}));

vi.mock("./db", () => ({ ...dbMocks }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "user" = "user"): TrpcContext {
  return { user: { id: 8, openId: "app-settings-user", name: "Settings Owner", email: "owner@luna.test", loginMethod: "manus", role, username: "owner", displayName: "Settings Owner", bio: null, website: null, avatarUrl: null, isPrivate: false, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("app settings procedures", () => {
  it("allows public reads and forwards a valid admin update", async () => {
    const publicCaller = appRouter.createCaller(context());
    await expect(publicCaller.social.appSettings()).resolves.toMatchObject({ appName: "Luna Social" });

    const adminCaller = appRouter.createCaller(context("admin"));
    await expect(adminCaller.social.updateAppSettings({ appName: "Nightline", tagline: "A calmer place to connect.", theme: "light", accentColor: "#ff7ac8", logoUrl: "/manus-storage/luna-logo_a35d2e32.png" })).resolves.toMatchObject({ appName: "Nightline", logoUrl: "/manus-storage/luna-logo_a35d2e32.png" });
    expect(dbMocks.updateAppSettings).toHaveBeenCalledWith(8, { appName: "Nightline", tagline: "A calmer place to connect.", theme: "light", accentColor: "#ff7ac8", logoUrl: "/manus-storage/luna-logo_a35d2e32.png" });
  });

  it("blocks non-admin writes and rejects unsafe or empty patches", async () => {
    const userCaller = appRouter.createCaller(context());
    await expect(userCaller.social.updateAppSettings({ appName: "Nope" })).rejects.toThrow("Admin access required");

    const adminCaller = appRouter.createCaller(context("admin"));
    await expect(adminCaller.social.updateAppSettings({ accentColor: "red" as never })).rejects.toThrow();
    await expect(adminCaller.social.updateAppSettings({ logoUrl: "javascript:alert(1)" })).rejects.toThrow();
    await expect(adminCaller.social.updateAppSettings({})).rejects.toThrow();
  });
});

