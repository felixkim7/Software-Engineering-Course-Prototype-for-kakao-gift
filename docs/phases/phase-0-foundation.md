# Phase 0 — Foundation

**Goal:** Everything later phases depend on: folder structure, design tokens, base
styles, shared components, store, seed data, state machine, mock services, and a demo
hub. At the end, no feature screens exist yet — only placeholder pages that prove the
shared pieces work.

**Read first:** `CLAUDE.md`, `docs/design-system.md` (§0–2 carefully), `docs/data-model.md`.

**Visual reference:** **all** images in `docs/reference-screens/`. If the folder has no
images, stop and ask the user to add screenshots before writing any CSS.

## Files to create

```
docs/visual-spec.md                         FIRST — extracted from the screenshots (design-system.md §1)
prototype/index.html
prototype/buyer/index.html          (placeholder using AppHeader + EmptyState)
prototype/recipient/index.html      (placeholder)
prototype/seller/index.html         (placeholder with desktop layout)
prototype/assets/css/tokens.css
prototype/assets/css/base.css               reset, typography, focus styles, utilities
prototype/assets/css/components.css
prototype/assets/css/layout-mobile.css      .phone frame, header, bottom CTA
prototype/assets/css/layout-desktop.css     seller sidebar/topbar
prototype/assets/js/core/store.js
prototype/assets/js/core/seed-data.js
prototype/assets/js/core/state-machine.js
prototype/assets/js/core/format.js          formatKRW, formatDate, maskPhone, maskName, escapeHtml, dDay
prototype/assets/js/core/strings.js         shared Korean UI strings (status labels etc.)
prototype/assets/js/core/recommend.js       deriveProfileTags(); scoring stub (filled in Phase 1)
prototype/assets/js/services/payment-service.js
prototype/assets/js/services/messaging-service.js
prototype/assets/js/services/delivery-service.js
prototype/assets/js/services/export-service.js   (stub: signatures only, implemented in Phase 5)
prototype/assets/js/ui/components.js
prototype/assets/js/pages/hub.js
README.md                                   how to run
```

## Tasks

0. **Visual spec (do this before anything else)**
   - Open every screenshot in `docs/reference-screens/` and write `docs/visual-spec.md`
     following design-system.md §1: palette, typography, spacing and sizing, component
     inventory, per-screen layout notes, interaction notes, and the pixel ratio used.
   - Fill `tokens.css` from it. Keep the token names from design-system.md §3, and add new tokens where needed.
   - Show the user a short summary (main colors, font sizes, component list) and wait for OK.
1. **Store (`store.js`)**
   - `load()` reads `localStorage["giftProto.v1"]`; if missing or version mismatch → seed.
   - `getState()`, typed getters (`getUser(id)`, `getProduct(id)`, `getGift(id)`,
     `listGiftsBy({ buyerId?, recipientId?, sellerId? })`, `listNotifications(userId)`),
     mutators (`createGift`, `updateGift`, `addNotification`, `creditWallet`, `setDevFlag`).
   - `subscribe(fn)` + fire a custom event so a page can re-render after changes.
   - `resetDemoData()`.
   - Session: `currentUserId` for the mobile role (`u0` buyer by default, `u1` for recipient view).
2. **Seed data** per `docs/data-model.md` §5. Fictional people. Product names, brand-style
   names, categories, prices and discount rates should resemble what's visible in the
   screenshots, so the lists look realistic. Thumbnails are placeholders (emoji or tinted
   boxes) or images cut from the screenshots.
3. **State machine** with `transition(gift, toStatus, note)`, `IllegalTransitionError`,
   `canDecide(gift, userId, now)`, and history append.
4. **Mock services** with latency, idempotency map, and `devFlags` failure injection.
5. **Components**: every component in design-system.md §5, plus any other recurring
   element from the visual-spec inventory, each styled to match its screenshot.
   Export plain functions that return HTML strings or mount into a container.
   Icons (back arrow, search, heart, gift box, share, close, etc.) go in one
   `ui/icons.js` as inline SVG strings drawn to match the screenshot icon style (stroke width, size).
6. **Demo hub (`index.html`, SCR-00)**
   - Title: "카카오톡 선물하기 To-Be 프로토타입 · CSE4115 Team Assignment 1".
   - Three role cards: 구매자 (mobile) → `buyer/`, 수령자 (mobile) → `recipient/`,
     판매자 센터 (desktop) → `seller/`. Each shows the use cases it demonstrates.
   - Demo controls: Reset demo data; toggles `failNextPayment`, `failNextSettlement`,
     `failNextMessage`; toggle "Show NEW badges".
   - A small "Component gallery" section (collapsible) rendering every component once —
     used to verify Phase 0. Can be removed/hidden in Phase 6.
7. **README.md**: how to run with Live Server / `npx serve prototype`, folder overview,
   link to CLAUDE.md and docs.

## Acceptance criteria

- [ ] `docs/visual-spec.md` exists and covers every screenshot in `docs/reference-screens/`.
- [ ] `tokens.css` values come from visual-spec.md; the component gallery, viewed next to the
      screenshots, uses matching colors, font sizes, radii and spacing.
- [ ] `prototype/index.html` opens via Live Server with **no console errors**.
- [ ] Role cards navigate to the three placeholder pages; placeholders use the correct
      layout (phone frame for buyer/recipient, sidebar layout for seller).
- [ ] Component gallery shows all components; modal traps focus and closes with ESC;
      toast is announced (aria-live).
- [ ] `store.resetDemoData()` restores seed data; refreshing the page keeps state.
- [ ] State machine: calling an illegal transition in the console throws `IllegalTransitionError`.
- [ ] Payment mock: with `failNextPayment` on, the next `pay()` fails and the flag resets.
- [ ] Calling `pay()` twice with the same `idempotencyKey` returns the same `txId`.
- [ ] No hard-coded colors outside `tokens.css`.

## Out of scope

Any real feature screen. Recommendation logic beyond `deriveProfileTags`. Excel export implementation.

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md, and docs/phases/phase-0-foundation.md (plus the docs it references).
> We are starting Phase 0. First open every screenshot in docs/reference-screens/ and write docs/visual-spec.md,
> then show me a summary. After I OK it, post your file-by-file plan and implement it step by step.
> After each step, tell me what to open in the browser to check it. Finish by going through
> the acceptance criteria one by one and updating docs/PROGRESS.md.
