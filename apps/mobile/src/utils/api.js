import { Platform } from "react-native";

/**
 * Returns the base URL for API requests.
 * - On web: empty string so relative URLs work when served from the same origin as your API.
 * - On native (iOS/Android): use EXPO_PUBLIC_API_URL or EXPO_PUBLIC_BASE_URL to call your backend.
 */
export function getApiBaseUrl() {
  if (Platform.OS === "web") {
    return "";
  }
  const base =
    process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BASE_URL || "";
  return base.replace(/\/$/, "");
}

/**
 * Builds a full API URL for the given path.
 * @param {string} path - Path with or without leading slash (e.g. "/api/generate-script" or "api/generate-script")
 * @returns {string} Full URL for fetch()
 */
export function getApiUrl(path) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return base + normalizedPath;
}

/**
 * When true, the app would use mock API (disabled: we always call the real backend or throw).
 */
export function useMockApi() {
  if (process.env.EXPO_PUBLIC_USE_MOCK_API === "true") return true;
  if (Platform.OS !== "web" && !getApiBaseUrl()) return true;
  return false;
}

const BACKEND_REQUIRED_MSG =
  "Backend not configured. In apps/mobile/.env set EXPO_PUBLIC_API_URL=http://localhost:3000 and run the API (apps/api).";

/**
 * Validates that an object has the shape expected for script data from the API.
 * @param {unknown} data
 * @returns {data is { topic: string, hooks: string[], script: { text: string, onScreenText?: string }[], broll: string[], cta: string, caption: string }}
 */
export function isValidScriptData(data) {
  if (!data || typeof data !== "object") return false;
  const d = data;
  return (
    typeof d.topic === "string" &&
    Array.isArray(d.hooks) &&
    Array.isArray(d.script) &&
    Array.isArray(d.broll) &&
    typeof d.cta === "string" &&
    typeof d.caption === "string" &&
    d.script.every(
      (s) => s && typeof s === "object" && typeof s.text === "string"
    )
  );
}

/**
 * Generate script: calls real API. No mock — requires backend.
 * @param {{ topic: string, duration: number, format: string }} payload
 * @returns {Promise<{ topic: string, hooks: string[], script: { text: string, onScreenText?: string }[], broll: string[], cta: string, caption: string }>}
 */
export async function generateScript(payload) {
  const url = getApiUrl("/api/generate-script");
  if (useMockApi()) {
    throw new Error(BACKEND_REQUIRED_MSG);
  }
  console.log("[FastCaption] Calling backend: POST /api/generate-script", url);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const msg = e?.message || String(e);
    if (msg.includes("fetch") || msg.includes("connect") || msg.includes("network")) {
      throw new Error(
        `Could not reach the server at ${url}. On a physical device, use a deployed API URL (e.g. https://fast-caption.vercel.app) in .env and rebuild the app.`
      );
    }
    throw e;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate script");
  }
  return res.json();
}

/**
 * Remix hook: calls real API. No mock — requires backend.
 * @param {{ hook: string, style: string, topic: string }} payload
 * @returns {Promise<{ hook: string }>}
 */
export async function remixHook(payload) {
  const url = getApiUrl("/api/remix-hook");
  if (useMockApi()) {
    throw new Error(BACKEND_REQUIRED_MSG);
  }
  console.log("[FastCaption] Calling backend: POST /api/remix-hook", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to remix hook");
  }
  return res.json();
}

/**
 * Sign in with Apple: exchange identityToken for app JWT + user.
 * @param {string} identityToken - From AppleAuthentication.signInAsync()
 * @returns {Promise<{ jwt: string, user: { id: string, email?: string, provider: string } }>}
 */
export async function authWithApple(identityToken) {
  const url = getApiUrl("/api/auth/apple");
  if (useMockApi()) {
    throw new Error(BACKEND_REQUIRED_MSG);
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identityToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Apple sign-in failed");
  }
  return res.json();
}

/**
 * Sign in with Google: exchange idToken or accessToken for app JWT + user.
 * @param {{ idToken?: string, accessToken?: string }} tokens
 * @returns {Promise<{ jwt: string, user: { id: string, email?: string, provider: string } }>}
 */
export async function authWithGoogle(tokens) {
  const url = getApiUrl("/api/auth/google");
  if (useMockApi()) {
    throw new Error(BACKEND_REQUIRED_MSG);
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Google sign-in failed");
  }
  return res.json();
}
