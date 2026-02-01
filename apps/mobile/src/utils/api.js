import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Returns the base URL for script/auth API requests.
 * - On web: empty string so relative URLs work when served from the same origin as your API.
 * - On native: from app.config.js extra.apiUrl (loaded from .env) or EXPO_PUBLIC_API_URL.
 */
export function getApiBaseUrl() {
  if (Platform.OS === "web") {
    return "";
  }
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  const fromEnv = process.env.EXPO_PUBLIC_API_URL || "";
  const base = (typeof fromExtra === "string" ? fromExtra : fromEnv) || "";
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
    const msg = (e?.message || String(e)).toLowerCase();
    const isNetworkError =
      msg.includes("fetch") ||
      msg.includes("connect") ||
      msg.includes("network") ||
      msg.includes("failed") ||
      msg.includes("could not");
    if (isNetworkError) {
      throw new Error(
        `Could not connect. API: ${url}. Set EXPO_PUBLIC_API_URL in apps/mobile/.env and do a clean rebuild (see README).`
      );
    }
    throw e;
  }
  if (!res.ok) {
    const body = await res.text();
    let errMsg = `Server error (${res.status})`;
    try {
      const err = JSON.parse(body);
      if (err?.error) errMsg = err.error;
    } catch (_) {
      if (body && body.length < 200) errMsg = body;
    }
    throw new Error(errMsg);
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
 * @param {string | null} [name] - User's full name from credential.fullName (Apple only sends name in credential, not in JWT)
 * @returns {Promise<{ jwt: string, user: { id: string, email?: string, provider: string } }>}
 */
export async function authWithApple(identityToken, name = null) {
  const url = getApiUrl("/api/auth/apple");
  const baseUrl = getApiBaseUrl();
  console.log("[FastCaption Auth] API base URL:", baseUrl || "(none - set EXPO_PUBLIC_API_URL in .env)");
  console.log("[FastCaption Auth] POST /api/auth/apple →", url);
  if (useMockApi()) {
    console.warn("[FastCaption Auth] useMockApi is true, backend not configured");
    throw new Error(BACKEND_REQUIRED_MSG);
  }
  const body = { identityToken };
  if (name) body.name = name;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("[FastCaption Auth] Apple sign-in fetch failed:", e?.message ?? e, "| URL:", url);
    throw e;
  }
  console.log("[FastCaption Auth] Apple response status:", res.status, res.ok ? "OK" : "error");
  if (!res.ok) {
    const body = await res.text();
    let errMsg = "Apple sign-in failed";
    try {
      const err = JSON.parse(body);
      if (err?.error) errMsg = err.error;
    } catch (_) {}
    console.error("[FastCaption Auth] Apple sign-in error:", res.status, body?.slice(0, 200));
    throw new Error(errMsg);
  }
  const data = await res.json();
  console.log("[FastCaption Auth] Apple sign-in success, user id:", data?.user?.id);
  return data;
}

/**
 * Sign in with Google: exchange idToken or accessToken for app JWT + user.
 * @param {{ idToken?: string, accessToken?: string }} tokens
 * @returns {Promise<{ jwt: string, user: { id: string, email?: string, provider: string } }>}
 */
export async function authWithGoogle(tokens) {
  const url = getApiUrl("/api/auth/google");
  const baseUrl = getApiBaseUrl();
  console.log("[FastCaption Auth] API base URL:", baseUrl || "(none - set EXPO_PUBLIC_API_URL in .env)");
  console.log("[FastCaption Auth] POST /api/auth/google →", url);
  if (useMockApi()) {
    console.warn("[FastCaption Auth] useMockApi is true, backend not configured");
    throw new Error(BACKEND_REQUIRED_MSG);
  }
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens),
    });
  } catch (e) {
    console.error("[FastCaption Auth] Google sign-in fetch failed:", e?.message ?? e, "| URL:", url);
    throw e;
  }
  console.log("[FastCaption Auth] Google response status:", res.status, res.ok ? "OK" : "error");
  if (!res.ok) {
    const body = await res.text();
    let errMsg = "Google sign-in failed";
    try {
      const err = JSON.parse(body);
      if (err?.error) errMsg = err.error;
    } catch (_) {}
    console.error("[FastCaption Auth] Google sign-in error:", res.status, body?.slice(0, 200));
    throw new Error(errMsg);
  }
  const data = await res.json();
  console.log("[FastCaption Auth] Google sign-in success, user id:", data?.user?.id);
  return data;
}

/**
 * Get trial status for the current user (one trial per account).
 * @param {string} jwt - App JWT from auth
 * @returns {Promise<{ trialStartDate: string | null, usageToday: { date: string, count: number } }>}
 */
export async function getTrialStatus(jwt) {
  const url = getApiUrl("/api/trial");
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get trial status");
  }
  return res.json();
}

/**
 * Start trial for the current user (idempotent; only sets if not already started).
 * @param {string} jwt - App JWT from auth
 * @returns {Promise<{ trialStartDate: string }>}
 */
export async function startTrial(jwt) {
  const url = getApiUrl("/api/trial/start");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to start trial");
  }
  return res.json();
}

/**
 * Increment generation count for today (per-account).
 * @param {string} jwt - App JWT from auth
 * @returns {Promise<{ date: string, count: number }>}
 */
export async function incrementTrialUsageApi(jwt) {
  const url = getApiUrl("/api/trial/increment");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to record usage");
  }
  return res.json();
}
