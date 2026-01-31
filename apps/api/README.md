# FastCaption API

Backend for the FastCaption iOS app. Exposes script generation and hook remix endpoints. **Uses OpenAI by default when `OPENAI_API_KEY` is set; falls back to Ollama (local) when not.**

---

## Option 1: OpenAI (default)

1. Get an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. In `apps/api/.env`:
   ```bash
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   ```
3. Run the API: `cd apps/api && npm install && npm start`.

If `OPENAI_API_KEY` is set, the API **always** uses OpenAI (Ollama is ignored).

---

## Option 2: Ollama (free, local)

Use this when you don’t have an OpenAI key. The API uses Ollama only when `OPENAI_API_KEY` is **not** set.

1. Install [Ollama](https://ollama.com) and run a model: `ollama run llama3.2`.
2. In `apps/api/.env` (and **do not** set `OPENAI_API_KEY`):
   ```bash
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```
3. Run the API: `npm start`.

---

## Run

```bash
cd apps/api
npm install
npm start
# or with auto-reload:
npm run dev
```

Server runs at **http://localhost:3000** (override with `PORT` in `.env`).

## API docs (Swagger)

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (or your deployed URL + `/api-docs`)
- **OpenAPI JSON:** `GET /api-docs.json`

## Endpoints

| Method | Path | Body / Params | Description |
|--------|------|---------------|-------------|
| GET | `/health` | - | Health check. |
| GET | `/api/script-from-idea` | Query: `idea` (or `text`), optional `duration`, `format` | Generate script from a text idea. |
| POST | `/api/script-from-idea` | `{ idea }` or `{ text }`, optional `duration`, `format` | Same as GET, idea in body. |
| POST | `/api/generate-script` | `{ topic, duration, format? }` | Generates a video script. |
| POST | `/api/remix-hook` | `{ hook, style, topic? }` | Remixes a hook in the given style. |
| POST | `/api/auth/apple` | `{ identityToken }` | Verifies Apple sign-in, returns JWT. |
| POST | `/api/auth/google` | `{ idToken }` or `{ accessToken }` | Verifies Google sign-in, returns JWT. |

## Mobile app

In the mobile app’s `.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For a physical device, use your Mac’s LAN IP (e.g. `http://192.168.1.10:3000`).

## Env vars

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key. When set, **OpenAI is used** (takes precedence over Ollama). |
| `OPENAI_MODEL` | OpenAI model (default: `gpt-4o-mini`). |
| `OLLAMA_BASE_URL` | e.g. `http://localhost:11434`. Used only when `OPENAI_API_KEY` is not set. |
| `OLLAMA_MODEL` | Ollama model (e.g. `llama3.2`). |
| `PORT` | Server port (default: 3000). |

**Priority:** If `OPENAI_API_KEY` is set → use OpenAI. Else if `OLLAMA_BASE_URL` is set → use Ollama.

---

## Deploy to Vercel

1. **From monorepo:** In [Vercel](https://vercel.com), create a new project, import the repo, and set **Root Directory** to `apps/api`.  
   Or from CLI: `cd apps/api && npx vercel`.

2. **Environment variables:** In Vercel → Project → Settings → Environment Variables, add at least:
   - `OPENAI_API_KEY` (for script generation)
   - `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
   - `JWT_SECRET` (for auth; use a long random string)
   - `GOOGLE_CLIENT_ID` (optional; for Google sign-in)

3. Deploy. Your API will be at `https://your-project.vercel.app`. Use that URL (no `/api` prefix) as the mobile app’s base URL, e.g. `EXPO_PUBLIC_API_URL=https://your-project.vercel.app`.

**Note:** Ollama is for local use only; use OpenAI (or another hosted LLM) on Vercel.
