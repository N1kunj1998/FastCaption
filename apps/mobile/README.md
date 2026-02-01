# FastCaption Mobile

Expo/React Native app for generating and managing short-form video scripts. **iOS-focused.**

## Setup

```bash
npm install
npm start
```

Then press **`i`** for iOS simulator (or `a` for Android).

## Environment

The app reads configuration from environment variables. **Copy [.env.example](.env.example) to `.env`** and fill in your values.

### Backend / API

The project includes a backend in **`apps/api`** (Node + Express + Ollama/OpenAI). To use it:

1. **Run the API:** In `apps/api`, copy `.env.example` to `.env`, set `OLLAMA_BASE_URL=http://localhost:11434` (for free local AI), then `npm install` and `npm start`.
2. **Point the app at the API:** In this app’s `.env`, set **`EXPO_PUBLIC_API_URL`** to your API base URL, e.g. `http://localhost:3000` or `https://fast-caption.vercel.app` (no trailing slash).
3. **Rebuild after changing `.env`:** `EXPO_PUBLIC_*` is inlined at **build time**. After changing `EXPO_PUBLIC_API_URL`, do a **clean rebuild**: run `npm run ios:clean` (or delete the app from the device/simulator, clear caches, then `npx expo run:ios`).

The app **always** calls the backend for Generate and Remix; there is no mock/dummy data. If the API isn’t configured or reachable, you’ll see an error alert.

**Debugging auth / local API:** To hit your local API, set `EXPO_PUBLIC_API_URL=http://localhost:3000` (simulator) or `http://YOUR_MAC_IP:3000` (physical device; find IP in System Settings → Network). Rebuild after changing. In Metro/terminal you’ll see `[FastCaption Auth]` logs with the URL being called and any fetch errors.

### Auth (sign-in / sign-up) — optional

**Two ways to sign in:**

1. **Sign in with Apple / Google (recommended)**  
   If you do **not** set `EXPO_PUBLIC_PROXY_BASE_URL`, tapping “Sign in” in Settings opens a sheet with:
   - **Sign in with Apple** (iOS only) — works as soon as the API is running with `JWT_SECRET` in `apps/api/.env`.
   - **Sign in with Google** — create an [OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials) (iOS, Android, or Web). Set the same value in:
     - **Mobile:** `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `apps/mobile/.env`
     - **API:** `GOOGLE_CLIENT_ID` in `apps/api/.env`  
     Also set `JWT_SECRET` in `apps/api/.env` (used to sign session JWTs).

2. **WebView auth (proxy)**  
   If you set `EXPO_PUBLIC_PROJECT_GROUP_ID`, `EXPO_PUBLIC_HOST`, and `EXPO_PUBLIC_PROXY_BASE_URL`, the modal shows the WebView flow instead (e.g. Cursor Create/Anything–style). See [.env.example](.env.example).

See [.env.example](.env.example) for all supported variables.

## Scripts

| Command        | Description           |
| -------------- | --------------------- |
| `npm start`    | Start Expo dev server |
| `npm run ios`  | Build and run on iOS simulator |
| `npm run ios:clean` | Clear caches and iOS build, then run iOS (use after changing `EXPO_PUBLIC_API_URL`) |
| `npm run android` | Start with Android |
