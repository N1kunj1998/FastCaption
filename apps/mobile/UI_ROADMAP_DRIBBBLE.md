# FastCaption — Dribbble-Inspired UI Roadmap

A detailed roadmap to elevate FastCaption’s UI using principles from modern mobile app design (inspired by [Dribbble’s mobile design community](https://dribbble.com/search/mobile)): **minimal layouts**, **clear hierarchy**, **premium feel**, **micro-interactions**, and **consistent product design**.

---

## Design Principles (from Dribbble mobile trends)

| Principle | What it means for FastCaption |
|-----------|-------------------------------|
| **Minimal & clean** | Fewer visual elements, more whitespace, one primary action per section. No clutter. |
| **Clear hierarchy** | One headline per screen, clear sections (cards/surfaces), secondary info de-emphasized. |
| **Premium feel** | Subtle gradients, soft shadows, rounded corners (12–20px), cohesive color palette. |
| **Motion & feedback** | Small animations (fade, scale, slide), loading skeletons, success states, haptics. |
| **Content-first** | Typography is readable (size, line-height); copy is short and benefit-led. |
| **Empty states** | Illustrated or icon-led empty states with one clear CTA, not blank screens. |
| **Native patterns** | Bottom sheets for modals, pull-to-refresh, swipe actions, system-like controls. |

---

## Current Gaps (why the UI feels “poor”)

1. **No visual “hero”** — Generate screen is functional but doesn’t feel like a product; missing a clear focal point or brand moment.
2. **Flat hierarchy** — Everything has similar weight; no clear “primary” vs “supporting” content.
3. **Little motion** — No skeleton loading, no subtle transitions, no micro-interactions (press states are basic).
4. **Generic look** — Purple/pink accents are fine but underused; no gradient, blur, or depth to create a “premium” feel.
5. **Empty states** — Library/Settings may still feel bare when there’s no data.
6. **Modals feel heavy** — Auth and preferences could use bottom-sheet style and lighter copy.
7. **Typography** — Could be bolder (display-style headline) and more intentional (letter-spacing, line-height).
8. **Tab bar** — Functional but not distinctive; no active indicator or subtle animation.

---

## Phase 1 — Visual identity & design system upgrade

**Goal:** Give the app a clear, premium visual language so every screen feels part of one product.

### 1.1 Brand & color

- [x] **Primary gradient** — Define a short gradient for hero/CTA (e.g. `#8B5CF6` → `#A78BFA` or a soft pink accent). Use only in 1–2 places (hero strip, primary button) so it stays special.
- [x] **Surface hierarchy** — Ensure 3 levels: `background` (screen), `surface` (cards), `surfaceElevated` (modals/sheets). Add very subtle borders or shadows so layers are obvious.
- [x] **Accent usage** — Use accent (e.g. pink/gold) only for: primary CTA, active tab, key icons, links. Avoid accent on every card.

### 1.2 Typography

- [x] **Display headline** — On Generate, use a larger, bolder “Generate” or “Create” (e.g. 32–36px, heavy weight) so the screen has one clear anchor.
- [x] **Subhead** — One short value prop (e.g. “Viral-ready scripts in seconds”) in `textSecondary`, slightly smaller than body.
- [x] **Labels** — All section labels (Script Format, Duration, etc.) same style: `label` token, `textSecondary`; consistent spacing above/below.

### 1.3 Depth & elevation

- [x] **Shadows** — Use `shadow.sm` on cards, `shadow.md` on modals/sheets. Ensure shadow color works in dark mode (e.g. transparent black).
- [ ] **Blur (optional)** — Consider a very subtle blur on tab bar or modal backdrop (e.g. `BlurView`) for a modern iOS feel.

**Deliverables:** Updated `designTokens.js` (optional gradient helpers); `themeStore` with clear surface hierarchy; 1–2 key screens (e.g. Generate hero) updated to new type and gradient. ✅ Done.

---

## Phase 2 — Generate screen (home) as the “hero”

**Goal:** Make the first screen feel like a premium product: clear hierarchy, one focal CTA, light motion.

### 2.1 Hero block

- [ ] **Headline** — Single strong headline (e.g. “Create your script”) with display typography; below it, one line value prop.
- [ ] **Trial/Pro line** — One compact line (e.g. “3 days free · 10/day” or “Unlimited with Pro”) in caption style; no extra boxes unless needed.
- [ ] **Optional gradient strip** — Thin gradient bar or soft gradient behind headline (full-width, low height) to anchor the top.

### 2.2 Form layout

- [ ] **Sections as cards** — Wrap “Script format”, “Topic”, “Duration” in a single card (or one card per section) with consistent padding and radius. Creates clear grouping.
- [ ] **Topic input** — Remain the main focus: large, single prominent input; placeholder with a concrete example; character count only when near limit.
- [ ] **Format chips** — Horizontal scroll, snap optional; chips with clear selected state (fill or border + background change). Keep emoji if they help recognition.
- [ ] **Duration** — Compact: two chips (30s / 60s) or a small segmented control.

### 2.3 Primary CTA

- [ ] **One button** — Full-width “Generate script” with optional icon (e.g. Sparkles). Use primary color or gradient; disabled state clearly different (opacity or muted color).
- [ ] **Loading** — Button shows spinner + “Generating…” and is disabled; no layout jump. Optional: very short skeleton below for “result” area.

### 2.4 Micro-interactions

- [ ] **Press states** — All tappable areas: slight opacity or scale (e.g. 0.98) on press.
- [ ] **Optional haptic** — Light haptic on Generate tap (and on copy/save elsewhere).

**Deliverables:** Generate screen refactored with hero block, card grouping, and updated CTA; optional gradient and press/haptic.

---

## Phase 3 — Result (script) screen

**Goal:** Script is easy to scan, copy, and act on; remix and save feel integrated, not tacked on.

### 3.1 Layout

- [ ] **Topic** — Shown once at top as a small label or chip, not a big title.
- [ ] **Hooks** — Section “Hooks” with one hook at a time (or tabs); large readable text; copy button per hook with instant feedback (toast).
- [ ] **Script / scenes** — Numbered blocks or cards per scene; “Copy all” plus per-block copy; comfortable line-height.

### 3.2 Actions

- [ ] **Save / Remix** — Same Button/Chip components as elsewhere; loading states; success toast.
- [ ] **Share** — Native share sheet for full script; icon in header or action bar.

### 3.3 Polish

- [ ] **Collapsible sections** — B-roll, CTA, caption in collapsible blocks so the screen isn’t overwhelming.
- [ ] **Back** — Clear back to Generate; optional “New script” button.

**Deliverables:** Result screen with clear sections, copy/save/remix with toasts, optional share and collapsible blocks.

---

## Phase 4 — Onboarding

**Goal:** Feel welcoming and professional; minimal steps, clear progress, one CTA per step.

### 4.1 Structure

- [ ] **Progress** — Dots or thin progress bar (e.g. step 1 of 2).
- [ ] **Step 1 (niche)** — Title + subtitle; large tappable cards per niche; optional short description.
- [ ] **Step 2 (style)** — Same pattern; “Back” to change niche.
- [ ] **Skip** — Text button, secondary style; “Get started” primary at the end.

### 4.2 Visual

- [ ] **Spacing & type** — Use design tokens; comfortable padding.
- [ ] **Optional** — Subtle fade-in per step or one small illustration/icon per step.

**Deliverables:** Onboarding using design system; progress indicator; consistent buttons.

---

## Phase 5 — Library & Settings

**Goal:** Library feels like a first-class place to find past work; Settings feel organized and trustworthy.

### 5.1 Library

- [ ] **Tabs** — “Scripts” / “Favorites” with clear active state (underline or fill).
- [ ] **List** — One card per script: topic as title, optional date/format; tap → Result. Swipe or long-press to delete with confirmation.
- [ ] **Empty state** — Illustration or icon + “No scripts yet” + “Create your first script” + CTA to Generate (use EmptyState component).

### 5.2 Settings

- [ ] **Sections** — Grouped: Appearance, Account, Subscription, Preferences, About. Section headers + list rows; theme toggle, account row, subscription row, links (Terms, Privacy, Upgrade), reset onboarding with confirmation.
- [ ] **Modals** — Niche/style preferences in bottom sheet or modal with same tokens and Chip/Button components.

**Deliverables:** Library and Settings with cards, empty states, and themed modals/sheets.

---

## Phase 6 — Auth & global polish

**Goal:** Auth feels part of the app; whole app feels responsive and consistent.

### 6.1 Auth

- [ ] **Sheet** — Auth in a bottom sheet (or modal) with theme background and card; “Sign in or sign up” + one line benefit.
- [ ] **Buttons** — Apple (black) and Google (outline or light fill); loading states; Cancel secondary.

### 6.2 Motion & feedback

- [ ] **Toasts** — “Copied!”, “Saved!”, “Remix applied” via toast; reduce Alerts for success.
- [ ] **Loading** — Same spinner/skeleton pattern on Generate, Result, Save, Library load.
- [ ] **Transitions** — Optional: light fade or slide on Generate → Result.

### 6.3 Accessibility & robustness

- [ ] **Labels** — All interactive elements have `accessibilityLabel` (and hint where helpful).
- [ ] **Safe areas & keyboard** — Insets and KeyboardAvoidingView so content isn’t hidden.

**Deliverables:** Auth sheet themed; toasts and loading consistent; accessibility and safe areas verified.

---

## Phase 7 — Delight & differentiation (optional)

- [ ] **Splash** — Branded splash until app is ready.
- [ ] **Onboarding** — Short Lottie or “See example script” on last step.
- [ ] **Generate** — “Try these” topics as chips that fill topic input.
- [ ] **Library** — Search or filter by niche/format; sort by date.
- [ ] **Settings** — “Rate us”, “Feedback”, app version.

---

## Implementation order

| Order | Phase | Why |
|-------|--------|-----|
| 1 | Phase 1 — Visual identity & design system | Foundation for all screens; gradient and type set the tone. |
| 2 | Phase 2 — Generate (hero) | Main screen; biggest impact on “poor → premium” feel. |
| 3 | Phase 6 — Auth & global polish | Themed auth and toasts/loading so nothing feels old. |
| 4 | Phase 3 — Result | High usage; clear sections and copy/save/remix polish. |
| 5 | Phase 4 — Onboarding | Short; one pass with tokens and progress. |
| 6 | Phase 5 — Library & Settings | Cards, empty states, sections. |
| 7 | Phase 7 — Optional | As time allows. |

---

## Reference links

- [Dribbble – Mobile design search](https://dribbble.com/search/mobile) — modern mobile app UI, product design, minimal interfaces.
- Use “Product Design” and “Mobile” filters for layouts similar to content-creation and utility apps.

---

## Success criteria

- One clear “hero” per main screen (especially Generate).
- All screens use the same typography scale, spacing, and theme (no random magic numbers or hardcoded colors).
- Primary actions use one Button component with loading and disabled states.
- Empty states use EmptyState (or equivalent) with icon/illustration + CTA.
- Copy/save/remix give immediate feedback (toast where appropriate).
- Auth and modals use theme and feel like part of the app, not system dialogs.
- Optional: subtle motion (press states, skeleton, light transition) so the app feels alive.

---

## File / folder structure (reference)

```
src/
  constants/
    designTokens.js   # spacing, radius, typography, shadows; optional gradient
  components/
    ui/
      Button.jsx, Card.jsx, Input.jsx, Chip.jsx, Section.jsx, EmptyState.jsx, Toast.jsx
  utils/
    themeStore.js     # background, surface, surfaceElevated, primary, accent, tab bar
  app/
    (tabs)/_layout.jsx
    (tabs)/index.jsx  # Generate
    result.jsx
    onboarding.jsx
    (tabs)/library.jsx
    (tabs)/settings.jsx
```

Use this roadmap in parallel with `UI_IMPROVEMENT_PLAN.md`; treat Phase 1–2 here as the main lever for moving from “poor” to “premium” UI with minimal scope.
