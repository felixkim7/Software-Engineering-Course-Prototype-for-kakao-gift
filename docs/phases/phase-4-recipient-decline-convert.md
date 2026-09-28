# Phase 4 — Recipient: Decline gift / convert to cash ★ core To-Be use case

**Use case:** UC-R3 (선물 거절 및 금액 전환) — main flow (convert), alt 4a (decline), alt 8a (failure).
**Screens:** SCR-R04, SCR-R05.
**Quality:** Functional suitability, Usability (clear difference, minimal clicks, error
protection), Reliability (no completion on error, no double processing), Security
(only the recipient).

This is the most important screen set of the presentation. Prioritise clarity and polish.

**Read first:** `CLAUDE.md` §6, `docs/requirements.md` §5 UC-R3 (read the flows carefully),
`docs/data-model.md` §3–4.

## Visual reference

Open before coding: `docs/reference-screens/` → R02__*, R04__* (if any), XX__* (popups, bottom sheets, toasts), and `docs/visual-spec.md`.
These screens don't exist in the real app. Build them only from components already matched to the screenshots (cards, buttons, bottom sheet, popup dialog, typography), so they look like an official new Kakao feature. Don't introduce new visual styles; the money/decline accent colors must fit the extracted palette.
Screenshot = source of truth for visuals; this spec = source of truth for functionality and flow.

## Screens

### SCR-R04 — Choose how to handle the gift (`recipient/decline.html?gift=g…`)

Guard on load: `canDecide(gift, currentUser, now)`; if not ok → show reason + back button.

**Step A — Options (UC-R3 step 3)**
- Title: "이 선물을 어떻게 할까요?" Subtitle with product name and "From. {buyer}".
- `OptionCompare` component — two large side-by-side (stacked on narrow screens) cards:

| | 💰 금액으로 받기 | 🙅 선물 거절하기 |
|---|---|---|
| What happens | 선물 금액 {amount}원이 내 페이머니로 들어와요 | 결제 금액이 {buyer}님에게 환불돼요 |
| Buyer is told? | 보낸 분에게 **알리지 않아요** | 보낸 분에게 **거절 사실이 전달돼요** |
| The gift | 기존 선물은 사용할 수 없게 돼요 | 기존 선물은 사용할 수 없게 돼요 |
| Undo | 되돌릴 수 없어요 | 되돌릴 수 없어요 |

  - Each card is a single `<button>` (role radio in a radiogroup) — selecting highlights it.
  - Money card accent `--color-money`, decline card accent `--color-danger` (outline style).
  - Footnote: "처리 기한: {deadline} 까지 (D-{n})". Link: "그냥 받을래요" → back to gift.
- Bottom CTA: "다음" (disabled until one is chosen). Minimal clicks: choose → 다음 → 확인 = 3 taps.

**Step B — Confirm (steps 5–6 / 4a confirm)**
- Convert: big amount "9,000원", destination "페이머니 (잔액 {balance} → {balance+amount})",
  bullet list of consequences, CTA "금액으로 받기 확정".
- Decline: "{buyer}님에게 9,000원이 환불되고, 거절 알림이 전달돼요." optional short note
  to the buyer is **not** included (keep scope small); CTA "선물 거절 확정" (danger style).
- "이전" returns to step A with the selection kept.

**Step C — Processing (steps 7–8)**
- LoadingOverlay: "금액 전환 처리 중…" / "환불 요청 중…". All buttons locked.
- Call `paymentService.convertToCash(...)` or `paymentService.refund(...)` with
  `idempotencyKey = "decide-" + gift.id` (so repeat calls never double-process).
- In-flight lock stored on the gift (`processing: true`) and cleared in `finally`.

**On success (step 9)**
- Convert: transition → CONVERTED; `creditWallet(u1, amount)`; settlement record; history
  note; **no** buyer notification.
- Decline: transition → DECLINED_REFUNDED; settlement record; `addNotification(buyer, "지우님이
  선물을 거절하여 {amount}원이 환불되었어요.")`.
- Navigate to SCR-R05.

**On failure (alt 8a)**
- Status must remain SENT/OPENED (assert in code). Show error panel:
  "처리 중 문제가 발생했어요. 선물은 그대로 남아 있어요. 다시 선택해 주세요."
- Return to **Step A** (both options shown again, previous choice pre-selected).
- Retrying with the same idempotency key after a *failed* attempt must be allowed
  (only successful keys are cached).

### SCR-R05 — Result (`recipient/result.html?gift=g…`)
- Convert: "💰 9,000원을 받았어요" + wallet balance + "기존 선물은 사용이 종료되었어요".
- Decline: "선물을 거절했어요" + "{buyer}님에게 9,000원 환불이 완료되었어요".
- Transaction ID and time (small). Buttons: "받은 선물함으로".
- Reloading this page or pressing back and trying again must not re-process — the decline
  page guard shows "이미 처리된 선물이에요".

## Other updates in this phase
- Inbox (SCR-R01) and gift view (SCR-R02) show CONVERTED/DECLINED gifts under 완료 with the right badge.
- Buyer history (SCR-B06): decline notification appears; CONVERTED still shows "전달 완료".
- Replace the Phase 3 placeholder link with the real page.

## Acceptance criteria

- [ ] Convert path end-to-end: gift → CONVERTED, wallet credited once, **buyer not notified**, gift unusable.
- [ ] Decline path end-to-end: gift → DECLINED_REFUNDED, buyer notified + sees "거절됨 · 환불 완료".
- [ ] With `failNextSettlement` on: error shown, status unchanged, returned to option step; retry succeeds.
- [ ] Rapid double/triple click on confirm → exactly one settlement, one wallet credit, one notification.
- [ ] Non-convertible product, expired deadline, already-addressed gift, and wrong user (`?as=u2`) are all blocked with a clear message.
- [ ] The two options are understandable without explanation (ask a teammate to read it cold).
- [ ] Keyboard-only: options selectable with arrow keys/Tab + Enter; focus moves sensibly between steps.
- [ ] No console errors; 390px and desktop frame OK.

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md and docs/phases/phase-4-recipient-decline-convert.md, and re-read
> UC-R3 in docs/requirements.md. Phases 0–3 are complete. Implement Phase 4 (SCR-R04, SCR-R05).
> This is the core use case of our presentation — the flow must match the use case description step by step,
> and reliability rules (no completion on failure, no double processing) are mandatory.
> Plan first, then implement. Add `// UC-R3 step N` comments at the matching code points.
> Test every acceptance criterion using the dev toggles and update docs/PROGRESS.md.
