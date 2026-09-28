# Phase 3 — Recipient: Gift inbox, gift view, delivery receipt

**Use cases:** UC-R1 (check gift), UC-R2 (receive delivery item), UC-R3 steps 1–2 (entry point only).
**Screens:** SCR-R01, SCR-R02, SCR-R03.

**Read first:** `CLAUDE.md`, `docs/requirements.md` §4–5, `docs/data-model.md` §3.

The recipient pages act as user `u1` by default. Support `?as=u2` to view as another
recipient (sets `currentUserId` for recipient pages only). Security rule: if the current
user is not the gift's recipient, show "본인에게 온 선물만 확인할 수 있어요." instead of the gift.

## Visual reference

Open before coding: `docs/reference-screens/` → R00__*, R01__*, R02__*, R03__*, XX__*, and `docs/visual-spec.md`.
Replicate the real received-gift box, voucher detail (barcode block), delivery gift detail and address input. If `R00__chat-gift-bubble` exists, also build `recipient/chat.html`, a fake chat room with the gift bubble, as the recipient's entry point. The "이 선물, 마음에 들지 않나요?" entry (NEW) should look like the app's existing secondary text buttons.
Screenshot = source of truth for visuals; this spec = source of truth for functionality and flow.

## Screens

### SCR-R01 — Gift inbox (`recipient/index.html`)
- Header "받은 선물함". Tabs: 사용 가능 · 배송 · 완료.
- Card per gift: product thumbnail, product name, "From. {buyer name}", received date,
  status badge, and **decision deadline** chip "D-12" (warning colour when ≤ 3 days)
  for SENT/OPENED gifts.
- A KakaoTalk-style "gift message bubble" preview for SENT (new) gifts with a "NEW" dot.

### SCR-R02 — Gift view (`recipient/gift.html?gift=g…`)
- First open of a SENT gift → transition to OPENED.
- Message card rendered with the buyer's chosen theme + message (escaped).
- Product info, type, (vouchers) fake barcode block + validity; (delivery) "배송지를 입력하면 판매자가 발송해요".
- **Primary CTA** depends on type/status:
  - delivery + SENT/OPENED → "배송지 입력하고 받기" → SCR-R03
  - voucher + OPENED → "사용하기" (show barcode full screen; optional mark USED)
  - ADDRESS_SUBMITTED/SHIPPED/DELIVERED → delivery status timeline (read-only)
- **Secondary entry to UC-R3** (NEW pill): text button "이 선물, 마음에 들지 않나요?" →
  `decline.html?gift=…`. Only visible if `canDecide()` is ok; if not, show the reason
  in muted text (e.g. "금액전환이 불가한 상품이에요", "처리 기한이 지났어요").
  *(The decline page itself is built in Phase 4 — link to a placeholder for now.)*

### SCR-R03 — Option & address (`recipient/receive.html?gift=g…`)
- Stepper-like 2 steps: 옵션 선택 → 배송지 입력.
- Options as radio cards (if the product has options).
- **Simplified address input** (To-Be need: "배송지 입력 간소화"):
  - "최근 배송지 불러오기" button that fills from a saved fake address.
  - Fields: 받는 분, 연락처, 우편번호 + 주소 (fake "주소 검색" that opens a bottom sheet with
    3 sample addresses), 상세주소, 배송 메모 (select + custom).
  - Inline validation (required fields, phone pattern `010-\d{4}-\d{4}`).
- Confirm modal summarising option + address → save to `gift.delivery`,
  transition to ADDRESS_SUBMITTED, history note "배송지 입력 완료".
- Result: toast + return to SCR-R02 showing the delivery timeline (배송 준비 중).

## Acceptance criteria

- [ ] Inbox shows seed gifts in the correct tabs with correct badges and D-day chips.
- [ ] A gift sent in Phase 2's buyer flow appears in the recipient inbox (same store).
- [ ] Opening a SENT gift changes it to OPENED (visible in the buyer's history as "수령자 확인").
- [ ] Address form validates; "최근 배송지 불러오기" fills all fields; submit transitions to ADDRESS_SUBMITTED.
- [ ] After address submission, "이 선물, 마음에 들지 않나요?" is no longer offered.
- [ ] Viewing a gift with `?as=` set to a non-recipient shows the access message.
- [ ] No console errors; 390px and desktop frame OK.

## Out of scope

Decline / convert logic (Phase 4). Reviews, CS, validity extension.

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md and docs/phases/phase-3-recipient-receive.md.
> Phases 0–2 are complete. Implement Phase 3 (SCR-R01, R02, R03). Plan first.
> Use state-machine.js for every status change. Verify the acceptance criteria — including the
> cross-role check that a gift sent from the buyer flow shows up in the recipient inbox — and update docs/PROGRESS.md.
