import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { OAuth2Client } from "google-auth-library";
import OpenAI from "openai";
import swaggerUi from "swagger-ui-express";
import { upsertUser, getTrial, ensureTrialStart, incrementTrialUsage, ensureUserIndexes, mergeDuplicateUsersByEmail, TRIAL_DAYS, DAILY_LIMIT_TRIAL } from "./db.js";

const app = express();
const port = process.env.PORT || 3000;

// Provider: OpenAI (preferred when key is set) or Ollama (fallback, local).
const openaiApiKey = process.env.OPENAI_API_KEY || "";
const useOpenAI = openaiApiKey.length > 0;

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
const useOllama = !useOpenAI && ollamaBaseUrl.length > 0;

const openai = useOpenAI ? new OpenAI({ apiKey: openaiApiKey }) : null;
const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const bodySummary =
    req.method === "POST" && req.body && Object.keys(req.body).length > 0
      ? ` body=${JSON.stringify(req.body).slice(0, 120)}...`
      : "";
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}${bodySummary}`);
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

const formatInstructions = {
  mistakes:
    'Structure as "3 mistakes" format. Start with common mistakes people make, then reveal the right way.',
  myth: 'Structure as "Myth vs Truth" format. Debunk a common misconception with the real truth.',
  dothis:
    'Structure as "Do this, NOT that" format. Show contrast between wrong and right approach.',
  story:
    'Structure as a "Storytime" format. Tell a compelling personal story or case study.',
  pov: 'Structure as a "POV skit" format. Use point-of-view perspective, make it relatable and entertaining.',
  beforeafter:
    'Structure as "Before/After" format. Show transformation or results clearly.',
  general: "Use the most engaging format for this topic.",
};

const stylePrompts = {
  controversial:
    "Make this hook MORE controversial and debate-sparking. Push boundaries while staying authentic.",
  shorter:
    "Make this hook SHORTER and more punchy. Cut it down to 5-8 words maximum.",
  emotional:
    "Make this hook MORE emotional and relatable. Touch hearts, create empathy.",
  premium:
    "Make this hook sound MORE premium and aspirational. Appeal to high-achievers.",
  curiosity:
    "Make this hook MORE curiosity-driven. Create an irresistible knowledge gap.",
  lessSalesy:
    "Make this hook LESS salesy and more authentic. Sound like a friend sharing advice.",
};

/**
 * Call LLM: OpenAI (preferred) or Ollama. Returns the assistant message content.
 */
async function chat(messages, { formatJson = false } = {}) {
  if (useOpenAI && openai) {
    console.log(`[OpenAI] Calling API (model: ${openaiModel}, formatJson: ${formatJson})`);
    const start = Date.now();
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages,
      ...(formatJson ? { response_format: { type: "json_object" } } : {}),
    });
    const content = completion.choices[0]?.message?.content ?? "";
    const elapsed = Date.now() - start;
    console.log(`[OpenAI] Response OK in ${elapsed}ms, content length: ${content?.length ?? 0}`);
    return content;
  }

  if (useOllama) {
    const url = `${ollamaBaseUrl.replace(/\/$/, "")}/api/chat`;
    const body = {
      model: ollamaModel,
      messages,
      stream: false,
      ...(formatJson ? { format: "json" } : {}),
    };
    console.log(`[Ollama] Calling ${url} (model: ${ollamaModel}, formatJson: ${formatJson})`);
    const start = Date.now();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const elapsed = Date.now() - start;
    if (!res.ok) {
      const text = await res.text();
      console.error(`[Ollama] Error ${res.status} after ${elapsed}ms:`, text?.slice(0, 200));
      throw new Error(`Ollama error ${res.status}: ${text || res.statusText}`);
    }
    const data = await res.json();
    const content = data.message?.content ?? "";
    console.log(`[Ollama] Response OK in ${elapsed}ms, content length: ${content?.length ?? 0}`);
    return content;
  }

  throw new Error(
    "No LLM configured. Set OPENAI_API_KEY for OpenAI, or OLLAMA_BASE_URL (e.g. http://localhost:11434) for local Ollama."
  );
}

function parseJsonContent(content) {
  const raw = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(raw);
}

/**
 * Generate script data from topic/idea, duration, and format. Shared by generate-script and script-from-idea.
 */
async function generateScriptData(topic, duration = 60, format = "general") {
  const systemPrompt = `You are an expert short-form video script writer specializing in viral TikTok and Instagram Reels content. Your scripts are engaging, hook-driven, and optimized for ${duration}-second videos.

${formatInstructions[format] || formatInstructions.general}

Generate a complete video script package including:
1. 5 different hook variations (first 3 seconds that grab attention)
2. Scene-by-scene script breakdown with voiceover text
3. On-screen text suggestions for each scene
4. B-roll shot ideas
5. A strong call-to-action
6. An engaging caption with hashtags

Make the content punchy, authentic, and designed to stop the scroll.`;

  const userPrompt = `Create a ${duration}-second video script about: ${topic}

Return the response in this exact JSON structure (no markdown, no code block):
{
  "topic": "${String(topic).replace(/"/g, '\\"')}",
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "script": [
    {
      "text": "voiceover text for this scene",
      "onScreenText": "text overlay for this scene"
    }
  ],
  "broll": ["b-roll idea 1", "b-roll idea 2", "b-roll idea 3"],
  "cta": "call to action text",
  "caption": "engaging caption with hashtags"
}`;

  const content = await chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { formatJson: true }
  );

  if (!content) {
    throw new Error("No content in LLM response");
  }

  const scriptData = parseJsonContent(content);

  if (
    !scriptData.topic ||
    !Array.isArray(scriptData.hooks) ||
    !Array.isArray(scriptData.script) ||
    !Array.isArray(scriptData.broll) ||
    scriptData.cta == null ||
    scriptData.caption == null
  ) {
    throw new Error("Invalid script shape from LLM");
  }

  return scriptData;
}

app.post("/api/generate-script", async (req, res) => {
  try {
    const { topic, duration, format = "general" } = req.body;
    console.log(`[generate-script] Request: topic="${topic}", duration=${duration}, format=${format}`);

    if (!topic || !duration) {
      console.log("[generate-script] Rejected: missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`[generate-script] Calling LLM (OpenAI: ${useOpenAI}, Ollama: ${useOllama})...`);
    const scriptData = await generateScriptData(topic, duration, format);
    console.log(`[generate-script] Success: ${scriptData.hooks?.length ?? 0} hooks, ${scriptData.script?.length ?? 0} scenes`);
    return res.json(scriptData);
  } catch (error) {
    console.error("[generate-script] Error:", error.message || error);
    const status = error.status === 400 ? 400 : 500;
    const message = status === 400 ? error.message : "Failed to generate script";
    return res.status(status).json({ error: message });
  }
});

// Idea → script: pass text idea as query param (GET) or body (POST). Returns same script shape.
app.get("/api/script-from-idea", async (req, res) => {
  try {
    const idea = req.query.idea ?? req.query.text ?? "";
    const duration = Number(req.query.duration) || 60;
    const format = req.query.format || "general";
    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return res.status(400).json({ error: "Missing required parameter: idea (or text)" });
    }
    console.log(`[script-from-idea] GET idea="${idea.slice(0, 60)}...", duration=${duration}, format=${format}`);
    const scriptData = await generateScriptData(idea.trim(), duration, format);
    console.log(`[script-from-idea] Success: ${scriptData.hooks?.length ?? 0} hooks`);
    return res.json(scriptData);
  } catch (error) {
    console.error("[script-from-idea] Error:", error.message || error);
    return res.status(500).json({ error: error.message || "Failed to generate script from idea" });
  }
});

app.post("/api/script-from-idea", async (req, res) => {
  try {
    const { idea, text, duration = 60, format = "general" } = req.body || {};
    const topic = (idea ?? text ?? "").trim();
    if (!topic) {
      return res.status(400).json({ error: "Missing required field: idea or text" });
    }
    const dur = Number(duration) || 60;
    const fmt = format || "general";
    console.log(`[script-from-idea] POST idea="${topic.slice(0, 60)}...", duration=${dur}, format=${fmt}`);
    const scriptData = await generateScriptData(topic, dur, fmt);
    console.log(`[script-from-idea] Success: ${scriptData.hooks?.length ?? 0} hooks`);
    return res.json(scriptData);
  } catch (error) {
    console.error("[script-from-idea] Error:", error.message || error);
    return res.status(500).json({ error: error.message || "Failed to generate script from idea" });
  }
});

app.post("/api/remix-hook", async (req, res) => {
  try {
    const { hook, style, topic } = req.body;
    console.log(`[remix-hook] Request: style=${style}, hook length=${hook?.length ?? 0}`);

    if (!hook || !style) {
      console.log("[remix-hook] Rejected: missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const stylePrompt = stylePrompts[style] || "Improve this hook while keeping the same intent.";
    console.log(`[remix-hook] Calling LLM (OpenAI: ${useOpenAI}, Ollama: ${useOllama})...`);

    const systemPrompt = `You are an expert short-form video hook writer. Your job is to take an existing hook and remix it according to a specific style direction.

Original hook: "${hook}"
Topic context: "${topic || ""}"
Style direction: ${stylePrompt}

Return ONLY the remixed hook text, nothing else. Keep it concise and powerful.`;

    const content = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Remix the hook now." },
    ]);

    const remixedHook = (content || hook).trim();
    console.log(`[remix-hook] Success, length: ${remixedHook.length}`);
    return res.json({ hook: remixedHook });
  } catch (error) {
    console.error("[remix-hook] Error:", error.message || error);
    return res.status(500).json({ error: "Failed to remix hook" });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// -----------------------------------------------------------------------------
// Swagger / OpenAPI (spec as plain object to avoid reserved-word/parse issues)
// -----------------------------------------------------------------------------
const scriptFromIdeaParams = [
  { name: "idea", in: "query", required: true, schema: { type: "string" }, description: "Text idea for the video (alias: text)" },
  { name: "duration", in: "query", schema: { type: "integer", "default": 60 }, description: "Video duration in seconds" },
  { name: "format", in: "query", schema: { type: "string", enum: ["mistakes", "myth", "dothis", "story", "pov", "beforeafter", "general"], "default": "general" } }
];

const openApiSpec = {
  openapi: "3.0.0",
  info: { title: "FastCaption API", version: "1.0.0", description: "API for script generation, hook remix, and auth." },
  servers: [{ url: "/", description: "Current host" }],
  paths: {
    "/health": { get: { summary: "Health check", responses: { 200: { description: "OK" } } } },
    "/api/generate-script": { post: { summary: "Generate video script", responses: { 200: { description: "Script data" } } } },
    "/api/script-from-idea": {
      get: { summary: "Generate script from idea (query)", parameters: scriptFromIdeaParams, responses: { 200: { description: "Script data" } } },
      post: { summary: "Generate script from idea (body)", responses: { 200: { description: "Script data" } } },
    },
    "/api/remix-hook": { post: { summary: "Remix hook", responses: { 200: { description: "Remixed hook" } } } },
    "/api/auth/apple": { post: { summary: "Apple sign-in", responses: { 200: { description: "jwt, user" } } } },
    "/api/auth/google": { post: { summary: "Google sign-in", responses: { 200: { description: "jwt, user" } } } },
    "/api/trial": { get: { summary: "Get trial status (Bearer JWT)", responses: { 200: { description: "trialStartDate, usageToday" } } } },
    "/api/trial/start": { post: { summary: "Start trial (Bearer JWT)", responses: { 200: { description: "trialStartDate" } } } },
    "/api/trial/increment": { post: { summary: "Increment today's usage (Bearer JWT)", responses: { 200: { description: "date, count" } } } },
  },
};

// Swagger UI can crash on Vercel serverless (static assets/filesystem). Only mount when not on Vercel.
if (!process.env.VERCEL) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
  app.get("/api-docs.json", (req, res) => res.json(openApiSpec));
}

// -----------------------------------------------------------------------------
// Auth: Apple & Google sign-in (verify token, issue app JWT)
// -----------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const appleKeyClient = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
});

function getAppleSigningKey(header, callback) {
  appleKeyClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key?.getPublicKey());
  });
}

app.post("/api/auth/apple", async (req, res) => {
  try {
    const { identityToken, name: nameFromClient } = req.body;
    if (!identityToken || typeof identityToken !== "string") {
      return res.status(400).json({ error: "Missing identityToken" });
    }
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(identityToken, getAppleSigningKey, {}, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });
    const sub = decoded.sub;
    const email = decoded.email || null;
    const name =
      typeof nameFromClient === "string" && nameFromClient.trim()
        ? nameFromClient.trim()
        : decoded.name
          ? [decoded.name.firstName, decoded.name.lastName].filter(Boolean).join(" ") || null
          : null;
    let canonicalUserId = `apple:${sub}`;
    try {
      const result = await upsertUser({ provider: "apple", providerSub: sub, email, name });
      if (result?.canonicalUserId) canonicalUserId = result.canonicalUserId;
    } catch (dbErr) {
      console.warn("[auth/apple] DB upsert failed:", dbErr.message);
    }
    const user = { id: sub, email, provider: "apple", userId: canonicalUserId, ...(name ? { name } : {}) };
    const token = jwt.sign(
      { sub, email, provider: "apple", userId: canonicalUserId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(`[auth/apple] OK sub=${sub} userId=${canonicalUserId}`);
    return res.json({ jwt: token, user });
  } catch (error) {
    console.error("[auth/apple] Error:", error.message);
    return res.status(401).json({ error: "Invalid Apple token" });
  }
});

// JWT auth middleware: Authorization: Bearer <token> → req.user, req.userId (canonical: email or provider:sub)
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { sub, provider, userId } = decoded;
    if (!sub || !provider) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    req.user = decoded;
    req.userId = userId ?? `${provider}:${sub}`;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// -----------------------------------------------------------------------------
// Trial (per-account: 3-day trial, 10 generations/day)
// -----------------------------------------------------------------------------
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

app.get("/api/trial", requireAuth, async (req, res) => {
  try {
    let trial = await getTrial(req.userId);
    if (!trial) {
      return res.json({ trialStartDate: null, usageToday: { date: getTodayKey(), count: 0 } });
    }
    const today = getTodayKey();
    const count = trial.usageByDate?.[today] ?? 0;
    return res.json({
      trialStartDate: trial.trialStartDate,
      usageToday: { date: today, count },
    });
  } catch (e) {
    console.error("[api/trial] GET error:", e.message);
    return res.status(500).json({ error: "Failed to get trial status" });
  }
});

app.post("/api/trial/start", requireAuth, async (req, res) => {
  try {
    const trial = await ensureTrialStart(req.userId);
    return res.json({ trialStartDate: trial?.trialStartDate ?? new Date().toISOString() });
  } catch (e) {
    console.error("[api/trial/start] error:", e.message);
    return res.status(500).json({ error: "Failed to start trial" });
  }
});

app.post("/api/trial/increment", requireAuth, async (req, res) => {
  try {
    const today = getTodayKey();
    const count = await incrementTrialUsage(req.userId, today);
    return res.json({ date: today, count });
  } catch (e) {
    console.error("[api/trial/increment] error:", e.message);
    return res.status(500).json({ error: "Failed to increment usage" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;
    if (!GOOGLE_CLIENT_ID) {
      console.warn("[auth/google] GOOGLE_CLIENT_ID not set");
      return res.status(503).json({ error: "Google sign-in not configured" });
    }
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    let sub;
    let email = null;
    let name = null;
    if (idToken && typeof idToken === "string") {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      sub = payload?.sub;
      email = payload?.email || null;
      name = payload?.name || null;
    } else if (accessToken && typeof accessToken === "string") {
      const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!resp.ok) {
        return res.status(401).json({ error: "Invalid Google access token" });
      }
      const data = await resp.json();
      sub = data?.id;
      email = data?.email || null;
      name = data?.name || null;
    } else {
      return res.status(400).json({ error: "Missing idToken or accessToken" });
    }
    if (!sub) {
      return res.status(401).json({ error: "Invalid Google token" });
    }
    let canonicalUserId = `google:${sub}`;
    try {
      const result = await upsertUser({ provider: "google", providerSub: sub, email, name });
      if (result?.canonicalUserId) canonicalUserId = result.canonicalUserId;
    } catch (dbErr) {
      console.warn("[auth/google] DB upsert failed:", dbErr.message);
    }
    const user = { id: sub, email, provider: "google", userId: canonicalUserId };
    const token = jwt.sign(
      { sub, email, provider: "google", userId: canonicalUserId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(`[auth/google] OK sub=${sub} userId=${canonicalUserId}`);
    return res.json({ jwt: token, user });
  } catch (error) {
    console.error("[auth/google] Error:", error.message);
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

// Only start HTTP server when not running on Vercel (serverless)
if (!process.env.VERCEL) {
  app.listen(port, async () => {
    console.log(`API running at http://localhost:${port}`);
    // One account per email: merge existing duplicates, then enforce unique index
    try {
      await mergeDuplicateUsersByEmail();
      await ensureUserIndexes();
    } catch (e) {
      console.warn("[startup] User merge/index:", e?.message || e);
    }
    if (useOpenAI) {
      console.log(`Using OpenAI (model: ${openaiModel}).`);
    } else if (useOllama) {
      console.log(`Using Ollama at ${ollamaBaseUrl} (model: ${ollamaModel}).`);
    } else {
      console.warn(
        "No LLM configured. Set OPENAI_API_KEY for OpenAI, or OLLAMA_BASE_URL for local Ollama (see README)."
      );
    }
  });
}

export default app;
