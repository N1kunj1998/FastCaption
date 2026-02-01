# FastCaption — App Growth & Monetization Improvements

Actionable improvements inspired by growth playbooks (mobile app to $20K/month, Discord/Twitter community growth, SaaS without audience, proven app ideas). Each section ties directly to FastCaption: short-form script generation, Pro subscription, free trial, and Library.

**📌 Video playbooks applied:** See **[GROWTH_PLAN_FROM_VIDEOS.md](GROWTH_PLAN_FROM_VIDEOS.md)** for a plan built from: Prayer Lock ($20K/mo, onboarding + TikTok/ads), Algrow (Discord first 400 users), Cleo (waitlist + emails → $60K/mo), SiteGPT (free tools → SEO → $13K MRR). Key targets: **≥10% download → trial**, one content format at volume, Discord value-first, emails for conversion, free tools for SEO.

---

## 1. Product & value (from “Proven App Ideas” / “Simple + money-making”)

**Principle:** One clear pain, one clear solution, simple UX.

### In-app

- [ ] **Single hook on first launch** — After onboarding (or skip), show one line above the topic input: e.g. “Stuck on what to say? Get a full script in one tap.” Reinforce the one job: *no more blank page*.
- [ ] **“See example” before first generate** — Optional link or button: “See a sample script” that opens a read-only example (topic + hooks + 2–3 scenes). Reduces anxiety and sets expectations.
- [ ] **Niche-first framing** — Onboarding already captures niche/style; reuse it on Generate: e.g. “Scripts for [Niche]” or “Optimized for [Style]” as a small badge so users feel the product is *for them*.
- [ ] **One primary metric in UI** — e.g. “You’ve created 12 scripts” (from Library count) on Generate or in Settings. Simple progress = stickiness.

**Out-of-app**

- [ ] **Landing page:** One headline (e.g. “Viral scripts for Reels & TikTok in seconds”), one CTA (App Store / Try free), 2–3 short benefits. No feature dump.
- [ ] **App Store subtitle & description:** Lead with outcome (“Viral scripts in seconds”) and audience (“creators”, “Reels”, “TikTok”), not “AI script generator”.

---

## 2. Onboarding & activation (from “Mobile app $20K playbook”)

**Principle:** Get to “first win” fast; reduce drop-off at each step.

### In-app

- [ ] **Shortest path to first script** — Default: 2 steps (niche → style) then straight to Generate. Optional “Skip and explore” so they can generate immediately with a generic format.
- [ ] **Pre-fill one “Try these” on first visit** — When topic is empty, auto-select or highlight one “Try these” chip so one tap fills the field and they only need to tap “Generate” for first script.
- [ ] **First script = first save** — After first successful generation, prompt once: “Save to Library?” (or auto-save first script) so they have a reason to return.
- [ ] **Trial start on first sign-in** — You already have trial logic; ensure trial starts the moment they sign in (or first generation), and show “X days left · Y generations today” clearly so the value of Pro is obvious before trial ends.

**Out-of-app**

- [ ] **Email (optional):** If you add email capture (e.g. post-sign-up), one automated email: “Your first script is waiting” + link to open app. Don’t over-email.

---

## 3. Retention & habit (from “$20K playbook” / “$60K in 2 months”)

**Principle:** Give a reason to open the app again; make the habit obvious.

### In-app

- [ ] **Gentle “Come back” nudge** — If user hasn’t opened in 3–5 days and you have push (or in-app message): “Your next script is one tap away” with a deep link to Generate. Don’t spam.
- [ ] **Library as the “home of my work”** — Empty state: “Your scripts will appear here. Create your first one.” After they have scripts: consider “Last used” or “Recent” at top so Library feels alive.
- [ ] **Streak or count (light)** — Optional: “You’ve created N scripts” in Settings or on Generate. No gamification overload; just a simple number that grows.
- [ ] **Pro reminder at the right time** — When trial is about to end (e.g. last day) or when they hit the daily limit, show one clear paywall with benefit: “Unlimited scripts, no daily cap.” Not every time they open the app.

**Out-of-app**

- [ ] **Push notifications (if you add them):** Only for high-intent moments: e.g. “Your trial ends tomorrow — upgrade to keep unlimited scripts.” Or “New format added: POV Skit.”

---

## 4. Monetization & pricing clarity (from “$60K in 2 months” / “SaaS without audience”)

**Principle:** One simple offer; make the upgrade feel like a no-brainer at the moment of need.

### In-app

- [ ] **One sentence for Pro** — Everywhere you mention Pro, use the same line: e.g. “Unlimited scripts, no daily limit.” Same in paywall, Settings, and trial-ended state.
- [ ] **Trial countdown visible** — On Generate, you already show “X of 10 today · 3-day trial”. Option: add “Trial ends [date]” in Settings or under the caption so they know when the free period ends.
- [ ] **Restore & support** — “Restore purchases” and “Contact support” (email or in-app form) in Subscription / Settings. Reduces refunds and builds trust.
- [ ] **Price in local currency** — RevenueCat handles this; ensure paywall shows monthly/yearly and “per week” or “per month” so the value is obvious (e.g. “Less than a coffee per month”).

**Out-of-app**

- [ ] **One pricing page** — If you have a website, one page: Free trial (3 days, 10/day) → Pro (unlimited). No feature comparison table unless it’s very short.

---

## 5. Viral & share loops (from “$60K in 2 months” / “Product-led growth”)

**Principle:** Let the product spread; make sharing low-friction and rewarding.

### In-app

- [ ] **Share script (native share sheet)** — You have or can add “Share” on the Result screen. Copy + “Share” button that opens the system share sheet (script text or “I used FastCaption to write this script”). No forced “Tag us”; optional “Share and get 1 free day” later if you add referral logic.
- [ ] **“Made with FastCaption” (optional)** — In export or share: optional footer “Script made with FastCaption” so recipients discover the app. Don’t make it mandatory.
- [ ] **Referral (later)** — “Give a friend 1 week Pro, get 1 week free.” Implement only after you have stable retention; track via referral code or link.

**Out-of-app**

- [ ] **Testimonials / before–after** — Collect 3–5 short quotes or screenshots (“Went from blank page to script in 2 minutes”). Use on landing page and App Store.

---

## 6. Community & distribution (from “Discord SaaS” / “Twitter $10K”)

**Principle:** Be where your users are; use community for feedback and word of mouth.

### Out-of-app

- [ ] **Find your audience** — Creators (TikTok, Reels, YouTube Shorts), coaches, course sellers, small businesses. They hang out on: TikTok, Instagram, Twitter/X, Reddit (r/socialmedia, r/YouTubeCreators), Discord servers about content creation.
- [ ] **Discord (or similar)** — One server: “FastCaption creators”. Use for: support, feature requests, “share your first script” (with permission), early access to new formats. Not for hard selling; useful content + helpful support = word of mouth.
- [ ] **Twitter/X** — Build in public: “Shipped: POV Skit format”, “We hit X scripts generated”, “How we reduced time-to-first-script”. One clear tip or outcome per tweet; link to app or landing page in bio.
- [ ] **Content that helps first** — Short tips: “3 hook formulas that work on Reels”, “How to go from idea to script in 60 seconds”. End with “FastCaption can write the first draft for you.” SEO + value = organic traffic.

---

## 7. ASO & first impression (from “Mobile app $20K playbook”)

**Principle:** Store listing and first open should match one promise: viral scripts, fast.

### In-app

- [ ] **Splash / first screen** — Align with your one promise: e.g. “Viral scripts in seconds” or “Never stare at a blank page again.” Then onboarding or Generate.
- [ ] **Screenshots for store** — 3–5 screens: (1) Generate with a filled topic, (2) Result with hooks + script, (3) Library, (4) “Pro: unlimited scripts.” Overlay short benefit text on each (e.g. “One tap to full script”).

### Out-of-app

- [ ] **App Store / Play Store**  
  - **Title:** FastCaption – Viral Scripts or FastCaption: Scripts for Reels & TikTok  
  - **Subtitle:** One line with outcome + audience.  
  - **Description:** First 2–3 lines = the problem + solution. Then bullets: trial, Pro, formats, save/share. Keywords: script, Reels, TikTok, viral, hook, short-form, creator.
- [ ] **Ratings prompt** — After 2–3 successful generations (and if they’ve saved a script), show a single prompt: “Loving FastCaption? A quick rating helps us a lot.” Link to store. Don’t ask again for 6+ months or after major version.

---

## 8. Trust & credibility (from “SaaS without audience” / “First SaaS $25K”)

**Principle:** Reduce friction and doubt; show that others use and trust the app.

### In-app

- [ ] **Privacy & terms** — Links in Settings (you may already have). Short privacy note: “We use your topic and preferences to generate scripts; we don’t sell your data.” If you use AI providers, one line: “Scripts are generated via [OpenAI / our API].”
- [ ] **Support** — One visible “Help” or “Contact us” (email or form). Reply fast to early users; their feedback is your growth lever.
- [ ] **Pro guarantee (optional)** — “Cancel anytime” or “7-day money-back” in paywall if your policy allows. Reduces upgrade hesitation.

**Out-of-app**

- [ ] **Social proof** — “Join X creators who write scripts in seconds.” Or “Rated 4.8” once you have enough reviews. Use on landing and in store.

---

## 9. Implementation priority

| Priority | Area              | Why first |
|----------|-------------------|-----------|
| 1        | Single value hook + “See example” | Clear positioning and less anxiety on first use. |
| 2        | Trial visibility + Pro one-liner   | Converts trial users before they churn. |
| 3        | Share script (native)              | Zero-cost distribution. |
| 4        | ASO (title, subtitle, description)| More organic installs. |
| 5        | Ratings prompt (after 2–3 scripts) | Better store ranking and trust. |
| 6        | Community (Discord or Twitter)     | Long-term feedback and word of mouth. |
| 7        | Referral / “Give a friend Pro”     | After retention is solid. |

---

## 10. Metrics to watch

- **Activation:** % of installs that complete at least one generation.
- **Trial → Pro:** % of trial users who subscribe before trial ends.
- **Retention:** D1, D7, D30 (open app again).
- **Share:** % of users who tap “Share” on a script (if you track it).
- **ASO:** Impressions, installs, and conversion from store listing (App Store Connect / Play Console).

---

*This doc is based on common themes from growth playbooks (mobile $20K, Discord/Twitter, SaaS without audience, proven app ideas). For exact tactics from your PDFs, pull direct quotes and add them as “Source: [PDF name]” under the relevant section.*
