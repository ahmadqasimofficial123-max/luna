import { describe, expect, it } from "vitest";
import { decodeOAuthState, encodeOAuthState } from "../shared/const";

describe("OAuth state", () => {
  it("round-trips the redirect URI and nonce used by the callback guard", () => {
    const state = encodeOAuthState({
      redirectUri: "https://luna.example/api/oauth/callback",
      nonce: "nonce-123",
    });

    expect(decodeOAuthState(state)).toEqual({
      redirectUri: "https://luna.example/api/oauth/callback",
      nonce: "nonce-123",
    });
  });

  it("does not accept malformed state as a valid nonce", () => {
    const decoded = decodeOAuthState("not-valid-json");

    expect(decoded.nonce).toBeUndefined();
    expect(decoded.redirectUri).toBe("");
  });
});
