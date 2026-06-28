# ICEGLER — Design System v1

> Icelandic premium sunglasses. A blank-canvas brand system built for a Claude Design prototype and the eventual Claude Code production build.
> **Positioning in one line:** *very slightly edgy Scandinavian minimal luxury* — editorial restraint (VIU / ATTIRE), gallery-clean negative space (REIZ) with the architectural coldness softened into something natural and ethereal.

---

## 1. Brand essence

**Icegler** makes premium sunglasses designed in Reykjavík and shaped by Icelandic light — the long blue dusk, glacier clarity, black basalt, and the strange warmth of a cold place.

- **Three adjectives:** Glacial. Considered. Quietly edgy.
- **What we are:** restrained, confident, product-forward, conscious, a little poetic.
- **What we are *not*:** loud, trendy, maximalist, "techwear," cold/clinical, brutalist, or architectural. We are warm where REIZ is hard. Ice as a *living* element, not a monument.
- **Signature device — THE ICEBLOCK:** a pair of Icegler frames encased in or resting on a **literal, clear block of ice** (not a glacier, not a sculpture). Translucent, slightly wet, condensation beading, cold blue-white light passing through, with the organic imperfections of real ice — air bubbles, fracture lines, soft melt at the edges. This is the brand's recurring hero motif. It should feel *found in nature and lit beautifully*, never carved or rendered like CGI stone.

---

## 2. Color

A small, disciplined palette rooted in the Icelandic landscape: glacier white, volcanic basalt, glacial blue, warm driftwood. The **ice-white ↔ basalt-black contrast does the heavy lifting and is the "edge."** Accent is used sparingly. Warmth (Driftwood) is the antidote to REIZ's coldness.

| Token | Hex | Role |
|---|---|---|
| `--glacier` | `#F2F4F4` | Primary page canvas (soft cool off-white) |
| `--snow` | `#FCFDFD` | Elevated surfaces, cards, sticky panels |
| `--basalt` | `#15191B` | Primary text; dark "volcanic" full-bleed sections |
| `--slate` | `#586065` | Secondary text |
| `--ash` | `#8A9296` | Tertiary/muted text, captions |
| `--mist` | `#DBE0E1` | Hairlines, borders, dividers |
| `--meltwater` | `#DCE8EB` | Pale ice tint — soft fills, hover states, calm section backgrounds |
| `--ice` | `#BFD9DE` | Slightly deeper ice tint for large fills / illustrative blocks |
| `--glacial` | `#3E6E79` | **Primary accent** — deep glacial blue. Links, focus, key CTAs, small marks. Use sparingly. |
| `--driftwood` | `#E7E1D6` | Warm bone neutral — editorial/story surfaces only, to add warmth. Use sparingly. |

**Rules**
- Default mode is **light** (glacier canvas, basalt ink). Use **basalt full-bleed** sections for drama (hero alt, story, footer) — light type on dark.
- Accent (`--glacial`) appears on roughly 1 in 8 elements, not everywhere. Restraint reads as luxury.
- Never use pure black (`#000`) for large areas — basalt is warmer and more refined.
- Driftwood only in 1–2 places (e.g. the brand-story band). Don't let it muddy the cool base.
- Maintain WCAG AA: basalt-on-glacier and basalt-on-snow pass comfortably; check glacial-on-glacier for small text (use basalt for body, glacial for emphasis/large only).

---

## 3. Typography

Load all from Google Fonts. The pairing gives editorial-lux warmth (serif) + Nordic clean (grotesque) + a precise modern edge (mono micro-accent).

- **Display / editorial serif — `Fraunces`.** Hero statements, section intros, the brand story, large pull-quotes. Use light-to-regular weights (300–400) at large optical sizes; tight leading (0.95–1.05). Warm, characterful, distinctive — this is what stops the site reading generic and counters coldness.
- **Workhorse grotesque — `Schibsted Grotesk`.** Navigation, body, UI, product names, buttons, labels. Clean and unmistakably Nordic, with just enough character to avoid the Inter/Helvetica default.
- **Mono micro-accent — `IBM Plex Mono`.** *Only* for prices, SKUs, spec tables, and tiny eyebrow labels. This is the "slightly edgy / modern" signal. Keep it to small sizes; never headlines.

**Banned (these read as AI default or off-brand):** Inter, Roboto, Open Sans, Lato, Helvetica/Arial, any system-UI stack, **Space Grotesk** (an overused default), and Playfair Display (bridal cliché).

**Scale (desktop) — use big jumps and weight extremes, not timid steps**

| Style | Font / weight | Size | Notes |
|---|---|---|---|
| Display XL (hero) | Fraunces 300 | `clamp(64px, 9vw, 132px)` | leading 0.95, slight negative tracking |
| Display L | Fraunces 300–400 | 56–72px | section openers |
| H1 | Fraunces 400 | 40px | |
| H2 | Schibsted 600 | 30px | |
| H3 | Schibsted 600 | 22px | |
| Body L | Schibsted 400 | 19px | leading 1.6 — intros |
| Body | Schibsted 400 | 16–17px | leading 1.6 |
| Small | Schibsted 400 | 14px | |
| Eyebrow / label | Schibsted 600 **or** Plex Mono 500 | 12–13px | ALL CAPS, letter-spacing 0.14–0.18em |
| Price / spec / SKU | IBM Plex Mono 500 | 13–15px | |

Mobile: scale display down (hero `clamp(40px, 12vw, 64px)`), keep generous line-height and margins.

---

## 4. Layout, grid & space

- **12-column grid**, wide outer margins (generous — gallery air, à la REIZ but warmer). Max content width ~1320px; let hero and editorial imagery go **full-bleed**.
- **Asymmetry over centered symmetry.** Off-set headlines, uneven columns, image bleeds to one edge with type anchored to the other. Avoid the rigid, perfectly-centered "AI landing page."
- **Whitespace is a feature.** Big vertical rhythm between sections (96–160px desktop). Let single statements sit alone.
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- Radius: small and restrained — `2px` default, `0px` on large image blocks (sharp, premium). No big rounded "friendly" corners.
- Hairlines: 1px `--mist`. Use thin rules as editorial structure, not heavy boxes.

---

## 5. Motion

Subtle, slow, expensive-feeling. CSS-first. One orchestrated "wow" per key page (the iceblock), restraint elsewhere.

- **Eases:** reveals `cubic-bezier(0.22, 1, 0.36, 1)`; hovers `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Durations:** big reveals 450–700ms; hovers/UI 180–280ms.
- **Scroll reveals:** fade + 12–24px rise, staggered. Images scale subtly (1.06 → 1.0) as they enter.
- **Hero signature:** the iceblock holds presence — gentle parallax, a slow drift/float, faint refraction or a slow condensation/frost shimmer. Never gimmicky; think "the light is moving," not "an animation is playing."
- **Product hover:** image swap (front → side/worn), subtle lift (-4px) + shadow bloom, colorway dots reveal.
- **Buttons:** fill "floods in" like meltwater on hover (a wipe from one edge), not a flat color snap.
- Respect `prefers-reduced-motion`: disable parallax/auto-motion, keep simple fades.

---

## 6. Photographic & art direction

The product *is* the design — direct accordingly.

- **Grade:** cool, high-clarity, slightly desaturated — but **keep warmth in skin tones** so it never goes clinical. Glacier-blue shadows, clean whites, soft natural light.
- **Hero / still life:** frames in/on the literal iceblock; on black basalt rock; on bone/driftwood; with meltwater, frost, condensation. Negative space around the object.
- **Model / editorial:** Scandinavian, minimal styling, cool-toned, natural light, slightly aloof and self-possessed expressions (the "edge"). Icy, neutral, or basalt backdrops. Sparse, magazine-like.
- **Backgrounds:** frosted glass, glacier texture, meltwater, basalt — always with restraint and air; never busy.
- **Avoid:** warm beachy "sunglasses ad" clichés, tropical palettes, busy lifestyle clutter, heavy drop shadows, fake CGI ice.

---

## 7. Components (behavioral spec)

- **Top nav:** minimal, transparent over hero → solidifies to `--snow` with hairline on scroll. Left: logo (uploaded mark). Center/right: Shop, Lookbook, Story, Stores. Icons: search, account, cart (with count). Mega/flyout for Shop kept airy.
- **Buttons:** primary = basalt fill, snow text, meltwater-flood hover; secondary = hairline outline, basalt text, fills to basalt on hover; tertiary = text + animated underline. Generous padding, small radius, label in Schibsted 600 (slight tracking).
- **Product card:** large image on `--snow`, hover swap to worn/side shot, name in Schibsted 600, colorway dots, price in Plex Mono. No clutter — name, color, price only.
- **PDP buy panel:** sticky on desktop; colorway + lens selectors, price in mono, primary CTA, accordions for details/specs/shipping, trust line ("Designed in Reykjavík · handcrafted bio-acetate · Zeiss lenses").
- **Spec table:** label/value rows, values in Plex Mono, hairline separators.
- **Filters (PLP):** quiet left rail or top bar — Shape, Color, Material, Lens; pills with mono counts.
- **Cart drawer:** slides from right over a dimmed canvas; line items, qty steppers, subtotal in mono, free-shipping progress, checkout CTA.
- **Forms:** hairline-underline or hairline-box fields, generous height, `--glacial` focus ring, clear labels above. Calm validation.
- **Footer:** basalt full-bleed; newsletter ("Join the Cold Club" placeholder), columns (Shop / Brand / Care / Legal), stores, socials, locale switcher. Light type on basalt.
- **States:** design real empty states (empty cart, no filter results), loading skeletons (shimmer in meltwater), and hover/focus for everything. No dead ends.

---

## 8. Voice, naming & copy

- **Voice:** spare, confident, a touch poetic and Icelandic-inflected. Short sentences. Lets the product and light speak. Never salesy or exclamatory.
- **Product naming system:** `The ___` + a single evocative ice/light word (VIU-style). 
- **Three launch models (placeholders — client may rename):**
  - **The Drift** — soft rounded/oval frame. Quiet, feminine-leaning.
  - **The Solstice** — sharp angular cat-eye / geometric. The edgy hero.
  - **The Basalt** — bold square/rectangular unisex. Dark, architectural-but-warm.
- **Colorway naming (placeholders):** Glacier (clear/blue), Basalt (black), Meltwater (smoke grey-blue), Driftwood (amber tortoise), Snow (clear white), Aurora (subtle gradient).
- **Spec/trust placeholders:** Designed in Reykjavík · Handcrafted bio-acetate · Carl Zeiss polarized lenses · 100% UV400 · CR ~28g · 2-year guarantee · carbon-considered shipping.
- **Price band (placeholders):** The Drift €210 · The Solstice €245 · The Basalt €230.

---

## 9. Accessibility & quality bar

- WCAG AA contrast minimum; visible `--glacial` focus rings; full keyboard nav.
- Real copy everywhere — **no lorem ipsum**.
- Responsive: designed for **mobile and desktop** (and graceful tablet).
- Every interactive element has hover/focus/active; every screen has empty + loading states.
- Semantic structure, alt text on imagery, sensible tab order.

---

*This document is the source of truth for the Icegler look. Upload it into Claude Design alongside the brand assets, and reuse it for the Claude Code production build so design intent survives the handoff.*
