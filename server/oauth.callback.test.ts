import { describe, expect, it } from "vitest";
import { validateOAuthState } from "./_core/oauth";
import { OAUTH_STATE_COOKIE, encodeOAuthState } from "../shared/const";

describe("OAuth callback state validation", () => {
  const state = encodeOAuthState({
    redirectUri: "https://luna.example/api/oauth/callback",
    nonce: "nonce-456",
  });

  it("accepts a callback when the browser cookie matches state.nonce", () => {
    const req = { headers: { cookie: `${OAUTH_STATE_COOKIE}=nonce-456` } } as never;
    expect(validateOAuthState(req, state)).toBe(true);
  });

  it("rejects a callback when the browser cookie is missing or mismatched", () => {
    const missing = { headers: {} } as never;
    const mismatched = { headers: { cookie: `${OAUTH_STATE_COOKIE}=other` } } as never;

    expect(validateOAuthState(missing, state)).toBe(false);
    expect(validateOAuthState(mismatched, state)).toBe(false);
  });
});
