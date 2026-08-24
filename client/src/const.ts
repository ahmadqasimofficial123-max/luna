import { OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_FALLBACK, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It has SIDE EFFECTS — it mints a one-time nonce, writes the __Host- state
// cookie, and navigates immediately — so the cookie nonce always matches the
// `state` it sends. Do NOT call it during render (no `href={startLogin()}` /
// `loginUrl={...}`): each call overwrites the cookie, so a stray render-phase
// call would desync it from an in-flight login and the callback would reject it
// with "invalid oauth state". It returns void by design, so there is no URL to
// stash across renders.
export const startLogin = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  const isHttps = window.location.protocol === "https:";
  const stateCookieName = isHttps ? OAUTH_STATE_COOKIE : OAUTH_STATE_COOKIE_FALLBACK;
  // The WebDev preview runs the app inside a management iframe. Partitioned
  // cookies let that embedded context retain the one-time nonce without
  // falling back to an unsafe state-only redirect.
  const cookieAttributes = isHttps ? "; Path=/; Max-Age=600; SameSite=None; Secure; Partitioned" : "; Path=/; Max-Age=600; SameSite=Lax";
  document.cookie = `${stateCookieName}=${nonce}${cookieAttributes}`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
};
