/**
 * Vercel serverless entry: forwards all requests to the Express app.
 * Rewrites in vercel.json send every path here so routes like /health, /api/generate-script, etc. work.
 */
import app from "../server.js";

export default function handler(req, res) {
  return app(req, res);
}
