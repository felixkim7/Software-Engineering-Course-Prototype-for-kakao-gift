# CLAUDE.md — KakaoTalk Gift (선물하기) Rebuild Prototype

This file is read automatically by Claude Code at the start of every session.
Read it fully, then read `docs/PROGRESS.md` to see where development stands.

## 1. What this project is

A **clickable, front-end-only screen prototype** for a university Software Engineering
team assignment (Sogang Univ. CSE4115, Team Assignment 1: "재구축 서비스 정의").
The team is redefining the **KakaoTalk "Gift" (선물하기)** service as a To-Be system.
The prototype must show the **main screens that follow the scenario flows of our key
use cases**, plus screens for the other key improvement requirements.

It will be **demoed live during a class presentation**, so it must be stable,
visually clean, and walk through each use case end-to-end without a backend.

**Visual goal: it must look and feel like the real KakaoTalk Gift app.** Screenshots of
the real service are in `docs/reference-screens/`. They are the source of truth for
layout, colors, typography, spacing and components. Measured values extracted from them
live in `docs/visual-spec.md` (written in Phase 0). New To-Be screens must use the same
visual language so they look native. Full rules: `docs/design-system.md` §0–2.

The three To-Be improvements the prototype must showcase (one per primary actor):

| Actor | Improvement | Quality characteristic |
|---|---|---|
| Buyer (구매자) | Segmented recommendation by relationship / situation / age / gender | Usability (appropriateness recognizability, operability) |
| Recipient (수령자) | Decline a gift **or** convert it to cash, chosen directly by the recipient | Functional suitability, Usability, Reliability |
| Seller (판매자/입점처) | One integrated **order + delivery** Excel file keyed by order number; bulk tracking upload | Usability (operability), Efficiency |

Full requirements, actors, use cases and traceability: `docs/requirements.md`.

## 2. Hard constraints

- **Vanilla HTML + CSS + JavaScript only.** No React/Vue/Svelte, no TypeScript, no bundler,
  no npm build step. External resources from a CDN are allowed when they clearly help
  (e.g. **SheetJS** for real `.xlsx` export/import with a CSV fallback, the Pretendard web font).
- **No backend.** All data lives in mock seed data + `localStorage`. External systems
  (payment system, delivery system, KakaoTalk messaging) are **simulated JS services**.
- **ES modules** (`<script type="module">`). The app must be served over HTTP
  (VS Code "Live Server" extension, or `npx serve prototype`). Never rely on `file://`.
- **Copy the image files.** Reproduce the look of the screenshots with images cropped from
  them (the Kakao logo, Kakao Friends characters, product photos, banners) — see
  `tools/crop-screens.py`. Fall back to same-size tinted boxes with an emoji only when no
  crop exists. Seed product names, brands and prices should read like the ones in the screenshots.
- **Language:** all code, identifiers, comments, commit messages and docs are in English.
  **UI copy shown to users is in Korean** (the audience is a Korean class). Keep all UI
  strings for a page near the top of that page's JS or in `assets/js/core/strings.js`
  so they are easy to find and change.

## 3. How we work (incremental, phase by phase)

Development is split into phases. **Only work on the current phase.** Do not start
features from later phases, even if they seem easy.

| Phase | Scope | Spec |
|---|---|---|
| 0 | Visual spec from screenshots, project scaffold, design system, shared core (store, mock services, components), demo hub | `docs/phases/phase-0-foundation.md` |
| 1 | Buyer: recipient selection + segmented recommendation + product detail | `docs/phases/phase-1-buyer-discovery.md` |
| 2 | Buyer: checkout, mock payment, send complete, purchase history | `docs/phases/phase-2-buyer-checkout.md` |
| 3 | Recipient: gift inbox, gift view, delivery receipt (option + address) | `docs/phases/phase-3-recipient-receive.md` |
| 4 | Recipient: **decline gift / convert to cash** (core To-Be use case) | `docs/phases/phase-4-recipient-decline-convert.md` |
| 5 | Seller center: integrated order+delivery table, Excel export, tracking upload | `docs/phases/phase-5-seller-center.md` |
| 6 | Cross-role integration, polish, accessibility, demo script | `docs/phases/phase-6-integration-polish.md` |

Workflow for every phase:
1. Read `docs/PROGRESS.md`, the phase spec, and any docs it references.
2. **Open the reference screenshots listed in the phase's "Visual reference" section**
   (and `docs/visual-spec.md`). For each screen, list its elements top to bottom before coding.
3. Before writing code, post a short plan: files to create/modify and the order.
   Wait for the user's OK if the plan deviates from the spec.
4. Implement in small steps. After each meaningful step, tell the user which page to
   open in the browser to check it.
5. Compare each built screen with its screenshot (design-system.md §2) and fix differences.
6. Verify every item in the phase's **Acceptance criteria** checklist.
7. Update `docs/PROGRESS.md` (tick items, add notes/decisions, list known issues).
8. Suggest a git commit message: `phase-N: <summary>`.

If a spec's layout description conflicts with a screenshot, **the screenshot wins for
visuals and the spec wins for functionality** (the use case flow, data and rules).

Slash commands in `.claude/commands/`: `/start-phase N`, `/review-phase N`, `/fix <issue>`.

## 4. Project structure (target)

```
prototype/
  index.html                  # Demo hub: pick a role, reset demo data, dev toggles
  buyer/                      # Mobile screens (phone frame)
  recipient/                  # Mobile screens (phone frame)
  seller/                     # Desktop screens (seller center)
  assets/
    css/  tokens.css base.css components.css layout-mobile.css layout-desktop.css
    js/
      core/     store.js seed-data.js strings.js format.js state-machine.js
      services/ payment-service.js messaging-service.js delivery-service.js export-service.js
      ui/       components.js (header, toast, modal, stepper, bottom-sheet, badge)
      pages/    one JS module per HTML page (e.g. buyer-home.js)
docs/                         # Requirements, design system, data model, phases, progress
  reference-screens/          # Screenshots of the real app (visual source of truth)
  visual-spec.md              # Values extracted from the screenshots (Phase 0)
```

Each HTML page loads exactly one page module from `assets/js/pages/`, which imports
from `core/`, `services/` and `ui/`. Pages do not import other pages.

## 5. Coding conventions

- Small, readable functions. Prefer clarity over cleverness — teammates who are not
  front-end developers must be able to read the code.
- Render with template literals + `element.innerHTML` for lists, but **always escape
  user-entered text** with `escapeHtml()` from `core/format.js` (gift messages,
  addresses, names).
- Use event delegation for lists. No inline `onclick` attributes.
- All state mutations go through `core/store.js` functions (never write `localStorage`
  directly from a page). Gift status changes go through `core/state-machine.js`.
- CSS: use design tokens (CSS custom properties from `tokens.css`, whose values come
  from `docs/visual-spec.md`). No hard-coded colors or spacing values in component CSS.
  If a screenshot needs a value that has no token yet, add the token first.
  BEM-ish class names: `.gift-card__title`.
- Money: integers in KRW; format with `formatKRW()` → `12,000원`.
- Dates: ISO strings in data; format with `formatDate()` for display.
- Accessibility: semantic elements, `<button>` for actions, labels on every input,
  visible focus states, color contrast ≥ 4.5:1, `aria-live` region for toasts.
- No `alert()` / `confirm()` / `prompt()` — use the modal and toast components.
- Keep files under ~300 lines; split when they grow.

## 6. Domain rules you must respect

These come straight from the use case descriptions. Details: `docs/data-model.md`.

- A gift's lifecycle is a **state machine** (`SENT → OPENED → ADDRESS_SUBMITTED → SHIPPED
  → DELIVERED`, or `→ CONVERTED` / `→ DECLINED_REFUNDED`). Illegal transitions throw.
- Decline / convert is only allowed if: the current user is the gift's recipient, the
  gift is not yet used/address-submitted, it is within the decision deadline, and the
  product is flagged `convertible`.
- **Reliability:** if the (mock) payment system fails during convert/refund, the gift
  status must **not** change to completed, and the user returns to the choice screen
  (alt flow 8a). Repeated clicks must never cause a double refund/conversion
  (use an in-flight lock + idempotency key).
- Convert-to-cash → buyer is **not** notified. Decline → buyer **is** notified and refunded.
- Recipient personal data (birthday, exact age) is used only to derive recommendation
  tags; the buyer UI shows only derived tags such as "20대" — never raw personal data.
- Seller never ships CONVERTED / DECLINED orders; they appear as "발송 불필요".

## 7. Running & checking

- Open `prototype/index.html` with Live Server (right-click → "Open with Live Server").
- Mobile screens: check at 390×844 (browser devtools device mode) and on desktop
  (phone frame centered). Seller center: check at 1280px and 1024px widths.
- Use the demo hub's **"Reset demo data"** button to return to the seed state.
- Before declaring a phase done: no console errors, all acceptance criteria met,
  PROGRESS.md updated.

## 8. When unsure

- If a spec is ambiguous, pick the option that best serves the **live demo** and the
  **use case scenario**, write the assumption in `docs/PROGRESS.md` under "Decisions",
  and tell the user.
- Do not invent new features outside the phase spec. Suggest them under
  "Ideas / backlog" in PROGRESS.md instead.
