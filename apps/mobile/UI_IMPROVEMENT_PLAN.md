# FastCaption — UI Improvement Plan

A phased plan to bring the FastCaption mobile app UI up to modern standards and best-in-class UX.

---

## Current State (Summary)

- **Screens:** Root redirect, Onboarding (2 steps), Generate (home), Result (script view), Library (saved/favorites), Settings
- **Theme:** Light/dark with basic palette; tab bar is hardcoded light (`#fff`), not theme-aware
- **Styling:** Inline styles, no shared design tokens; typography and spacing vary by screen
- **Components:** Minimal reuse; modals and forms are screen-specific
- **Motion:** None beyond default Modal animation; no micro-interactions or skeleton states
- **Auth:** Native Apple/Google sheet; sign-in overlay modal on Generate

---

## Phase 1 — Design System & Foundations

**Goal:** Establish a single source of truth for typography, spacing, colors, and components so all screens feel consistent and future changes are easy.

### 1.1 Design tokens

- [x] **Typography scale** — Define and use named styles (e.g. `heading1`, `heading2`, `body`, `caption`, `label`) with consistent font sizes and weights. Consider a variable font or system stack (SF Pro on iOS).
- [x] **Spacing scale** — Use a 4/8px grid (e.g. 4, 8, 12, 16, 24, 32, 48) and named tokens (`space.sm`, `space.md`, `space.lg`) instead of magic numbers.
- [x] **Radius scale** — Consistent border radii (e.g. 8, 12, 16, 20, 24) for cards, inputs, modals, buttons.
- [x] **Theme extension** — Extend `themeStore` with semantic tokens (e.g. `surface`, `surfaceElevated`, `success`, `error`, `warning`) and ensure **tab bar and all modals** use theme (no hardcoded `#fff` / `#000`).

### 1.2 Reusable UI components

- [x] **Button** — Primary, secondary, ghost, danger; with loading state, disabled state, and optional icon. Use consistent height and padding from tokens.
- [x] **Card** — Base card with optional padding, border, shadow; used for list items, settings rows, format chips container.
- [x] **Input** — Text input with label, placeholder, error state, optional character count; use theme colors and radius.
- [x] **Chip / Pill** — Selectable format chips (current “Script Format” row) with clear selected/unselected styles.
- [x] **Section** — Section title + optional action; used in Settings and Library.
- [ ] **Empty state** — Illustration or icon + title + short description + optional CTA (used in Library, empty presets, etc.).

### 1.3 Tab bar & navigation

- [x] **Theme-aware tab bar** — Background, border, active/inactive colors from theme (no hardcoded `#fff`, `#E5E7EB`, `#000`).
- [ ] **Optional:** Slightly larger tap targets and clearer active state (e.g. small indicator or filled icon when active).

**Deliverables:** New files e.g. `src/constants/designTokens.js`, `src/components/ui/Button.jsx`, `Card.jsx`, `Input.jsx`, `Chip.jsx`, `EmptyState.jsx`; updated `themeStore`; tab layout using theme. ✅ **Done.**

---

## Phase 2 — Generate (Home) Screen

**Goal:** Make the main screen feel premium, clear, and motivating so users want to create scripts.

### 2.1 Layout & hierarchy

- [x] **Hero area** — Clear headline and one-line value proposition; optional subtle gradient or brand accent. Use typography scale.
- [x] **Single-column flow** — Presets (if any) → Script format → Topic input → Duration → CTA. Consistent vertical rhythm (spacing tokens).
- [x] **Script format** — Use Chip component; consider horizontal scroll with snap or a compact grid so all options are visible without feeling cramped.
- [x] **Topic input** — Use Input component; placeholder that gives a concrete example; character count with warning near limit (e.g. turn red above 450).

### 2.2 Primary CTA & loading

- [x] **Generate button** — Full-width primary button with icon; disabled state when topic is empty; loading state with spinner and “Generating…” text (no layout jump).
- [ ] **Skeleton or shimmer** — Optional: show a short skeleton for “result” area while generating so the screen doesn’t feel stuck.

### 2.3 Sign-in overlay

- [x] **Modal** — Use theme background and text; blur or dimmed backdrop; card with clear “Sign in to create scripts” and one prominent CTA. Match radius and shadows to design tokens.
- [x] **Copy** — Short, benefit-focused; e.g. “Sign in once to save and sync your scripts.”

**Deliverables:** Generate screen refactored to use design tokens and new components; improved CTA and loading; themed sign-in overlay. ✅ **Done.**

---

## Phase 3 — Onboarding

**Goal:** Feel welcoming and professional; reduce drop-off and set expectations.

### 3.1 Structure & progress

- [x] **Progress indicator** — Dots or a thin progress bar so users know step 1 of 2 (and optional step 0: welcome).
- [x] **Step 1 (niche)** — Clear title and subtitle; large, tappable cards for each niche; optional short description per niche.
- [x] **Step 2 (style)** — Same treatment; “Back” to change niche without losing progress.
- [x] **Skip** — Keep skip option; make it secondary (e.g. text button) so it’s clear but not dominant.
- [x] **Final CTA** — “Get started” or “Start creating”; primary button, consistent with Generate CTA.

### 3.2 Visual polish

- [x] **Spacing & typography** — Use tokens; comfortable padding and line height.
- [ ] **Optional:** Subtle entrance animation (fade/slide) per step, or simple illustration/icon per step to break text.

**Deliverables:** Onboarding uses design system; progress indicator; consistent buttons and spacing. ✅ **Done.**

---

## Phase 4 — Result (Script) Screen

**Goal:** Script is easy to read, copy, and act on; remix and save feel natural.

### 4.1 Script display

- [x] **Topic** — Shown once at top (small heading or label) so context is clear.
- [x] **Hooks** — Clear “Hooks” section; if multiple, tabs or segmented control to switch; one hook visible at a time with large, readable text. Copy button per hook.
- [x] **Script / scenes** — Numbered or clearly separated blocks; readable font size and line height; copy per block or “Copy all”.
- [x] **B-roll, CTA, caption** — Collapsible sections or tabs so the screen isn’t overwhelming; each with copy action.

### 4.2 Actions

- [x] **Copy** — Toast or inline “Copied!” instead of (or in addition to) alert where possible.
- [x] **Save** — Clear “Save to Library” button; loading state; success feedback.
- [x] **Remix** — Style chips (same as Chip component); loading state per remix; smooth update of hook text.
- [x] **Preset** — Modal for preset name uses Input + primary button; matches design system.

### 4.3 Navigation & empty

- [x] **Back** — Clear back to Generate; optional “New script” CTA on result screen.
- [x] **Error / invalid data** — Friendly message and one action (e.g. “Back to Generate”).

**Deliverables:** Result screen layout and sections refactored; copy/save/remix with clear states and feedback; themed modals. ✅ **Done.**

---

## Phase 5 — Library & Settings

**Goal:** Library feels like a first-class place to find past work; Settings feel organized and trustworthy.

### 5.1 Library

- [x] **Tabs** — “Scripts” and “Favorites” (or “Saved” / “Favorites”) with clear active state; use design tokens.
- [x] **List** — Card per script: topic (title), optional date or format; tap to open Result. Swipe or long-press to delete with confirmation.
- [x] **Empty state** — Use EmptyState component: icon, “No scripts yet”, “Generate your first script”, CTA to Generate.
- [x] **Favorites** — Same card style; empty state when no favorites.

### 5.2 Settings

- [x] **Sections** — Grouped by Appearance, Account, Subscription, Preferences, About. Use Section component; consistent padding and borders.
- [x] **Account row** — Show “Signed in as …” or “Sign in” with icon; use theme colors.
- [x] **Theme toggle** — Switch with label; matches design system.
- [x] **Preferences** — Niche & style; tap opens modal (or inline) with same niche/style options as onboarding; use Chip or list.
- [x] **Links** — Terms, Privacy, Upgrade; chevron or external icon; open in browser.
- [x] **Reset onboarding** — Secondary or text button; confirmation dialog before reset.

### 5.3 Modals (Preferences, etc.)

- [x] **Bottom sheet or modal** — Themed background and card; title + content + primary/secondary buttons. Use same radius and spacing as sign-in overlay.

**Deliverables:** Library and Settings refactored with design tokens and shared components; empty states; themed modals/sheets. ✅ **Done.**

---

## Phase 6 — Auth & Global Polish

**Goal:** Auth feels part of the app; app feels responsive and accessible.

### 6.1 Auth modal & sheet

- [x] **Sheet** — Use theme for background, card, and text (no hardcoded white). Match border radius and shadow to design system.
- [x] **Buttons** — Apple (black) and Google (outline or light fill) with clear labels; loading states; Cancel uses secondary style.
- [ ] **Copy** — “Sign in or sign up” and one line of benefit; optional “We only use this to save your scripts.”

### 6.2 Animations & feedback

- [x] **Micro-interactions** — Light press feedback on buttons (opacity or scale); optional haptic on primary actions.
- [ ] **Transitions** — Optional: fade or slide when navigating Generate → Result; modal present/dismiss already handled by OS/Modal.
- [ ] **Loading** — Consistent spinner or skeleton across Generate, Result remix, Save, Library load.
- [x] **Toasts** — Replace or supplement Alert for “Copied!”, “Saved!”, “Remix applied” where it improves flow.

### 6.3 Accessibility & robustness

- [x] **Labels** — Ensure interactive elements have `accessibilityLabel` (and `accessibilityHint` where helpful).
- [ ] **Focus order** — Logical order on Generate (topic → duration → format → button) and in modals.
- [ ] **Dynamic Type** — Where possible, use scalable text (e.g. allow font size to grow with system setting).
- [ ] **Safe areas** — Already using insets; verify on notched devices and when keyboard is open (KeyboardAvoidingView on Generate/Result if needed).

**Deliverables:** Auth sheet fully themed; consistent loading and toasts; accessibility improvements; optional small animations. ✅ **Done.**

---

## Phase 7 — Optional Enhancements

**Goal:** Differentiate and delight without scope creep.

- [x] **Onboarding** — Short video or Lottie animation on final step; or “See example script” link.
- [x] **Generate** — Optional “Trending topics” or “Try these” suggestions as chips that fill the topic input.
- [x] **Result** — Optional “Share” (native share sheet) for script text.
- [x] **Library** — Search or filter by niche/format; sort by date.
- [x] **Settings** — Optional “Rate us” and “Feedback” links; show app version.
- [x] **Splash** — Branded splash screen (already have asset); ensure it shows until app is ready.

---

## Implementation Order (Suggested)

| Order | Phase        | Rationale |
|-------|--------------|-----------|
| 1     | Phase 1      | Design system and components unblock all other phases. |
| 2     | Phase 2      | Generate is the main screen; quick visible win. |
| 3     | Phase 6 (auth) | Themed auth and global polish so nothing feels “old” while we do the rest. |
| 4     | Phase 3      | Onboarding is short; can be updated in one pass. |
| 5     | Phase 4      | Result is heavy; do after tokens and components exist. |
| 6     | Phase 5      | Library and Settings benefit from Card, Section, EmptyState. |
| 7     | Phase 7      | As time allows. |

---

## File / Folder Structure (Proposed)

```
src/
  constants/
    designTokens.js    # spacing, radius, typography scale
    theme.js           # optional: extend or re-export theme + tokens
  components/
    ui/
      Button.jsx
      Card.jsx
      Input.jsx
      Chip.jsx
      Section.jsx
      EmptyState.jsx
    KeyboardAvoidingAnimatedView.jsx  # keep; can use tokens
  utils/
    themeStore.js      # extend with semantic tokens
  app/
    (tabs)/_layout.jsx # use theme for tab bar
    ...
```

---

## Success Criteria

- All screens use the same typography scale, spacing scale, and theme (no hardcoded colors for background, text, borders).
- Tab bar and all modals (auth, sign-in overlay, preferences) respect light/dark theme.
- Primary actions (Generate, Sign in, Save, Get started) use one Button component with clear states.
- Empty states exist for Library (no scripts, no favorites) and feel intentional.
- Copy/save/remix give clear feedback (loading + success) and, where possible, non-blocking (toast).
- Accessibility: key actions have labels; focus order is logical; safe areas and keyboard are handled.

---

## Notes

- **Scope per phase:** Each phase can be split into smaller PRs (e.g. “Phase 1: tokens only”, “Phase 1: Button + Card”).
- **Design reference:** Pick 1–2 reference apps (e.g. Linear, Arc, or a top content-creation app) for density, typography, and tone.
- **Assets:** If you add illustrations or Lottie, keep them in `assets/` and reference in this plan where they’re used.
