/**
 * Free trial and daily generation limits.
 * - When user is logged in (jwt): trial is per account (stored on backend).
 * - When not logged in: local-only (fallback); sign-in required to generate anyway.
 * - 3-day free trial, 10 generations per calendar day. Pro = unlimited.
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTrialStatus, startTrial, incrementTrialUsageApi } from "@/utils/api";

const TRIAL_DAYS = 3;
const DAILY_LIMIT_TRIAL = 10;

const KEY_TRIAL_START = "trialStartDate";
const KEY_USAGE = "generationUsage";

/**
 * Get today's date string (YYYY-MM-DD) in local timezone.
 */
function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// -----------------------------------------------------------------------------
// Local-only (no jwt / fallback)
// -----------------------------------------------------------------------------

export async function getTrialStartDateLocal() {
  const raw = await AsyncStorage.getItem(KEY_TRIAL_START);
  if (raw) return raw;
  const now = new Date().toISOString();
  await AsyncStorage.setItem(KEY_TRIAL_START, now);
  return now;
}

export async function isWithinTrialLocal() {
  const start = await getTrialStartDateLocal();
  const startMs = new Date(start).getTime();
  const endMs = startMs + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() < endMs;
}

export async function getUsageForTodayLocal() {
  const raw = await AsyncStorage.getItem(KEY_USAGE);
  const today = getTodayKey();
  if (!raw) return { date: today, count: 0 };
  try {
    const { date, count } = JSON.parse(raw);
    if (date !== today) return { date: today, count: 0 };
    return { date: today, count: count ?? 0 };
  } catch {
    return { date: today, count: 0 };
  }
}

async function incrementGenerationCountLocal() {
  const today = getTodayKey();
  const current = await getUsageForTodayLocal();
  const next = (current.date === today ? current.count : 0) + 1;
  await AsyncStorage.setItem(KEY_USAGE, JSON.stringify({ date: today, count: next }));
  return next;
}

// -----------------------------------------------------------------------------
// Unified API: use backend when jwt present, else local
// -----------------------------------------------------------------------------

/**
 * Can the user generate one more script?
 * When jwt is provided, uses backend (one trial per account). Otherwise uses local storage.
 */
export async function canGenerate(isPro, jwt = null) {
  if (isPro) return { allowed: true, reason: "pro", remaining: null };

  if (jwt) {
    try {
      let data = await getTrialStatus(jwt);
      if (!data.trialStartDate) {
        await startTrial(jwt);
        data = await getTrialStatus(jwt);
      }
      const start = data.trialStartDate ? new Date(data.trialStartDate).getTime() : 0;
      const withinTrial = start && start + TRIAL_DAYS * 24 * 60 * 60 * 1000 > Date.now();
      const count = data.usageToday?.count ?? 0;
      const remaining = withinTrial ? Math.max(0, DAILY_LIMIT_TRIAL - count) : 0;
      return { allowed: remaining > 0, reason: withinTrial ? "trial" : "trial_ended", remaining };
    } catch (e) {
      console.warn("[trial] API failed, falling back to local:", e?.message);
      // fall through to local
    }
  }

  const within = await isWithinTrialLocal();
  if (!within) return { allowed: false, reason: "trial_ended", remaining: 0 };
  const { count } = await getUsageForTodayLocal();
  const remaining = Math.max(0, DAILY_LIMIT_TRIAL - count);
  return { allowed: remaining > 0, reason: "trial", remaining };
}

/**
 * Usage summary for UI. Uses backend when jwt present.
 */
export async function getTrialUsageSummary(isPro, jwt = null) {
  if (isPro) {
    return {
      isPro: true,
      withinTrial: false,
      usedToday: 0,
      limitToday: null,
      remainingToday: null,
    };
  }

  if (jwt) {
    try {
      let data = await getTrialStatus(jwt);
      if (!data.trialStartDate) {
        await startTrial(jwt);
        data = await getTrialStatus(jwt);
      }
      const start = data.trialStartDate ? new Date(data.trialStartDate).getTime() : 0;
      const withinTrial = start && start + TRIAL_DAYS * 24 * 60 * 60 * 1000 > Date.now();
      const count = data.usageToday?.count ?? 0;
      const remainingToday = withinTrial ? Math.max(0, DAILY_LIMIT_TRIAL - count) : 0;
      return {
        isPro: false,
        withinTrial,
        usedToday: count,
        limitToday: withinTrial ? DAILY_LIMIT_TRIAL : 0,
        remainingToday,
      };
    } catch (e) {
      console.warn("[trial] API failed for summary, using local:", e?.message);
    }
  }

  const withinTrial = await isWithinTrialLocal();
  const { count } = await getUsageForTodayLocal();
  const limitToday = withinTrial ? DAILY_LIMIT_TRIAL : 0;
  const remainingToday = withinTrial ? Math.max(0, DAILY_LIMIT_TRIAL - count) : 0;
  return {
    isPro: false,
    withinTrial,
    usedToday: count,
    limitToday,
    remainingToday,
  };
}

/**
 * Increment generation count. Uses backend when jwt present (per account).
 */
export async function incrementGenerationCount(jwt = null) {
  if (jwt) {
    try {
      const result = await incrementTrialUsageApi(jwt);
      return result.count;
    } catch (e) {
      console.warn("[trial] Increment API failed, using local:", e?.message);
    }
  }
  return incrementGenerationCountLocal();
}

/**
 * Hook: summary for UI and refresh. Pass jwt when user is logged in for per-account trial.
 */
export function useTrialUsage(isPro, jwt = null) {
  const [summary, setSummary] = useState({
    withinTrial: true,
    usedToday: 0,
    limitToday: DAILY_LIMIT_TRIAL,
    remainingToday: DAILY_LIMIT_TRIAL,
  });

  const refresh = useCallback(async () => {
    const s = await getTrialUsageSummary(isPro, jwt);
    setSummary(s);
  }, [isPro, jwt]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...summary, refresh };
}

export { TRIAL_DAYS, DAILY_LIMIT_TRIAL };
