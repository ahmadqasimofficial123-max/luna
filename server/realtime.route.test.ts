import { createServer } from "node:http";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

const sdkMocks = vi.hoisted(() => ({ authenticateRequest: vi.fn() }));
const dbMocks = vi.hoisted(() => ({ getDb: vi.fn(), listMessages: vi.fn() }));

vi.mock("./_core/sdk", () => ({ sdk: sdkMocks }));
vi.mock("./db", () => ({ getDb: dbMocks.getDb, listMessages: dbMocks.listMessages }));

import { registerRealtimeRoutes } from "./realtime";

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))); });

async function requestRealtime() {
  const app = express();
  registerRealtimeRoutes(app);
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not expose a port");
  return fetch(`http://127.0.0.1:${address.port}/api/realtime/messages/42`);
}

describe("realtime message route", () => {
  it("rejects an authenticated non-member with 403 before opening a stream", async () => {
    sdkMocks.authenticateRequest.mockResolvedValue({ id: 77 });
    dbMocks.getDb.mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }) });

    const response = await requestRealtime();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "You are not a member of this conversation" });
    expect(dbMocks.listMessages).not.toHaveBeenCalled();
  });
});

