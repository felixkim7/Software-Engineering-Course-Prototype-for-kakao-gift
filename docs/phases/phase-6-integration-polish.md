# Phase 6 — Integration, polish & demo readiness

**Goal:** A stable prototype that can be demoed live in ~5 minutes and screenshotted for
the "주요 화면 프로토타입" slides.

**Read first:** `CLAUDE.md`, `docs/PROGRESS.md` (known issues from earlier phases), `docs/requirements.md` §6.

## Visual reference

Open before coding: every image in `docs/reference-screens/`, and `docs/visual-spec.md`.
Do a final fidelity pass: for every screen with a screenshot, compare side by side and fix remaining differences in spacing, font size/weight, colors, icons and copy. List any intentional deviations in PROGRESS.md.
Screenshot = source of truth for visuals; this spec = source of truth for functionality and flow.

## Tasks

1. **Bug sweep:** fix everything listed under "Known issues" in PROGRESS.md.
2. **Cross-role walk-through** (must work in one browser without resetting):
   1. Buyer picks 지우 (birthday soon) → segmented recommendation → delivery product → pays → sent.
   2. Switch to recipient → inbox shows the new gift → open → enter address.
   3. Switch to seller → order in 발송 대기 → Excel download → register tracking.
   4. Recipient sees 배송 중.
   5. Buyer sends a second gift (voucher) → recipient declines it → buyer sees refund notice.
   6. Buyer sends a third gift → recipient converts it to cash → buyer still sees 전달 완료; seller sees 발송 불필요.
3. **Role switcher:** a small floating "역할 전환" button (bottom-left, hidden with `?present=1`)
   on every page linking to the hub and the three roles.
4. **Presentation mode:** `?present=1` hides dev controls and helper links; NEW pills remain
   (toggleable from the hub).
5. **Consistency pass:** spacing, typography, button styles, empty states, loading states,
   copy tone (해요체), status labels identical everywhere (single source: `strings.js`).
6. **Accessibility pass:** keyboard navigation on every screen, focus visible, labels,
   contrast check, `prefers-reduced-motion` respected.
7. **Responsiveness:** mobile screens at 360 / 390 / 430px; seller at 1024 / 1280 / 1440px.
8. **Performance sanity:** recommendation filtering and seller table filtering feel instant (< 1 s).
9. **Traceability:** every page JS starts with a header comment listing its screen ID(s) and use case(s).
10. **Docs:**
    - `docs/demo-script.md`: the walk-through above as numbered steps with what to say
      (1–2 lines each, Korean) and which requirement / quality characteristic each step shows.
    - `docs/screenshots.md`: list of screens to capture for the slides (screen ID, URL with
      params, state to set up first).
    - Update README.md.
11. Remove or hide the Phase 0 component gallery behind a `?dev=1` flag.

## Optional stretch (only if time allows, ask the user first)
- Buyer cancel for SENT gifts (Buyer goal 6).
- Read-only CS inbox mock for the seller (UC-S3).
- Simple onboarding tooltip tour for the three NEW features.

## Acceptance criteria

- [ ] The full cross-role walk-through (task 2) runs twice in a row after one "Reset demo data" without errors.
- [ ] `?present=1` shows a clean UI with no dev controls.
- [ ] Zero console errors or warnings on every page.
- [ ] Lighthouse accessibility score ≥ 90 on buyer home, recipient decline page, seller center.
- [ ] demo-script.md and screenshots.md exist and match the actual UI.
- [ ] PROGRESS.md: all phases ticked, known issues empty or explicitly accepted.

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md and docs/phases/phase-6-integration-polish.md.
> Phases 0–5 are complete. Start with the bug sweep and the cross-role walk-through, reporting anything broken
> before fixing it. Then do the remaining tasks in order. Write docs/demo-script.md and docs/screenshots.md
> and update docs/PROGRESS.md.
