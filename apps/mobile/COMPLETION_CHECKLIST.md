# Mobile App — Completion Checklist

This document lists everything that needs to be completed for the app to be fully functional. Items are grouped by area; **UI present but logic/functionality missing** is called out where relevant.

---

## 1. API & Backend Integration

| # | Item | Status | Notes |
|---|------|--------|--------|
| 1.1 | **Script generation API** | Missing | Generate tab calls the API via `getApiUrl("/api/generate-script")`. For iOS/native, set `EXPO_PUBLIC_API_URL` to your backend base URL; if unset, mock is used. |
| 1.2 | **Remix hook API** | Missing | Result screen calls the API via `getApiUrl("/api/remix-hook")`. Same as above; set `EXPO_PUBLIC_API_URL` for a real backend. |
| 1.3 | **Error handling for API failures** | Incomplete | Generate tab: on failed `response` or thrown error, only `console.error` is used. Add user-visible feedback (e.g. `Alert.alert` or toast) and optional retry. |
| 1.4 | **Loading / offline state** | Incomplete | No global or per-screen handling for network errors or “no connection”. Consider a small network-status helper and UI for “offline” or “request failed”. |

---

## 2. Generate Tab (`(tabs)/index.jsx`)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 2.1 | **Wire script generation to real API** | Missing | Form and “Generate Script” button are wired to `fetch("/api/generate-script")`. Ensure base URL is correct for native (see 1.1) and response shape matches what Result expects (`topic`, `hooks`, `script`, `broll`, `cta`, `caption`). |
| 2.2 | **User feedback on failure** | Missing | On non-OK response or throw, show an alert or toast (e.g. “Couldn’t generate script. Try again.”) instead of only logging. |
| 2.3 | **Optional: validate / sanitize topic** | Low | Consider max length, trim, and basic validation before calling the API. |

---

## 3. Result Screen (`result.jsx`)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 3.1 | **Safe parsing of `scriptData`** | Missing | `scriptData = JSON.parse(params.scriptData)` can throw if params are missing or invalid. Wrap in try/catch and redirect to a safe route (e.g. home) or show an error state. |
| 3.2 | **Validate script data shape** | Missing | Even if JSON parses, ensure `scriptData` has `topic`, `hooks` (array), `script` (array), `broll` (array), `cta`, `caption`. Guard before accessing (e.g. `scriptData?.hooks?.[selectedHook]`) to avoid crashes. |
| 3.3 | **Remix hook: update UI from response** | Bug | `handleRemixHook` does `scriptData.hooks[selectedHook] = data.hook` (mutating route params). React may not re-render. Store script data in component state (e.g. from params on mount) and update that state when remix succeeds so the new hook is shown. |
| 3.4 | **Remix API base URL** | Missing | Same as 1.2: use configurable base URL for `fetch("/api/remix-hook", …)` in native. |
| 3.5 | **Remix error feedback** | Partial | `Alert.alert("Error", "Failed to remix hook")` exists; ensure it’s shown on all failure paths (network error, non-OK response). |
| 3.6 | **Empty / edge data** | Missing | If `hooks` or `script` is empty, current code can crash or show blank. Add fallbacks (e.g. “No hooks” / “No script”) and safe defaults for `selectedHook`. |

---

## 4. Library Tab (`(tabs)/library.jsx`)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 4.1 | **Open saved script safely** | Risk | Navigating to result with `script.data` assumes the saved object matches the expected shape. If old data or corrupt entry, result can crash. Add validation when loading from Library (or in Result) and skip/open with fallback if invalid. |
| 4.2 | **Delete script confirmation** | Missing | `deleteScript` runs immediately. Add `Alert.alert` with “Delete?” / “Cancel” before removing. |
| 4.3 | **Presets in Library** | N/A | Presets are used on Generate tab; Library only shows “Scripts” and “Favorites”. No change needed unless you want presets listed in Library. |

---

## 5. Settings Tab (`(tabs)/settings.jsx`)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 5.1 | **Upgrade to Pro** | Done | “Upgrade to Pro” row has no `onPress`. Wire to paywall/subscription (e.g. RevenueCat `react-native-purchases` already in deps) or to a dedicated “Pro”/pricing screen. |
| 5.2 | **Terms of Service** | Done | `onPress` opens `EXPO_PUBLIC_TERMS_URL` in `expo-web-browser`. |
| 5.3 | **Privacy Policy** | Done | `onPress` opens `EXPO_PUBLIC_PRIVACY_URL` in `expo-web-browser`. |
| 5.4 | **Edit preferences in-place** | Done | “Change preferences” only runs `handleResetOnboarding` (clear onboarding + replace to `/onboarding`). Users cannot edit niche/style without resetting. Add either: (a) in-place editor (modal or screen) for niche/style, or (b) navigate to onboarding in “edit” mode and persist without resetting the rest of the app. |
| 5.5 | **Persist theme** | Done | Theme is persisted via `themeStore` and `loadTheme`; Switch and `setTheme` are wired. No change needed. |

---

## 6. Onboarding (`onboarding.jsx`)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 6.1 | **Back on step 2** | Done | Step 2 (Pick your style) has no way to go back to step 1 (niche). Add a “Back” or “Change niche” button that sets `setStep(1)` (and optionally clears `selectedStyle`). |
| 6.2 | **Skip / optional onboarding** | Done | If you want onboarding to be skippable, add “Skip” and set `hasOnboarded` without requiring niche/style (and handle “Not set” in Settings/Generate). |

---

## 7. Auth

| # | Item | Status | Notes |
|---|------|--------|--------|
| 7.1 | **Auth required for generation?** | Unclear | Root layout uses `useAuth` and waits for `isReady`; no screen currently forces sign-in before generating. Decide whether script generation (and remix) should require auth; if yes, use `useRequireAuth` or a guard on Generate/Result. |
| 7.2 | **Sign-in / Sign-up entry points** | Done | `useAuth()` exposes `signIn` / `signUp` / `signOut`, but no visible button or menu in the main tabs to open auth modal. Add at least one entry (e.g. in Settings: “Sign in” / “Account”) that calls `signIn()` or `signUp()`. |
| 7.3 | **Auth modal** | Env-dependent | AuthWebView uses `EXPO_PUBLIC_PROXY_BASE_URL` and callback URLs; ensure env is set when using auth. |
| 7.4 | **SecureStore / auth key** | Done | `authKey` uses `EXPO_PUBLIC_PROJECT_GROUP_ID`; if unset, auth key may be wrong or shared. Document required env vars. |

---

## 8. Theming & UI Consistency

| # | Item | Status | Notes |
|---|------|--------|--------|
| 8.1 | **Tab bar theme** | Missing | `(tabs)/_layout.jsx` uses hardcoded colors (`#fff`, `#E5E7EB`, `#000000`, `#6B6B6B`). Tab bar doesn’t respect dark/light theme. Use `useTheme()` and set `tabBarStyle`, `tabBarActiveTintColor`, `tabBarInactiveTintColor` (and label/icon colors) from `theme`. |
| 8.2 | **+not-found.tsx** | Hardcoded light | Styles use `#fff`, `#111`, `#666`, etc. Consider using `useTheme()` so the not-found page matches app theme. |

---

## 9. Presets & Favorites

| # | Item | Status | Notes |
|---|------|--------|--------|
| 9.1 | **Presets: name in list** | Data | Preset list shows `preset.name`; when saving from Result, `name` is user-entered. Ensure “Save as Brand Preset” flow (presetName + topic, niche, style) is what you want; no logic change needed if already correct. |
| 9.2 | **Presets: delete** | Missing | `presetsStore` has `deletePreset(id)` but there’s no UI in Generate (or elsewhere) to delete a preset. Add a way to remove presets (e.g. long-press or swipe on preset list, or a “Manage presets” in Settings). |
| 9.3 | **Favorites** | Done | Add/remove and “favorite hooks” in Library are wired to `favoritesStore`. No missing logic identified. |

---

## 10. Environment & Config

| # | Item | Status | Notes |
|---|------|--------|--------|
| 10.1 | **API base URL for native** | Done | `getApiBaseUrl()` and `getApiUrl()` in `src/utils/api.js` use `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_BASE_URL` for iOS/native. |
| 10.2 | **.env.example** | Missing | Document all required env vars: e.g. `EXPO_PUBLIC_BASE_URL`, `EXPO_PUBLIC_PROJECT_GROUP_ID`, `EXPO_PUBLIC_HOST`, `EXPO_PUBLIC_PROXY_BASE_URL`, `EXPO_PUBLIC_APP_URL`, and any upload/auth keys. Create `.env.example` and reference it in README. |

---

## 11. Error Handling & Edge Cases

| # | Item | Status | Notes |
|---|------|--------|--------|
| 11.1 | **Result without scriptData** | Missing | Direct navigation to `/result` without params (or with invalid params) will throw in `JSON.parse`. Guard with try/catch + redirect or error UI. |
| 11.2 | **Empty hooks/script in Result** | Missing | If `scriptData.hooks` is `[]` or `scriptData.script` is `[]`, avoid out-of-bounds access and show a message like “No hooks” / “No script” instead of blank or crash. |
| 11.3 | **Global error boundary** | Optional | Root already has layout; consider a simple error boundary that shows a friendly “Something went wrong” and a way to go back or reload. |

---

## 12. Optional / Polish

| # | Item | Status | Notes |
|---|------|--------|--------|
| 12.1 | **Pull-to-refresh** | Optional | Library tab could support pull-to-refresh for scripts/favorites list. |
| 12.2 | **Haptic feedback** | Optional | Add light haptics on primary actions (e.g. Generate, Save, Copy). |
| 12.3 | **Analytics / logging** | Optional | If you need analytics, add events for generate, save, remix, open from library, etc. |
| 12.4 | **Tests** | Minimal | `__tests__/` has README only. Add unit tests for stores and key flows (e.g. generate request shape, result validation). |

---

## Summary Table

| Area | UI present, logic missing | Logic partial / bug | Done |
|------|---------------------------|----------------------|------|
| API & backend | Base URL, error UX | - | - |
| Generate | - | Error feedback | Form + loading |
| Result | - | Remix state, validation, safe parse | Copy, save, favorite, preset |
| Library | - | Delete confirm, safe open | List, delete, open |
| Settings | Pro, Terms, Privacy, edit prefs | - | Theme, reset onboarding |
| Onboarding | Back button step 2 | - | Steps, persist |
| Auth | Sign-in entry, optional require | - | Store, modal, SecureStore |
| Theme | Tab bar, not-found | - | Screens, theme store |
| Presets | Delete preset UI | - | Save, load, apply |
| Env | API URL, .env.example | - | - |

Use this checklist to implement missing logic and fix bugs so the app is fully runnable and consistent end-to-end.
