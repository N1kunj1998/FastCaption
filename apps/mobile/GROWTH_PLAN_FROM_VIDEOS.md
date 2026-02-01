# FastCaption — Growth Plan (from Video Playbooks)

This plan is built directly from the strategies you extracted:

1. **Prayer Lock / Mal Baron** — Mobile app to $20K+/month in 6 months (TikTok/IG + paid ads, onboarding obsession)
2. **Algrow / Sam** — $14K/month SaaS, first 400 users from **Discord** (no ads)
3. **Cleo / Lara** — $60K/month in 2 months (waitlist, webinars, **emails** = conversion weapon)
4. **SiteGPT / Bonu** — $13K MRR, **0 paid marketing** (free tools → SEO → signups)

Below: **what to steal from each** and a **prioritized FastCaption action plan**.

---

## What to steal from each playbook

| Source | Main lesson | FastCaption application |
|--------|-------------|-------------------------|
| **Prayer Lock** | Onboarding is the conversion engine. 5 min → 15 min (value + story) = 3x conversion. Goal: **10% download → trial**. | Lengthen onboarding with **story + value** (why scripts matter, show example), not more steps. Measure download → trial %. |
| **Prayer Lock** | Optimize ads for **trials/conversions**, not installs. Only run paid on content with **10K+ organic views**. | When you run ads, use RevenueCat/attribution for trial start, not just install. Boost only best organic videos. |
| **Prayer Lock** | One viral format + volume (e.g. UGC reaction + app demo). 2–20 posts/day. | One format: “Creator stuck on script → opens app → gets script in seconds.” Repeat on TikTok/Reels. |
| **Algrow** | **Discord** = early customers. Join niche servers, screen-share in voice (no spam), provide value first, then share link. | Join creator/Reels/TikTok/YouTube Shorts Discords. Help with script tips, then “I use this app for first drafts.” |
| **Algrow** | Build **your own Discord** early; early users get free access → they bring paying friends. | FastCaption Discord: “Script creators.” Invite early users, give free Pro for feedback; they demo to friends. |
| **Cleo** | **Build demand before launch.** Content (edu) → Waitlist → Emails (warm 4 weeks) → Webinar → Launch. | If you do a “relaunch” or big feature: waitlist, 4–5 edu emails, then “FastCaption Pro 2.0 is live.” |
| **Cleo** | **Emails convert more than viral content.** Educate, don’t sell, until launch email. | Collect email (post-sign-up or lead magnet). Send “How to write hooks that stop the scroll” etc.; then one “Pro is here” email. |
| **Cleo** | **Scarcity:** “Only 500 spots,” “Early access pricing ends.” Landing = curiosity, not full explain. | Paywall or landing: “Limited spots for early pricing.” App Store description: benefit-led, not feature list. |
| **SiteGPT** | **Free tools = SEO = traffic.** Build small tools (e.g. “Hook generator,” “Script outline”) that rank; CTA to app. | Build 5–10 free web tools: “TikTok hook generator,” “Reels script template,” “Caption generator.” Each page: CTA to FastCaption. |
| **SiteGPT** | Keywords: **KD ≤ 10**, volume ≥ 1000. One tool per keyword; reuse template. | Ahrefs/Similar: “TikTok script generator,” “Reels hook generator,” “short form script template.” Ship simple tool pages. |

---

## North Star metric (from the videos)

- **Prayer Lock:** 10%+ download → trial conversion. If below that, paid ads don’t scale.
- **FastCaption equivalent:** Track **download → trial start %** and **trial → Pro %**. Aim for **≥10% download → trial**; then improve onboarding until you hit it.

---

## Phase 1: Onboarding = conversion engine (Prayer Lock)

**Goal:** Turn onboarding into a short **story + value** moment so users want to start the trial. Target **10%+ download → trial**.

### 1.1 Add value, not just steps

- [x] **Intro phase (3 storytelling slides)** before profile: “Viral scripts in seconds” → “One topic. Full script.” → “Create more. Stress less.” with Skip + Continue/Get started. Gradient strip + benefit copy (value-first).
- [x] **Profile phase:** 3 steps — (1) Niche, (2) Style, (3) Platform + optional Name. Copy reframed as personalization (“We’ll tailor…”, “So we can match…”).
- [x] **“See example script”** on final step → opens read-only example. Final CTA: “Start creating” or “You’re all set, [Name]!”
- [x] **Stored for later:** `userNiche`, `userStyle`, `userPlatform`, `userName` in AsyncStorage; name used on Generate (“Hey [Name],”) and all shown in Settings → Preferences.

### 1.2 “See example” before first generate

- [ ] On **Generate** screen, when topic is empty and user is new (e.g. first 2 sessions): show a small link **“See an example script”** that opens the same example (topic + hooks + 2–3 scenes) so they know what they’re getting.
- [ ] Reduces anxiety and sets expectations → more likely to tap “Generate” and hit trial.

### 1.3 Measure and tune

- [ ] **Track:** App open → onboarding complete, onboarding complete → first generate, first generate → trial start (sign-in + trial start).
- [ ] **Target:** ≥10% of users who finish onboarding should start trial (sign in + use trial). If below, add one “value” screen or example and A/B test.

**Deliverables:** 1 optional “why” or “what you get” screen, “See example script” on Generate for new users, analytics events for download → onboarding → first generate → trial.

---

## Phase 2: One content format + organic proof (Prayer Lock)

**Goal:** Find **one** format that gets 10K+ views organically; then reuse it and only later put paid behind it.

### 2.1 Pick one format

- [ ] **Format idea (UGC + demo):** “POV: you have to post a Reel in 1 hour and you have no script” → open FastCaption → type topic → get script. Show result screen. “This took 30 seconds.”
- [ ] **Alternatives:** “Before: 2 hours writing. After: 1 tap.” / “Stop scrolling if you’re a creator who hates writing scripts…”
- [ ] Post **minimum 2/day** (solo) or 10–20/day if you have an editor. Same format, different hooks/topics.

### 2.2 Where to post

- [ ] **TikTok + Instagram Reels** (same format, same strategy as Prayer Lock).
- [ ] Track which videos hit **10K+ views** and **high retention in first 3 seconds**. Those are the only ones to boost with paid later.

### 2.3 Paid ads only after organic proof

- [ ] **Do not** run Meta/TikTok ads for “installs.” Run for **trial starts** (RevenueCat or your backend: event “trial_started”).
- [ ] Use **TikTok Spark Ads** (boost creator’s organic post). Start with $20/day; scale only if cost per trial is profitable (e.g. trial at $4–5, annual at ~$50).
- [ ] **Rule:** Only boost videos that already got **10K+ organic views**.

**Deliverables:** 1 format doc (hook + script + CTA), 7-day content calendar, attribution set up for trial_started.

---

## Phase 3: Discord community (Algrow)

**Goal:** Get first 100–400 users from Discord without ads; then turn them into advocates.

### 3.1 Find where your users are

- [ ] **discboard.org** (or similar): search “TikTok,” “Reels,” “YouTube Shorts,” “content creator,” “faceless,” “short form.”
- [ ] Join **10 servers**. Read and **copy chat history** → paste into ChatGPT: “List recurring pain points about scripting / content / ideas.”
- [ ] Recurring pain = demand. FastCaption solves “blank page / script writing.”

### 3.2 Provide value before pitching

- [ ] **Do not** post “Hey I built an app, try it.” You get banned.
- [ ] **Do:** Answer script/hook questions, give tips. In **voice chat**, mute mic, **screen-share FastCaption**, use it to answer someone’s “how do I write a script for X?”. People will ask “What’s that?”
- [ ] Then DM or drop link: “It’s FastCaption — first draft in one tap. Here’s a link.”

### 3.3 Validate with DMs + Loom

- [ ] DM 5–10 people (from different servers): “What’s your biggest hassle with writing scripts for Reels/TikTok?”
- [ ] Send a **Loom** (or short screen recording) showing FastCaption: topic → generate → result.
- [ ] If they say “I need this” / “Where do I get it?” = validation. Send TestFlight/App Store link.

### 3.4 Your own Discord

- [ ] Create **“FastCaption”** or “FastCaption Creators” server. Invite everyone who tried the app or asked for the link.
- [ ] **Early users:** Give 1–3 months free Pro in exchange for feedback. When they tell friends, friends pay; early user can screen-share and show the app = word of mouth.

**Deliverables:** List of 10 Discord servers, 1 Loom “demo” video, Discord server invite link, simple “free Pro for feedback” rule for first 50 users.

---

## Phase 4: Waitlist + email (Cleo)

**Goal:** Use email as the conversion weapon; warm list before any “launch” or big paywall push.

### 4.1 Waitlist (if you do a relaunch or big feature)

- [ ] Landing page: **curiosity**, not full product explain. “Viral scripts in seconds. Join the list for early access.”
- [ ] One CTA: “Join waitlist.” No public “Buy now” until you’re ready to convert.

### 4.2 Collect email

- [ ] **Where:** Post-sign-up (optional field “Get tips and early access”), or lead magnet (“10 hook templates” PDF in exchange for email).
- [ ] Store in your backend or tool (Mailchimp, Loops, Resend, etc.).

### 4.3 Warm list before “launch”

- [ ] **4 weeks before** a launch or paywall push: send **5–10 emails** that **educate**, don’t sell.
  - “Why most Reels scripts feel generic (and how to fix it)”
  - “3 hook formulas that stop the scroll”
  - “How to go from idea to script in 60 seconds”
- [ ] Last email: “FastCaption Pro / 2.0 is live — try it now.” One CTA, one link.

**Deliverables:** Waitlist landing (optional), email capture (in-app or lead magnet), 5-email pre-launch sequence (drafts).

---

## Phase 5: Free tools = SEO (SiteGPT)

**Goal:** Build 5–10 free web tools that rank for “script / hook / Reels / TikTok” keywords; each tool page has a CTA to FastCaption.

### 5.1 Keyword list

- [ ] Use Ahrefs (or Ubersuggest, etc.): filter **KD ≤ 10**, volume **≥ 1000/month**.
- [ ] Keywords to try: “TikTok script generator,” “Reels hook generator,” “short form video script template,” “TikTok caption generator,” “viral hook generator.”
- [ ] Put in a table: keyword, volume, KD, **CTA idea** (how this tool leads to “Try FastCaption for full scripts”).

### 5.2 Build 5–10 simple tools

- [ ] **Examples:**
  - **Hook generator:** Input topic → output 5 hook ideas (client-side or tiny API). CTA: “Get the full script in one tap — try FastCaption.”
  - **Script outline generator:** Input topic + duration → bullet outline. CTA: “FastCaption turns this into a full script with hooks and captions.”
  - **Caption/hashtag generator:** Input topic → caption + hashtags. CTA: “Want the full script too? Use FastCaption.”
- [ ] Reuse one template (e.g. Next.js page + one form + one result + CTA). Ship in **days**, not months.

### 5.3 CTA on every tool page

- [ ] Below the tool result: “Want a **full script** with hooks, scenes, and B-roll ideas? **Try FastCaption** — one tap, done.” Link to App Store or landing.

**Deliverables:** Notion/sheet with 10 keywords (volume, KD, CTA), 1st free tool live (e.g. hook generator), CTA copy for all tool pages.

---

## Phase 6: Product simplicity (all four)

**Lesson:** Don’t overbuild. Prayer Lock was simple; Algrow shipped buggy MVP; SiteGPT launched core feature and improved from feedback.

### For FastCaption

- [ ] **Core loop:** Open app → enter topic (or pick “Try these”) → Generate → get script. Everything else (Library, presets, remix) supports that.
- [ ] **Avoid:** Adding auth for the sake of it (you need it for trial/sync — keep it). Avoid extra steps that don’t add value or story.
- [ ] **Metric:** “What is the simplest path to first script?” Shorten it until **10%+ download → trial** is in range.

---

## Implementation order (recommended)

| Order | Phase | Why first |
|-------|--------|-----------|
| 1 | **Phase 1: Onboarding** | 10% download→trial is the lever for everything else (organic and paid). |
| 2 | **Phase 6: Measure** | Add events: onboarding_complete, first_generate, trial_started. Track conversion. |
| 3 | **Phase 2: One content format** | Organic proof before paid; 2 posts/day minimum. |
| 4 | **Phase 3: Discord** | Free, high-intent users; builds community and testimonials. |
| 5 | **Phase 4: Email** | Once you have sign-up or lead magnet, 5-email sequence for next “launch.” |
| 6 | **Phase 5: Free tools** | Long-term SEO; do in parallel once you have 1–2 days to ship a simple tool. |

---

## Golden rules (from the videos, applied to FastCaption)

1. **Onboarding is the conversion engine** — Add value + story; aim for 10%+ download → trial.
2. **Optimize for trials, not installs** — In ads and in-product: trial start and Pro conversion matter.
3. **One format, volume** — One UGC+demo format, 2–20 posts/day until something hits 10K+.
4. **Only run paid on winners** — Boost only videos with 10K+ organic views.
5. **Discord = early users** — Provide value, screen-share, then link; build your own server; free Pro for early advocates.
6. **Emails convert** — Warm list 4 weeks, educate then one “launch” email.
7. **Free tools = SEO** — Small tools, KD ≤10, volume ≥1000, CTA to app on every page.
8. **Keep the product simple** — Shortest path to first script; improve from feedback.

---

## Next steps

- **This week:** Implement Phase 1.1–1.2 (one “value” moment in onboarding + “See example script” on Generate) and add 3 analytics events: `onboarding_complete`, `first_generate`, `trial_started`.
- **Next 2 weeks:** Define one content format and post 2/day; join 10 Discords and start listening + one screen-share.
- **Month 1:** First free tool (e.g. hook generator) live with CTA to FastCaption; email capture (if not already) and draft 5-email sequence.

Use this doc alongside **APP_GROWTH_IMPROVEMENTS.md** (broader tactics) and **UI_ROADMAP_DRIBBBLE.md** (in-app polish). The videos say: **distribution and onboarding matter more than extra features** once the core value works.
