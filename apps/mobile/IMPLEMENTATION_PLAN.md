# Mobile App — Phased Implementation Plan

This plan breaks the [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) into phases so you can ship incrementally. Each phase is testable on its own. Dependencies are ordered (e.g. API base URL before Generate/Result).

---

## Phase 1: Foundation (Env & API base)

**Goal:** App can call your backend from iOS (and native). New devs know which env vars to set.

**Checklist refs:** 1.1, 1.2, 10.1, 10.2

| Task | Details |
|------|--------|
| Add API base URL helper | Create a small util (e.g. `src/utils/api.js`) that returns the base URL: empty string on web, `process.env.EXPO_PUBLIC_API_URL` (or `EXPO_PUBLIC_BASE_URL`) on native. Use `Platform.OS === 'web'` or a similar check. |
| Use base URL in Generate | In `(tabs)/index.jsx`, build the request URL as `${getApiBaseUrl()}/api/generate-script` (or equivalent). |
| Use base URL in Result | In `result.jsx`, build the remix request URL with the same helper. |
| Create `.env.example` | List all required vars: `EXPO_PUBLIC_API_URL` (or `EXPO_PUBLIC_BASE_URL`), `EXPO_PUBLIC_PROJECT_GROUP_ID`, `EXPO_PUBLIC_HOST`, `EXPO_PUBLIC_PROXY_BASE_URL`, `EXPO_PUBLIC_APP_URL`, and any upload/auth keys. Add a one-line description for each. |
| Update README | Add a “Environment” section that points to `.env.example` and explains how to run against local vs production API. |

**Done when:** Generate and Remix work in native/Expo when `EXPO_PUBLIC_API_URL` is set; README and `.env.example` are in place.

---

## Phase 2: Core flow — Generate & Result

**Goal:** Generate → Result works end-to-end with clear errors and no crashes on bad/missing data.

**Checklist refs:** 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.1, 11.2

| Task | Details |
|------|--------|
| Generate: user-facing errors | In `(tabs)/index.jsx`, on non-OK response or thrown error in `handleGenerate`, call `Alert.alert` (or toast) with a short message (e.g. “Couldn’t generate script. Try again.”). Keep loading state and allow retry. |
| Generate: optional validation | Trim topic; optionally enforce max length and show a hint if over. |
| Result: safe parsing | In `result.jsx`, wrap `JSON.parse(params.scriptData)` in try/catch. On failure, redirect to home (or show a minimal error screen with “Go home”). |
| Result: script data validation | Add a small validator (e.g. `isValidScriptData(scriptData)`) that checks for `topic`, `hooks` (array), `script` (array), `broll` (array), `cta`, `caption`. If invalid after parse, same as parse failure: redirect or error UI. |
| Result: script data in state | Initialize component state from validated `scriptData` (e.g. `useState(scriptData)` in a wrapper that only renders content when valid). All reads/writes use this state, not `params.scriptData`. |
| Result: remix updates UI | In `handleRemixHook`, after a successful remix response, update the script state (e.g. replace the current hook in the hooks array). Do not mutate the param object. |
| Result: remix errors | Ensure every failure path (network error, non-OK response) shows `Alert.alert("Error", "Failed to remix hook")` (or similar). |
| Result: empty hooks/script | Before rendering hooks/script, guard on length. If `hooks.length === 0` or `script.length === 0`, show a message like “No hooks” / “No script” and avoid accessing `selectedHook` or scene index out of bounds. Default `selectedHook` to 0 only when `hooks.length > 0`. |

**Done when:** User can generate a script, see the result, remix a hook and see the new text, and get clear errors on failure; invalid or missing params no longer crash the app.

---

## Phase 3: Library & data safety

**Goal:** Library is safe to use: delete is confirmed, opening a script never crashes.

**Checklist refs:** 4.1, 4.2

| Task | Details |
|------|--------|
| Delete script confirmation | In `(tabs)/library.jsx`, before calling `deleteScript(id)`, show `Alert.alert("Delete script?", "This can't be undone.", [ { text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteScript(id) } ])`. |
| Safe open from Library | When navigating to Result with `script.data`, either: (a) validate `script.data` with the same `isValidScriptData` used in Result and only navigate if valid, or (b) pass the raw data and let Result handle invalid data (redirect/error). Prefer (a) so invalid entries don’t open Result. Optionally show a toast if the script is invalid and skip navigation. |

**Done when:** Deleting a script requires confirmation; opening a saved script never crashes even if data is old or corrupt.

---

## Phase 4: Settings — links & preferences

**Goal:** Terms, Privacy, and “Change preferences” work; Pro is wired or clearly placeholder.

**Checklist refs:** 5.1, 5.2, 5.3, 5.4

| Task | Details |
|------|--------|
| Terms of Service | Add `onPress` to the Terms row: open URL in `expo-web-browser` (e.g. `WebBrowser.openBrowserAsync(TERMS_URL)`). Add a constant or env var for the URL. |
| Privacy Policy | Same as Terms: `onPress` opens Privacy URL in browser. |
| Upgrade to Pro | Either (a) wire to RevenueCat paywall (e.g. `Purchases.presentPaywall()` or your paywall screen), or (b) add `onPress` that navigates to a placeholder “Pro” screen or opens a URL. Document which path you chose. |
| Edit preferences in-place | Option A — Add an “Edit preferences” flow that navigates to onboarding in “edit” mode (e.g. query param or route param). Onboarding in edit mode: prefill niche/style from AsyncStorage, and on “Save” update AsyncStorage + Settings screen and go back without clearing `hasOnboarded`. Option B — Add a modal or second screen in Settings to change niche and style (reuse same options as onboarding), then persist to AsyncStorage. Choose one and implement. |

**Done when:** Terms and Privacy open in browser; Pro either opens paywall/placeholder or is explicitly documented as TODO; users can change niche/style without losing app state.

---

## Phase 5: Onboarding & auth

**Goal:** Onboarding has a back action; auth is discoverable and optionally required for generate.

**Checklist refs:** 6.1, 6.2, 7.1, 7.2, 7.3, 7.4

| Task | Details |
|------|--------|
| Onboarding: Back on step 2 | On step 2, add a “Back” or “Change niche” button that calls `setStep(1)` and optionally `setSelectedStyle(null)`. Place it near the top or bottom so it’s obvious. |
| Onboarding: Skip (optional) | If you want skip: add “Skip for now” that sets `hasOnboarded` to true (and optionally niche/style to “Not set”), then replace to `/(tabs)`. Ensure Settings and Generate handle “Not set” safely. |
| Auth: Sign-in entry | In Settings, add a row “Sign in” / “Account” that calls `signIn()` (or `signUp()`). If already authenticated, show “Sign out” and call `signOut()`. Use `useAuth()` for `isAuthenticated` and auth object. |
| Auth: Require for generate (optional) | If generation should be gated: before calling the API in Generate, check `isAuthenticated`; if false, call `open({ mode: 'signin' })` or show a short message + sign-in button. Same for Remix in Result if desired. |
| Auth: Env docs | In `.env.example` and README, note that `EXPO_PUBLIC_PROJECT_GROUP_ID`, `EXPO_PUBLIC_PROXY_BASE_URL`, and `EXPO_PUBLIC_HOST` are required for auth in web/embedded context. |

**Done when:** User can go back on onboarding step 2; auth is accessible from Settings and optionally required for generate/remix; env is documented.

---

## Phase 6: Theming & presets

**Goal:** Tab bar and not-found respect theme; users can delete presets.

**Checklist refs:** 8.1, 8.2, 9.2

| Task | Details |
|------|--------|
| Tab bar theme | In `(tabs)/_layout.jsx`, use `useTheme()` and set `tabBarStyle.backgroundColor` to `theme.background` or `theme.cardBg`, `tabBarActiveTintColor` to `theme.primary` or `theme.text`, `tabBarInactiveTintColor` to `theme.textSecondary`, and border colors from `theme.border`. Ensure tab bar contrasts in both themes. |
| Not-found theme | In `+not-found.tsx`, use `useTheme()` and replace hardcoded `#fff`, `#111`, `#666`, etc. with `theme.background`, `theme.text`, `theme.textSecondary`, etc. |
| Presets: delete UI | On Generate tab, when showing the preset list: add a way to delete (e.g. long-press or swipe on a preset, or an “Edit” that reveals delete buttons). Call `deletePreset(id)` from presetsStore and refresh the list. Optionally add “Manage presets” in Settings that lists presets with delete. |

**Done when:** Tab bar and not-found match light/dark theme; users can remove presets from the app.

---

## Phase 7: Polish & optional

**Goal:** Better resilience and UX; optional extras for analytics and quality.

**Checklist refs:** 1.4, 11.3, 12.1–12.4

| Task | Details |
|------|--------|
| Global error boundary (optional) | Wrap the root app (e.g. in `_layout.jsx`) in an error boundary that catches render errors and shows a simple “Something went wrong” + “Go back” or “Reload” button. |
| Offline / network state (optional) | Add a small hook or store that detects network status (e.g. `@react-native-community/netinfo`). On Generate/Remix, if offline, show a message instead of calling the API. |
| Pull-to-refresh (optional) | On Library tab, add `RefreshControl` to the ScrollView and trigger `loadScripts()` and `loadFavorites()` on refresh. |
| Haptic feedback (optional) | Use `expo-haptics` (e.g. `Haptics.impactAsync(Light)`) on primary actions: Generate button, Save, Copy, Remix. |
| Analytics (optional) | If you use an analytics provider, add events for: generate started/success/fail, script saved, hook favorited, remix, preset applied. |
| Tests (optional) | Add unit tests for: API base URL helper, `isValidScriptData`, and key store actions (e.g. presets add/delete, favorites add/remove). |

**Done when:** You’ve implemented the optional items you care about; the app feels solid and maintainable.

---

## Phase overview

| Phase | Focus | Rough effort |
|-------|--------|--------------|
| 1 | Foundation (env, API base) | Small |
| 2 | Generate + Result (errors, validation, remix state) | Medium |
| 3 | Library (confirm delete, safe open) | Small |
| 4 | Settings (Terms, Privacy, Pro, edit prefs) | Medium |
| 5 | Onboarding (back) + Auth (entry, optional guard) | Small–medium |
| 6 | Theming (tab bar, not-found) + Presets (delete) | Small |
| 7 | Polish (error boundary, offline, refresh, haptics, tests) | As desired |

**Suggested order:** 1 → 2 → 3 → 4 → 5 → 6 → 7. You can do 4 and 5 in either order; 6 can be done earlier if theming is a priority.

After each phase, run the app (web + native if possible), go through the affected flows, and tick off the corresponding items in [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md).
