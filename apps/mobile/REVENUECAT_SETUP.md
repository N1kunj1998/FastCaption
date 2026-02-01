# RevenueCat setup for FastCaption

Step-by-step guide to configure RevenueCat for **FastCaption Pro** subscriptions (monthly / yearly) in React Native.

## 1. Install the SDK (already in this project)

```bash
npm install --save react-native-purchases react-native-purchases-ui
```

Then run `npx pod install` in the `ios` folder (or use `npx expo run:ios` which runs it). For a development build:

```bash
npx expo run:ios
# or
npx expo run:android
```

**Documentation:** [RevenueCat React Native installation](https://www.revenuecat.com/docs/getting-started/installation/reactnative#installation)

---

## 2. Configure API key

In **apps/mobile/.env** set your RevenueCat public API key:

```env
# Single key (works for both platforms when using a shared project):
EXPO_PUBLIC_REVENUECAT_API_KEY=test_SVwDhMCBOMkgjYVrhlGyhmhGTTW
```

Or use platform-specific keys from the [RevenueCat dashboard](https://app.revenuecat.com) → Project → API Keys:

```env
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxx
```

The app calls `initPurchases()` in the root layout so no extra setup is needed in your screens.

---

## 3. RevenueCat dashboard setup

### 3.1 Products (App Store Connect / Google Play)

Use these **exact** product identifiers (defined in `src/utils/purchases.js`):

| Plan    | Product ID                        |
|---------|-----------------------------------|
| Monthly | `fastcaption_premium_monthly`     |
| Yearly  | `fastcaption_premium_yearly`      |

- In **App Store Connect**: create auto-renewable subscriptions with these Product IDs.
- In **RevenueCat** → **Product Catalog** → **Products**: add products with the same identifiers and link your Apple app.

### 3.2 Entitlement: FastCaption Pro

1. In RevenueCat: **Project → Entitlements**.
2. Create an entitlement:
   - **Identifier:** `pro` (this is what the app checks: `ENTITLEMENT_ID` in `src/utils/purchases.js`).
   - **Display name:** e.g. "FastCaption Pro".

Attach your **Monthly** and **Yearly** products to this entitlement so that when a user buys either, they get the `pro` entitlement.

### 3.3 Offering (monthly / yearly packages)

1. In RevenueCat: **Project → Offerings**.
2. Create or edit the **default** offering (identifier: `default`).
3. Add packages and attach the products from step 3.1:
   - **Monthly** — package type `$rc_monthly` (or custom), product = `fastcaption_premium_monthly`.
   - **Yearly** — package type `$rc_annual` (or custom), product = `fastcaption_premium_yearly`.

The paywall will show these packages. You can add more offerings or placements later and pass them to `presentPaywall({ offering })` or `getCurrentOffering(placementId)`.

### 3.4 Paywall (optional but recommended)

1. In RevenueCat: **Project → Paywalls**.
2. Create a paywall and assign it to your default offering (or placement).
3. Customize layout, copy, and pricing text in the dashboard.

The app uses **RevenueCat Paywall** via `presentPaywall()` so the UI is driven by your dashboard config.

**Docs:** [Displaying Paywalls](https://www.revenuecat.com/docs/tools/paywalls)

### 3.5 Customer Center (optional)

1. In RevenueCat: **Project → Customer Center**.
2. Enable and configure “Manage subscription”, “Restore purchases”, and any custom actions.

The app uses **Customer Center** for “Manage subscription & billing” when the user is already Pro (`presentCustomerCenter()`).

**Docs:** [Customer Center](https://www.revenuecat.com/docs/tools/customer-center)

---

## 4. App usage

### Entitlement check (FastCaption Pro)

```js
import { useSubscription, ENTITLEMENT_ID } from "@/utils/purchases";

function MyScreen() {
  const { isPro, customerInfo, isLoading, error } = useSubscription();

  if (isLoading) return <Loading />;
  if (error) return <Text>Error: {error}</Text>;

  if (isPro) {
    // User has FastCaption Pro (monthly or yearly)
    return <ProContent />;
  }

  return <FreeContent />;
}
```

### Present paywall

```js
const { presentPaywall, presentPaywallIfNeeded } = useSubscription();

// Always show paywall
await presentPaywall();

// Show only if user doesn’t have Pro (e.g. before gated feature)
await presentPaywallIfNeeded();
```

### Optional: specific offering

```js
import { getCurrentOffering } from "@/utils/purchases";

const offering = await getCurrentOffering(); // or getCurrentOffering("placement_id")
await presentPaywall({ offering });
```

### Customer info and restore

```js
const { customerInfo, refresh, restorePurchases } = useSubscription();

// customerInfo.entitlements.active[ENTITLEMENT_ID] — Pro status
// customerInfo.activeSubscriptions — product identifiers

await refresh();           // Refetch customer info
await restorePurchases();  // Restore previous purchases (e.g. new device)
```

### Present Customer Center (manage subscription)

```js
const { presentCustomerCenter } = useSubscription();
await presentCustomerCenter();
```

---

## 5. Error handling and best practices

- **Always handle errors:** The hook exposes `error`; show a short message or retry.
- **Restore:** Provide a “Restore purchases” action (e.g. in paywall or Settings) and call `restorePurchases()`.
- **User identity:** After sign-in, call `syncRevenueCatUser(appUserId)` so the subscription is tied to the account (see `src/utils/purchases.js`).
- **Paywall result:** Use `PAYWALL_RESULT` to show a “Welcome to Pro!” message when `result === PAYWALL_RESULT.PURCHASED` or `PAYWALL_RESULT.RESTORED`.
- **Testing:** Use sandbox test accounts (App Store Connect / Google Play) and RevenueCat test API keys (e.g. `test_...`) for development.

---

## 6. Product configuration summary

| Product   | Identifier (use exactly)           | Type                         |
|----------|-------------------------------------|------------------------------|
| Monthly  | `fastcaption_premium_monthly`       | Auto-renewable subscription  |
| Yearly   | `fastcaption_premium_yearly`       | Auto-renewable subscription  |

In RevenueCat:

- **Entitlement:** `pro` (FastCaption Pro).
- **Offering:** `default` with packages for monthly and yearly.
- **Paywall:** Assigned to default offering (or your placement).
- **Customer Center:** Enabled for manage / restore.

The app is already wired: Settings shows “Upgrade to FastCaption Pro” / “FastCaption Pro” and presents the paywall or Customer Center accordingly.
