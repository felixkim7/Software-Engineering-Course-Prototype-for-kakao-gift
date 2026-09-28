# Data Model & Mock Services

All data is mock. Seed data lives in `assets/js/core/seed-data.js`; runtime state is
persisted in `localStorage` under a single key `giftProto.v1` by `core/store.js`.

## 1. Entities

```js
// User — every person in the demo (buyers and recipients are both users)
{
  id: "u1",
  name: "김지우",            // display name (fictional)
  avatar: "🦊",               // emoji or initials, no real images
  gender: "F" | "M",
  birthDate: "2003-05-14",   // PRIVATE — only used to derive ageGroup & birthday tag
  relation: "friend" | "family" | "coworker" | "partner",   // relation to the current buyer
  interests: ["coffee", "beauty"]   // optional tags for recommendation
}

// Product
{
  id: "p101",
  name: "아이스 아메리카노 2잔",
  brand: "Cafe Lumen",        // brand-style name; make seed names read like those in the screenshots
  category: "cafe" | "dessert" | "beauty" | "flower" | "fashion" | "digital" | "health" | "food" | "living",
  type: "voucher" | "delivery",   // e-coupon vs physically shipped
  price: 9000,
  options: [ { id: "o1", label: "250ml" }, ... ] | [],  // delivery items may require an option
  thumbnail: "☕",            // emoji or tinted placeholder box or if possible an image cut from a screenshot
  tags: {
    gender: ["F","M"],                        // who it is popular with
    ageGroups: ["10s","20s","30s","40s","50s+"],
    relations: ["friend","partner"],
    situations: ["birthday","thanks","congrats","cheer","casual","getwell"]
  },
  popularity: 87,             // 0–100, used for sorting "popular"
  convertible: true,          // To-Be: can be declined / converted to cash
  sellerId: "s1"
}

// Gift (= order). One gift per recipient per checkout.
{
  id: "g1001",
  orderNo: "20260928-000123",       // PRIMARY KEY for the seller view & Excel
  buyerId: "u0",
  recipientId: "u1",
  productId: "p101",
  optionId: null,                   // chosen by recipient for delivery items
  quantity: 1,
  amount: 9000,
  message: "생일 축하해! 🎉",
  cardTheme: "birthday",
  paymentMethod: "card" | "pay" | "bank",
  status: "SENT",                   // see state machine below
  createdAt: "2026-09-28T10:12:00+09:00",
  decisionDeadline: "2026-10-28T23:59:59+09:00",  // convert/decline allowed until
  delivery: {                        // only for type === "delivery"
    receiverName: "", phone: "", zip: "", address1: "", address2: "", memo: "",
    courier: "", trackingNo: "", shippedAt: null, deliveredAt: null
  },
  history: [ { at: "...", status: "SENT", note: "결제 완료, 선물 전송" } ],
  settlement: null | { type: "CONVERT" | "REFUND", amount: 9000, txId: "tx_…", at: "..." }
}

// Notification (in-app, shown to a user)
{ id: "n1", userId: "u0", giftId: "g1001", type: "DECLINED_REFUNDED", text: "...", read: false, at: "..." }

// Wallet (recipient money after conversion — generic "페이머니", not a real brand)
{ userId: "u1", balance: 9000, ledger: [ { at, amount, giftId, reason: "CONVERT" } ] }

// Seller
{ id: "s1", name: "Cafe Lumen 공식스토어" }
```

## 2. Derived recommendation tags (privacy rule)

`deriveProfileTags(user)` → `{ ageGroup: "20s", gender: "F", relation: "friend", upcomingBirthday: true }`.
The **buyer UI shows only these derived tags** (e.g. chips "20대 · 여성 · 친구 · 🎂 생일 D-3").
`birthDate` is never rendered on any buyer screen.

## 3. Gift state machine (`core/state-machine.js`)

```
                ┌──────────────► CONVERTED            (recipient chose money)
                │
SENT ──► OPENED ┼──────────────► DECLINED_REFUNDED    (recipient declined; buyer refunded + notified)
  │             │
  │             └──► ADDRESS_SUBMITTED ──► SHIPPED ──► DELIVERED     (delivery items)
  │             └──► USED                                              (vouchers; optional)
  └──(convert/decline are also allowed directly from SENT)
```

Allowed transitions (anything else throws `IllegalTransitionError`):

| From | To |
|---|---|
| SENT | OPENED, CONVERTED, DECLINED_REFUNDED |
| OPENED | ADDRESS_SUBMITTED, USED, CONVERTED, DECLINED_REFUNDED |
| ADDRESS_SUBMITTED | SHIPPED |
| SHIPPED | DELIVERED |
| CONVERTED, DECLINED_REFUNDED, DELIVERED, USED | — (terminal) |

`canDecide(gift, currentUserId, now)` returns `{ ok: boolean, reason?: string }` and checks:
recipient identity, status ∈ {SENT, OPENED}, `now <= decisionDeadline`, `product.convertible`.

Status labels (Korean UI):

| Status | Recipient label | Buyer label | Seller label |
|---|---|---|---|
| SENT | 새 선물 | 전달 완료 | 배송지 입력 대기 |
| OPENED | 확인함 | 수령자 확인 | 배송지 입력 대기 |
| ADDRESS_SUBMITTED | 배송 준비 중 | 배송 준비 중 | **발송 대기** |
| SHIPPED | 배송 중 | 배송 중 | 발송 완료 |
| DELIVERED | 배송 완료 | 배송 완료 | 배송 완료 |
| USED | 사용 완료 | 사용 완료 | — |
| CONVERTED | 금액으로 받음 | 전달 완료 *(buyer is not told)* | **발송 불필요 (금액 전환)** |
| DECLINED_REFUNDED | 거절함 | 거절됨 · 환불 완료 | **발송 불필요 (거절·환불)** |

## 4. Mock external services (`assets/js/services/`)

All services are async, return Promises, and simulate latency (600–1200 ms).

```js
// payment-service.js
pay({ amount, method, idempotencyKey })            → { ok, txId } | { ok:false, code, message }
refund({ giftId, amount, idempotencyKey })          → { ok, txId } | { ok:false, ... }
convertToCash({ giftId, userId, amount, idempotencyKey }) → { ok, txId } | { ok:false, ... }

// messaging-service.js  (simulates the KakaoTalk gift message / notifications)
sendGiftMessage({ giftId })  → { ok } ; can fail → gift stays stored, buyer can "재전송"
notify({ userId, giftId, type, text })

// delivery-service.js  (simulates courier sync)
registerTracking({ giftId, courier, trackingNo }) → validates format, returns { ok }
advanceDelivery({ giftId }) → SHIPPED → DELIVERED (demo button)

// export-service.js
exportOrdersXlsx(rows, filename)   // SheetJS if available, else CSV (UTF-8 BOM) fallback
parseTrackingFile(file)            // .xlsx or .csv → [{ orderNo, courier, trackingNo }]
```

**Idempotency:** services keep a `Map` of processed `idempotencyKey`s (persisted in the
store). A repeated key returns the original result without processing again.

**Failure injection (for demoing alternate flows):** the demo hub has toggles stored in
`store.devFlags`:
- `failNextPayment` — next `pay` returns `{ ok:false, code:"PAYMENT_DECLINED" }`
- `failNextSettlement` — next `refund` / `convertToCash` fails (demonstrates UC-R3 alt 8a)
- `failNextMessage` — next `sendGiftMessage` fails (demonstrates retry)
Each flag auto-resets after it triggers once.

## 5. Seed data requirements

- Current buyer: `u0` ("나" / 김민준 — fictional).
- 6 friends with varied gender / age group / relation; at least one with a birthday in the next 7 days.
- ~30 products across all categories, mix of `voucher` and `delivery`, most `convertible: true`,
  at least 2 with `convertible: false` (to demonstrate the precondition message).
- Pre-existing gifts so every screen has content on first load:
  - 3 gifts received by the demo recipient `u1` (one SENT delivery item, one OPENED voucher, one already DELIVERED).
  - 12+ orders for seller `s1` across statuses (ADDRESS_SUBMITTED ×5, SHIPPED ×3, DELIVERED ×2, CONVERTED ×1, DECLINED_REFUNDED ×1), with realistic fake addresses and phone numbers (010-0000-xxxx pattern).
- Order numbers format: `YYYYMMDD-NNNNNN`.
