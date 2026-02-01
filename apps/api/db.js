/**
 * MongoDB user storage. When MONGODB_URI is set, sign-in/sign-up upserts users into the "users" collection.
 */
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "fast-caption";
const COLLECTION = "users";

let clientPromise = null;
let userIndexAndMergePromise = null;

function getClient() {
  if (!MONGODB_URI) return null;
  if (!clientPromise) {
    clientPromise = new MongoClient(MONGODB_URI).connect();
  }
  return clientPromise;
}

/** Run once per process: merge duplicate users by email, then ensure unique index. Used on Vercel where app.listen() never runs. */
async function ensureUserIndexAndMergeOnce() {
  if (userIndexAndMergePromise) return userIndexAndMergePromise;
  userIndexAndMergePromise = (async () => {
    const c = await getClient();
    if (!c) return;
    try {
      await mergeDuplicateUsersByEmail();
      await ensureUserIndexes();
    } catch (e) {
      userIndexAndMergePromise = null;
      throw e;
    }
  })();
  return userIndexAndMergePromise;
}

/**
 * Normalize email for unique lookups (lowercase, trim).
 */
function normalizeEmail(email) {
  if (email == null || typeof email !== "string") return null;
  const t = email.trim().toLowerCase();
  return t || null;
}

/**
 * Get canonical userId for this account: email when available, else provider:providerSub.
 * One account per email; same email from Apple and Google shares one record and one trial.
 * @param {{ provider: string, providerSub: string, email?: string | null, name?: string | null }} params
 * @returns {Promise<{ canonicalUserId: string } | null>} canonicalUserId for JWT/trial; null if DB not configured
 */
/**
 * Ensure unique index on email so one account per email (prevents duplicate entries across providers).
 * Sparse: only indexes documents that have email (allows many null-email accounts).
 */
export async function ensureUserIndexes() {
  const c = await getClient();
  if (!c) return;
  const col = c.db(DB_NAME).collection(COLLECTION);
  try {
    await col.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("[db] User index ensured: unique sparse on email");
  } catch (e) {
    if (e.code === 85 || e.codeName === "IndexOptionsConflict" || e.code === 86 || e.codeName === "IndexKeySpecsConflict") {
      console.log("[db] User email index already exists or conflicts:", e.message);
    } else throw e;
  }
}

/**
 * One-time merge: find all emails with multiple user docs and merge into a single doc per email.
 * Call on startup to fix existing duplicates (e.g. same email with Apple and Google created before unification).
 */
export async function mergeDuplicateUsersByEmail() {
  const c = await getClient();
  if (!c) return;
  const col = c.db(DB_NAME).collection(COLLECTION);
  const dupEmails = await col
    .aggregate([
      { $match: { email: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$email", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();
  for (const { _id: email } of dupEmails) {
    const docs = await col.find({ email }).sort({ createdAt: 1 }).toArray();
    if (docs.length < 2) continue;
    const [keeper, ...duplicates] = docs;
    let allProviders = keeper.providers ?? (keeper.provider != null ? [{ provider: keeper.provider, providerSub: String(keeper.providerSub) }] : []);
    for (const dup of duplicates) {
      const entries = dup.providers ?? (dup.provider != null ? [{ provider: dup.provider, providerSub: String(dup.providerSub) }] : []);
      for (const e of entries) {
        if (!allProviders.some((p) => p.provider === e.provider && p.providerSub === e.providerSub)) {
          allProviders = [...allProviders, e];
        }
      }
    }
    const update = { $set: { providers: allProviders, updatedAt: new Date() } };
    if (keeper.provider != null) update.$unset = { provider: "", providerSub: "" };
    await col.updateOne({ _id: keeper._id }, update);
    for (const dup of duplicates) {
      await col.deleteOne({ _id: dup._id });
    }
    console.log(`[db] Merged ${docs.length} duplicate users for email=${email}`);
  }
}

export async function upsertUser({ provider, providerSub, email = null, name = null }) {
  const normalizedEmail = normalizeEmail(email);
  const subStr = String(providerSub);
  console.log(`[db] Saving user: provider=${provider}, providerSub=${subStr}, email=${normalizedEmail ?? "(none)"}, name=${name ?? "(none)"}`);

  const c = await getClient();
  if (!c) {
    console.log("[db] MONGODB_URI not set, skipping user save");
    return { canonicalUserId: normalizedEmail ?? `${provider}:${subStr}` };
  }

  await ensureUserIndexAndMergeOnce();

  const db = c.db(DB_NAME);
  const col = db.collection(COLLECTION);
  const now = new Date();
  const providerEntry = { provider, providerSub: subStr };

  // 1) If we have email, try to find existing account by email (unified account)
  if (normalizedEmail) {
    const byEmail = await col.findOne({ email: normalizedEmail });
    if (byEmail) {
      const providers = byEmail.providers ?? (byEmail.provider ? [{ provider: byEmail.provider, providerSub: String(byEmail.providerSub) }] : []);
      const hasProvider = providers.some((p) => p.provider === provider && p.providerSub === subStr);
      let allProviders = hasProvider ? providers : [...providers, providerEntry];
      // Merge any other docs with same email (duplicates from other login methods)
      const duplicates = await col.find({ email: normalizedEmail, _id: { $ne: byEmail._id } }).toArray();
      for (const dup of duplicates) {
        const dupEntries = dup.providers ?? (dup.provider ? [{ provider: dup.provider, providerSub: String(dup.providerSub) }] : []);
        for (const e of dupEntries) {
          if (!allProviders.some((p) => p.provider === e.provider && p.providerSub === e.providerSub)) {
            allProviders = [...allProviders, e];
          }
        }
        await col.deleteOne({ _id: dup._id });
        console.log(`[db] Merged duplicate user email=${normalizedEmail} into single account`);
      }
      const update = { $set: { name: name ?? byEmail.name, updatedAt: now, providers: allProviders } };
      if (byEmail.provider != null) update.$unset = { provider: "", providerSub: "" };
      await col.updateOne({ email: normalizedEmail }, update);
      if (!hasProvider) console.log(`[db] Linked provider ${provider}:${subStr} to existing email=${normalizedEmail}`);
      return { canonicalUserId: normalizedEmail };
    }

    // 2) No doc by email; find by current provider (legacy doc or same device)
    const byProvider = await col.findOne({
      $or: [
        { provider, providerSub: subStr },
        { "providers.provider": provider, "providers.providerSub": subStr },
      ],
    });
    if (byProvider) {
      const providers = byProvider.providers ?? (byProvider.provider ? [{ provider: byProvider.provider, providerSub: byProvider.providerSub }] : []);
      const hasProvider = providers.some((p) => p.provider === provider && p.providerSub === subStr);
      const newProviders = hasProvider ? providers : [...providers, providerEntry];
      const update = {
        $set: { email: normalizedEmail, name: name ?? byProvider.name, updatedAt: now, providers: newProviders },
      };
      if (byProvider.provider != null) update.$unset = { provider: "", providerSub: "" };
      await col.updateOne({ _id: byProvider._id }, update);
      console.log(`[db] Set email=${normalizedEmail} on existing user`);
      return { canonicalUserId: normalizedEmail };
    }

    // 3) New user with email (unique index may race with another login for same email)
    try {
      await col.insertOne({
        email: normalizedEmail,
        name: name ?? null,
        providers: [providerEntry],
        createdAt: now,
        updatedAt: now,
      });
      console.log(`[db] User created: email=${normalizedEmail}`);
      return { canonicalUserId: normalizedEmail };
    } catch (insertErr) {
      if (insertErr.code === 11000) {
        const byEmail = await col.findOne({ email: normalizedEmail });
        if (byEmail) {
          const providers = byEmail.providers ?? (byEmail.provider ? [{ provider: byEmail.provider, providerSub: String(byEmail.providerSub) }] : []);
          const hasProvider = providers.some((p) => p.provider === provider && p.providerSub === subStr);
          const allProviders = hasProvider ? providers : [...providers, providerEntry];
          await col.updateOne(
            { email: normalizedEmail },
            { $set: { name: name ?? byEmail.name, updatedAt: now, providers: allProviders }, ...(byEmail.provider != null ? { $unset: { provider: "", providerSub: "" } } : {}) }
          );
          if (!hasProvider) console.log(`[db] Linked provider ${provider}:${subStr} to existing email=${normalizedEmail} (after race)`);
          return { canonicalUserId: normalizedEmail };
        }
      }
      throw insertErr;
    }
  }

  // 4) No email (e.g. Apple hide-my-email): key by provider:sub
  const byProvider = await col.findOne({
    $or: [
      { provider, providerSub: subStr },
      { "providers.provider": provider, "providers.providerSub": subStr },
    ],
  });
  const fallbackId = `${provider}:${subStr}`;
  if (byProvider) {
    const providers = byProvider.providers ?? [{ provider: byProvider.provider, providerSub: byProvider.providerSub }];
    const hasProvider = providers.some((p) => p.provider === provider && p.providerSub === subStr);
    if (!hasProvider) {
      await col.updateOne(
        { _id: byProvider._id },
        {
          $set: { name: name ?? byProvider.name, updatedAt: now },
          $push: { providers: providerEntry },
          ...(byProvider.provider != null ? { $unset: { provider: "", providerSub: "" } } : {}),
        }
      );
    } else {
      await col.updateOne(
        { _id: byProvider._id },
        { $set: { name: name ?? byProvider.name, updatedAt: now } }
      );
    }
    const canonical = byProvider.email ?? fallbackId;
    return { canonicalUserId: canonical };
  }

  await col.insertOne({
    email: null,
    name: name ?? null,
    providers: [providerEntry],
    createdAt: now,
    updatedAt: now,
  });
  console.log(`[db] User created: ${provider}:${subStr} (no email)`);
  return { canonicalUserId: fallbackId };
}

// -----------------------------------------------------------------------------
// Trial (one per account: trialStartDate + daily usage by date)
// -----------------------------------------------------------------------------
const TRIAL_COLLECTION = "trial";
const TRIAL_DAYS = 3;
const DAILY_LIMIT_TRIAL = 10;

export { TRIAL_DAYS, DAILY_LIMIT_TRIAL };

/**
 * Get trial record for userId (provider:sub). Returns null if no record.
 */
export async function getTrial(userId) {
  const c = await getClient();
  if (!c) return null;
  const doc = await c.db(DB_NAME).collection(TRIAL_COLLECTION).findOne({ userId: String(userId) });
  return doc;
}

/**
 * Set trialStartDate to now if not already set. Returns the trial record.
 */
export async function ensureTrialStart(userId) {
  const c = await getClient();
  if (!c) return null;
  const now = new Date().toISOString();
  const col = c.db(DB_NAME).collection(TRIAL_COLLECTION);
  const existing = await col.findOne({ userId: String(userId) });
  if (existing?.trialStartDate) {
    return existing;
  }
  await col.updateOne(
    { userId: String(userId) },
    {
      $set: { trialStartDate: now, updatedAt: new Date() },
      $setOnInsert: { userId: String(userId), usageByDate: {} },
    },
    { upsert: true }
  );
  return col.findOne({ userId: String(userId) });
}

/**
 * Increment usage for userId on date (YYYY-MM-DD). Returns new count for that date.
 */
export async function incrementTrialUsage(userId, dateStr) {
  const c = await getClient();
  if (!c) return 0;
  const key = `usageByDate.${dateStr}`;
  const result = await c
    .db(DB_NAME)
    .collection(TRIAL_COLLECTION)
    .findOneAndUpdate(
      { userId: String(userId) },
      { $inc: { [key]: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );
  const doc = result?.value || result;
  const count = doc?.usageByDate?.[dateStr] ?? 1;
  return count;
}
