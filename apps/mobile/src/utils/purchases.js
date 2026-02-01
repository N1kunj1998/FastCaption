/**
 * RevenueCat subscription integration for FastCaption.
 *
 * - Entitlement: "FastCaption Pro" (identifier in dashboard: pro)
 * - Products: Monthly, Yearly (configured in RevenueCat + App Store / Play)
 * - Paywall & Customer Center via react-native-purchases-ui
 *
 * @see https://www.revenuecat.com/docs/getting-started/installation/reactnative
 * @see https://www.revenuecat.com/docs/tools/paywalls
 * @see https://www.revenuecat.com/docs/tools/customer-center
 */

import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const PRO_URL = process.env.EXPO_PUBLIC_PRO_URL || "https://example.com/upgrade";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

/** Entitlement identifier in RevenueCat — must match your dashboard exactly. */
export const ENTITLEMENT_ID = "FastCaption Pro";

/** Display name for UI. */
export const PRO_DISPLAY_NAME = "FastCaption Pro";

/** Product identifiers — use these in App Store Connect and RevenueCat (default offering packages). */
export const PRODUCT_ID_MONTHLY = "fastcaption_premium_monthly";
export const PRODUCT_ID_YEARLY = "fastcaption_premium_yearly";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

function getApiKey() {
  const single = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  if (single) return single;
  if (Platform.OS === "ios") return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? null;
  if (Platform.OS === "android") return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? null;
  return null;
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

/**
 * Configure RevenueCat. Call once at app startup (e.g. root layout).
 * No-op on web or if no API key. Use EXPO_PUBLIC_REVENUECAT_API_KEY or platform-specific keys.
 * Downgrades "offerings empty" / "no products registered" errors to warnings so they don't
 * show as red errors with stack traces; fix those in the RevenueCat dashboard.
 */
export function initPurchases() {
  if (!isNative) return;
  const apiKey = getApiKey();
  if (!apiKey) {
    if (__DEV__) console.warn("[RevenueCat] No API key; set EXPO_PUBLIC_REVENUECAT_API_KEY in .env");
    return;
  }
  try {
    // Custom log handler: treat dashboard config errors as warnings (no stack trace)
    Purchases.setLogHandler((logLevel, message) => {
      const isOfferingsConfigError =
        message && (
          message.includes("no products registered") ||
          message.includes("offerings empty") ||
          message.includes("no packages configured") ||
          message.includes("OfferingsManager.Error")
        );
      if (isOfferingsConfigError && logLevel === LOG_LEVEL.ERROR) {
        console.warn("[RevenueCat]", message);
        return;
      }
      switch (logLevel) {
        case LOG_LEVEL.DEBUG:
          console.debug("[RevenueCat]", message);
          break;
        case LOG_LEVEL.INFO:
          console.info("[RevenueCat]", message);
          break;
        case LOG_LEVEL.WARN:
          console.warn("[RevenueCat]", message);
          break;
        case LOG_LEVEL.ERROR:
          console.error("[RevenueCat]", message);
          break;
        default:
          console.log("[RevenueCat]", message);
      }
    });
    Purchases.configure({ apiKey });
  } catch (e) {
    console.warn("[RevenueCat] configure failed:", e?.message ?? e);
  }
}

/**
 * Link RevenueCat to your app user (e.g. after sign-in). Call when you have a stable userId.
 * This ties subscription to the account across devices.
 */
export async function syncRevenueCatUser(appUserId) {
  if (!isNative || !appUserId) return;
  try {
    await Purchases.logIn(String(appUserId));
  } catch (e) {
    console.warn("[RevenueCat] logIn failed:", e?.message ?? e);
  }
}

// -----------------------------------------------------------------------------
// Offerings & products (Monthly / Yearly)
// -----------------------------------------------------------------------------

/** Default offering identifier in RevenueCat (create an Offering with monthly + yearly packages). */
export const DEFAULT_OFFERING_ID = "default";

let cachedOfferings = null;

/**
 * Fetch offerings (contains monthly / yearly packages). Cached after first successful fetch.
 * Configure products in RevenueCat dashboard and attach to an Offering.
 */
export async function getOfferings() {
  if (!isNative) return null;
  try {
    const offerings = await Purchases.getOfferings();
    cachedOfferings = offerings;
    return offerings;
  } catch (e) {
    console.warn("[RevenueCat] getOfferings failed:", e?.message ?? e);
    return cachedOfferings;
  }
}

/**
 * Get the current offering (e.g. for paywall). Use default or a placement.
 */
export async function getCurrentOffering(placementId = null) {
  if (!isNative) return null;
  try {
    if (placementId) {
      return await Purchases.getCurrentOfferingForPlacement(placementId);
    }
    const offerings = await getOfferings();
    return offerings?.current ?? offerings?.all?.[DEFAULT_OFFERING_ID] ?? null;
  } catch (e) {
    console.warn("[RevenueCat] getCurrentOffering failed:", e?.message ?? e);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Entitlement & customer info
// -----------------------------------------------------------------------------

function hasEntitlement(customerInfo) {
  if (!customerInfo?.entitlements?.active) return false;
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
}

/**
 * Get current customer info (entitlements, active subscriptions, etc.).
 * Prefer useSubscription() for reactive state; use this for one-off checks.
 */
export async function getCustomerInfo() {
  if (!isNative) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.warn("[RevenueCat] getCustomerInfo failed:", e?.message ?? e);
    return null;
  }
}

/**
 * Restore previous purchases (e.g. "Restore" button). Refreshes customer info.
 */
export async function restorePurchases() {
  if (!isNative) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (e) {
    console.warn("[RevenueCat] restorePurchases failed:", e?.message ?? e);
    throw e;
  }
}

// -----------------------------------------------------------------------------
// Paywall result (from react-native-purchases-ui)
// -----------------------------------------------------------------------------

function getPaywallResultConstants() {
  if (!isNative) return {};
  try {
    return require("react-native-purchases-ui").default.PAYWALL_RESULT || {};
  } catch {
    return {};
  }
}

export const PAYWALL_RESULT = {
  PURCHASED: "PURCHASED",
  RESTORED: "RESTORED",
  CANCELLED: "CANCELLED",
  NOT_PRESENTED: "NOT_PRESENTED",
  ERROR: "ERROR",
  ...getPaywallResultConstants(),
};

// -----------------------------------------------------------------------------
// Diagnostics — log everything we can and can't get (for debugging)
// -----------------------------------------------------------------------------

function safeStringify(obj) {
  if (obj === null) return "null";
  if (obj === undefined) return "undefined";
  if (typeof obj !== "object") return String(obj);
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "function") return "[Function]";
      if (value && typeof value === "object") {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (e) {
    return String(obj);
  }
}

/**
 * Log all RevenueCat data we can get (and what we can't). Call from Settings in dev or on app load.
 * Use this to see exactly where the issue is when dashboard looks correct.
 */
export async function logRevenueCatDiagnostics() {
  const out = [];
  const log = (label, value) => {
    const line = value === undefined ? `${label}: (not available)` : `${label}: ${typeof value === "object" ? safeStringify(value) : value}`;
    out.push(line);
    console.log("[RevenueCat Diagnostics]", label, value === undefined ? "(not available)" : value);
  };

  console.log("[RevenueCat Diagnostics] ========== START ==========");

  // --- Config (what we have in code / env) ---
  log("Platform", Platform.OS);
  log("isNative", isNative);
  const apiKey = getApiKey();
  log("API key set", !!apiKey);
  log("API key (masked)", apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : null);
  log("ENTITLEMENT_ID", ENTITLEMENT_ID);
  log("PRODUCT_ID_MONTHLY", PRODUCT_ID_MONTHLY);
  log("PRODUCT_ID_YEARLY", PRODUCT_ID_YEARLY);
  log("DEFAULT_OFFERING_ID", DEFAULT_OFFERING_ID);

  if (!isNative) {
    log("SKIP_REASON", "Not native — RevenueCat only runs on iOS/Android");
    console.log("[RevenueCat Diagnostics] ========== END ==========");
    return out;
  }

  // --- Offerings (what RevenueCat returns for offerings) ---
  try {
    const offerings = await Purchases.getOfferings();
    log("Offerings (raw)", offerings ? safeStringify(offerings) : null);
    if (offerings) {
      log("Offerings.current exists", !!offerings.current);
      log("Offerings.all keys", offerings.all ? Object.keys(offerings.all) : []);
      if (offerings.current) {
        const curr = offerings.current;
        log("Current offering identifier", curr.identifier);
        log("Current offering packages count", curr.availablePackages?.length ?? 0);
        if (curr.availablePackages?.length) {
          curr.availablePackages.forEach((pkg, i) => {
            log(`Package[${i}] identifier`, pkg.identifier);
            log(`Package[${i}] packageType`, pkg.packageType);
            log(`Package[${i}] product identifier`, pkg.product?.identifier);
            log(`Package[${i}] product priceString`, pkg.product?.priceString);
          });
        }
      }
      const defaultOffering = offerings.all?.[DEFAULT_OFFERING_ID];
      log("Offerings.all['default'] exists", !!defaultOffering);
      if (defaultOffering) {
        log("Default offering packages count", defaultOffering.availablePackages?.length ?? 0);
      }
    }
  } catch (e) {
    log("Offerings ERROR", { message: e?.message, code: e?.code, name: e?.name });
  }

  // --- Customer info (user + entitlements) ---
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    log("CustomerInfo (raw)", customerInfo ? safeStringify(customerInfo) : null);
    if (customerInfo) {
      log("CustomerInfo.originalAppUserId", customerInfo.originalAppUserId);
      log("CustomerInfo.entitlements.active keys", customerInfo.entitlements?.active ? Object.keys(customerInfo.entitlements.active) : []);
      log("CustomerInfo.entitlements.all keys", customerInfo.entitlements?.all ? Object.keys(customerInfo.entitlements.all) : []);
      log(`CustomerInfo.entitlements.active['${ENTITLEMENT_ID}']`, customerInfo.entitlements?.active?.[ENTITLEMENT_ID] ?? null);
      log("CustomerInfo.activeSubscriptions", customerInfo.activeSubscriptions ?? []);
      log("CustomerInfo.allPurchasedProductIdentifiers", customerInfo.allPurchasedProductIdentifiers ?? []);
    }
  } catch (e) {
    log("CustomerInfo ERROR", { message: e?.message, code: e?.code, name: e?.name });
  }

  // --- Store products (direct from StoreKit / Play — do we see our product IDs?) ---
  try {
    const products = await Purchases.getProducts([PRODUCT_ID_MONTHLY, PRODUCT_ID_YEARLY]);
    log("Store products (getProducts) count", products?.length ?? 0);
    if (products?.length) {
      products.forEach((p, i) => {
        log(`StoreProduct[${i}] identifier`, p.identifier);
        log(`StoreProduct[${i}] priceString`, p.priceString);
        log(`StoreProduct[${i}] title`, p.title);
      });
    } else {
      log("Store products (getProducts)", "Empty array — StoreKit/Play did not return our product IDs. Check App Store Connect / Play Console and bundle ID.");
    }
  } catch (e) {
    log("Store products ERROR", { message: e?.message, code: e?.code, name: e?.name });
  }

  // --- What we CANNOT get from the SDK ---
  log("NOT_AVAILABLE_IN_SDK", [
    "Raw receipt (server-only)",
    "RevenueCat dashboard config (dashboard only)",
    "App Store Connect agreement status (dashboard only)",
    "Exact reason offerings are empty (check dashboard: Product catalog → Products + Offerings → default packages)",
  ]);

  console.log("[RevenueCat Diagnostics] ========== END ==========");
  return out;
}

// -----------------------------------------------------------------------------
// useSubscription hook
// -----------------------------------------------------------------------------

/**
 * Hook: subscription state and actions for FastCaption Pro.
 *
 * - customerInfo: raw RevenueCat customer info (entitlements, active subs)
 * - isPro: true if user has active "pro" (FastCaption Pro) entitlement
 * - isLoading: true until first customerInfo fetch
 * - error: user-facing error message if fetch failed
 * - refresh: refetch customer info
 * - presentPaywall: show RevenueCat paywall (optional offering for monthly/yearly)
 * - presentPaywallIfNeeded: show paywall only if user doesn't have Pro
 * - presentCustomerCenter: show manage subscription / restore
 * - restorePurchases: restore previous purchases and refresh state
 */
export function useSubscription() {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(isNative);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isNative) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      const msg = e?.message ?? "Failed to load subscription";
      setError(msg);
      if (__DEV__) console.warn("[RevenueCat] getCustomerInfo:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isNative) {
      setLoading(false);
      return;
    }
    refresh();
    const listener = (info) => {
      setCustomerInfo(info);
      setError(null);
      setLoading(false);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => Purchases.removeCustomerInfoUpdateListener(listener);
  }, [refresh]);

  const presentPaywall = useCallback(async (options = {}) => {
    if (!isNative) {
      if (PRO_URL.startsWith("http")) await WebBrowser.openBrowserAsync(PRO_URL);
      return PAYWALL_RESULT.NOT_PRESENTED;
    }
    try {
      const RevenueCatUI = require("react-native-purchases-ui").default;
      const result = await RevenueCatUI.presentPaywall({
        displayCloseButton: true,
        ...options,
      });
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      return result;
    } catch (e) {
      if (__DEV__) console.warn("[RevenueCat] presentPaywall failed:", e?.message ?? e);
      return PAYWALL_RESULT.ERROR;
    }
  }, []);

  const presentPaywallIfNeeded = useCallback(async (options = {}) => {
    if (!isNative) {
      if (PRO_URL.startsWith("http")) await WebBrowser.openBrowserAsync(PRO_URL);
      return PAYWALL_RESULT.NOT_PRESENTED;
    }
    try {
      const RevenueCatUI = require("react-native-purchases-ui").default;
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENT_ID,
        displayCloseButton: true,
        ...options,
      });
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      return result;
    } catch (e) {
      if (__DEV__) console.warn("[RevenueCat] presentPaywallIfNeeded failed:", e?.message ?? e);
      return PAYWALL_RESULT.ERROR;
    }
  }, []);

  const presentCustomerCenter = useCallback(async () => {
    if (!isNative) {
      if (PRO_URL.startsWith("http")) await WebBrowser.openBrowserAsync(PRO_URL);
      return;
    }
    try {
      const RevenueCatUI = require("react-native-purchases-ui").default;
      await RevenueCatUI.presentCustomerCenter();
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      if (__DEV__) console.warn("[RevenueCat] presentCustomerCenter failed:", e?.message ?? e);
    }
  }, []);

  const restore = useCallback(async () => {
    if (!isNative) return null;
    try {
      setError(null);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (e) {
      const msg = e?.message ?? "Restore failed";
      setError(msg);
      throw e;
    }
  }, []);

  const isPro = hasEntitlement(customerInfo);

  return {
    customerInfo,
    isPro,
    isPremium: isPro, // alias
    isLoading: loading,
    error,
    refresh,
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    restorePurchases: restore,
  };
}
