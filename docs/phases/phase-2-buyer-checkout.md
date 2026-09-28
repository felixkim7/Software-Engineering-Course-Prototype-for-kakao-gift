# Phase 2 — Buyer: Checkout, payment, send, history

**Use cases:** UC-B2 steps 5–10, alt 8a (payment failure), reliability requirement
(message retry); UC-B3 / alt 3c (purchase history).
**Screens:** SCR-B04, SCR-B05, SCR-B06.

**Read first:** `CLAUDE.md`, `docs/requirements.md` §5 UC-B2, `docs/data-model.md` §3–4.

## Visual reference

Open before coding: `docs/reference-screens/` → B04__*, B05__*, B06__*, B03__* (bottom buttons), XX__*, and `docs/visual-spec.md`.
Checkout, message-card selection, payment method and completion should match the real flow's screens. The Stepper is a To-Be addition: keep it subtle and in the app's style.
Screenshot = source of truth for visuals; this spec = source of truth for functionality and flow.

## Screens

### SCR-B04 — Checkout (`buyer/checkout.html?id=p101&to=u1`)
- Stepper at step 3 (메시지·결제).
- Summary card (UC-B2 step 5): recipient (avatar + name), product, amount.
- **Message card**: 4–6 card themes (생일, 감사, 축하, 응원, 기본) shown as selectable
  tiles with emoji/colour; textarea (max 200 chars, live counter); theme pre-selected
  from the situation chip the buyer used in Phase 1 (pass via `?situation=`).
- **Payment method** (step 6): radio list — 신용/체크카드, 간편결제(페이), 계좌이체. Fake, no card inputs.
- Order summary + agreement checkbox ("주문 내용을 확인했으며 결제에 동의합니다").
- Bottom CTA: "{amount} 결제하고 선물 보내기" (disabled until agreement checked).
- On click:
  1. LoadingOverlay "결제 처리 중…", button locked (no double submit).
  2. `paymentService.pay({ amount, method, idempotencyKey })` (step 7–8).
  3. **Success** → `store.createGift(...)` status `SENT`, `decisionDeadline = now + 30 days`,
     then `messagingService.sendGiftMessage` (step 9) → go to SCR-B05.
  4. **Payment failure (alt 8a)** → toast/error panel "결제가 승인되지 않았어요. 다른 결제수단을
     선택하거나 다시 시도해 주세요." No gift is created. Stays on page.
  5. **Message send failure (reliability)** → gift is still saved with a `messageFailed: true`
     flag; go to SCR-B05 which shows a warning + "다시 보내기" button.

### SCR-B05 — Sent (`buyer/complete.html?gift=g…`)
- Stepper at step 4 (완료).
- Success illustration (emoji/CSS), "지우님에게 선물을 보냈어요!".
- Preview of the gift message card as the recipient will see it.
- Order number, amount, payment method.
- If `messageFailed`: warning box + "다시 보내기" (calls messaging again; clears flag on success).
- Buttons: "보낸 선물 내역 보기" → history; "홈으로".
- Demo helper link (small, grey): "수령자 화면으로 보기 →" → `../recipient/gift.html?gift=…&as=u1`
  (used in the live demo to jump to the recipient's view).

### SCR-B06 — Purchase history (`buyer/history.html`)
- List of gifts where `buyerId === currentUser`, newest first; each row: product, recipient,
  date, amount, **buyer-facing status badge** (see data-model.md §3 — CONVERTED shows as
  "전달 완료" to the buyer).
- Filter tabs: 전체 · 진행 중 · 완료 · 거절/환불.
- Notification area at top for unread notifications (e.g. "지우님이 선물을 거절하여
  9,000원이 환불되었어요.") — mark as read on view.
- Tap a row → bottom sheet with details + status history timeline.
- Enable the "선물 보낸 내역" link on SCR-B01.

## Acceptance criteria

- [ ] Full flow works: SCR-B01 → B02 → B03 → B04 → B05; new gift appears in history and in the store.
- [ ] Double-clicking the pay button creates only one gift.
- [ ] With `failNextPayment` on: error shown, **no gift created**, retry succeeds.
- [ ] With `failNextMessage` on: gift created, warning shown on B05, "다시 보내기" clears it.
- [ ] Message textarea is escaped when rendered (try `<b>hi</b>` — shows literally).
- [ ] History filters work; a CONVERTED gift appears as "전달 완료" to the buyer; a DECLINED one shows "거절됨 · 환불 완료".
- [ ] Stepper reflects the correct step on every buyer screen.
- [ ] No console errors; 390px and desktop frame OK.

## Out of scope

Buyer-initiated cancel/refund (goal 6) — optional stretch: a "취소" button for SENT gifts in the history sheet.

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md and docs/phases/phase-2-buyer-checkout.md.
> Phases 0–1 are complete. Implement Phase 2 (SCR-B04, B05, B06). Plan first.
> Pay special attention to the reliability rules: no gift on payment failure, no double submit,
> retry for message failure. Verify acceptance criteria with the dev failure toggles and update docs/PROGRESS.md.
