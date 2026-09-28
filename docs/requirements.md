# Requirements — KakaoTalk Gift To-Be System

Source: team presentation "소프트웨어공학 팀과제1. 재구축 서비스 정의 — 카카오톡 '선물하기' 시스템 재구축"
and the assignment brief (CSE4115 Team Assignment 1). Translated to English for development.
Korean terms are kept in parentheses where they appear in the UI.

## 1. System overview

- **Purpose:** A messenger-based social commerce platform for sending gift vouchers
  (e-coupons) and physically delivered gifts to KakaoTalk friends.
- **Users:** Gift buyer, gift recipient, seller (brand / store), platform operator.
- **Why rebuild (As-Is problems):**
  1. UI/UX & search usability limits — hard to explore gifts suited to a specific person.
  2. Expiry / CS hassle — extensions and refunds are complicated; recipients sometimes
     have to phone the seller directly.
  3. Missing convenience feature — no way to **decline** an unwanted gift.

## 2. Actors

| Actor | Type | Description |
|---|---|---|
| Buyer (구매자) | Primary | Selects a product, pays, and sends it as a gift to another user. |
| Recipient (수령자) | Primary | Receives a gift, checks it, chooses how to receive it or enters required info (option, address). |
| Seller (판매자/입점처) | Primary | Registers and sells products; manages stock, orders and delivery info. |
| Service admin (서비스 관리자) | Primary (out of prototype scope) | Operates the service, handles inquiries, manages products and sellers. |
| Payment system (결제 시스템) | Supporting, external | Processes payments, cancellations and refunds; returns success/failure. |
| Delivery system (배송 시스템) | Supporting, external | Ships delivery items; syncs tracking numbers and delivery status. |

## 3. Actor–Goal list (primary actors)

**Buyer**
1. Explore gifts that suit the recipient.
2. Search for products and view product details.
3. Purchase the chosen product as a gift for the recipient.
4. Check the delivery status of a sent gift.
5. View past gift purchase history.
6. Cancel / refund a gift that is no longer wanted after purchase.

**Recipient**
1. Check the product and the sender's message of a received gift.
2. Enter option and delivery address to receive a delivery item.
3. Check the delivery progress.
4. Decline an unwanted gift, or get a refund if needed.
5. Write a review of the received product.
6. Get customer support for problems during receipt/delivery.

**Seller**
1. Pass onboarding review and open a sales page.
2. View order details (option, quantity) and recipient delivery address.
3. Ship products and upload delivery status info to the system.
4. Handle CS: product inquiries, refund requests, validity extensions.
5. Monitor product reviews.

## 4. Actor–Use case list (prioritized) — prototype scope in **bold**

| ID | Actor | Use case | Description | Priority |
|---|---|---|---|---|
| **UC-B1** | Buyer | Select recipient (수령자 결정) | Buyer decides who to send a gift to; this drives the recommendations. | M |
| **UC-B2** | Buyer | Choose & purchase gift (선물 결정 / 선물 검색) | Buyer picks a gift from segmented recommendations (or freely), pays, and sends. | VH |
| **UC-B3** | Buyer | View purchase history (선물 구매 내역 조회) | Alternate flow 3c of UC-B2; also shows status/refund notices. | M |
| **UC-R1** | Recipient | Check gift (선물 확인) | Recipient sees product, message, and the receive/decline choice screen. | VH |
| **UC-R2** | Recipient | Receive delivery item (배송상품 수령) | Recipient enters option and address to receive a delivery item. | VH |
| **UC-R3** | Recipient | Decline gift / convert to cash (선물 거절 및 금액 전환) | Recipient chooses to receive the amount instead, or declines so the buyer is refunded. | H |
| **UC-S1** | Seller | View order & delivery info (상품 주문 내역 및 배송지 확인) | Order details + recipient address in one view/file keyed by order number. | VH |
| **UC-S2** | Seller | Ship & upload delivery info (배송 처리 및 배송 정보 업로드) | Ship based on order/address; upload tracking info to the system. | VH |
| UC-S3 | Seller | Customer support (고객 응대) | Inquiries, refunds, validity extension. *(Out of scope; optional read-only mock in Phase 6.)* | H |

Also shown in the As-Is use case diagram but **out of prototype scope**: wishlist,
product registration, CS (inquiry / delivery status), voucher usage status, reviews,
buyer refund, admin functions.

## 5. Use case descriptions (the three detailed ones)

### UC-B2 — Gift search & purchase (선물 검색)
- **Primary actor:** Buyer. **Supporting:** Payment system.
- **Main success flow**
  1. Buyer selects a recipient.
  2. The system applies the recipient's stored info to set recommendation options, and the ad banner changes accordingly.
  3. Buyer browses popular gifts by gender and age group (segmented recommendation).
  4. Buyer selects the gift they want to give.
  5. The system shows the selected product, recipient, and payment amount.
  6. Buyer writes a message and chooses a payment method.
  7. The system requests payment for the amount from the payment system.
  8. The payment system approves and returns success.
  9. The system sends a gift message (product, message, receive choice) to the recipient.
  10. The system shows the buyer that the gift was sent.
- **Alternate flows**
  - 3a (existing flow): Buyer browses popular gifts by gender/age.
  - 3b: Buyer picks a gift directly (search / all categories), ignoring recommendations.
  - 3c: Buyer views their own past gift purchase history.
  - *(added for prototype)* 8a: Payment fails → the system shows the error, nothing is sent, buyer can retry or change payment method.
- **Stakeholders & interests:** Buyer — find a fitting gift with little browsing, pay quickly and safely. Recipient — receive a fitting gift; no unnecessary exposure of personal info. Seller — products exposed to the right customers; accurate order/payment info. Operator — higher conversion; stable recommendation, payment, delivery. Payment provider — accurate, secure processing of valid requests.
- **Preconditions:** Recipient is decided; buyer is logged in; product lookup and payment are available; segmented recommendation (gender/age) is ready.
- **Postconditions:** Recommendation result and buyer choices are stored; payment approved and order/gift stored; purchase history and payment result recorded to the buyer's account; recipient receives gift info and message; gift sending status recorded.
- **Special requirements:**
  - Usability — buyer can easily see progress from search to payment completion (→ **stepper**).
  - Performance — recommendations and product lists appear with < 1 s delay.
  - Reliability — if delivery of the gift message fails temporarily after payment, order/payment info is not lost and sending can be retried.
  - Security — recipient's personal info is used only to help the buyer decide.

### UC-R3 — Decline gift / convert to cash (선물 거절 및 금액 전환)
- **Primary actor:** Recipient. **Supporting:** Payment system, Buyer.
- **Main success flow (convert to cash = 금액으로 받기)**
  1. The system shows the recipient the gift message (product info, buyer's message).
  2. Recipient does not want the product and opens the "choose how to handle this gift" function.
  3. The system shows two options — **Receive as money** and **Decline gift** — and explains the result of each.
  4. Recipient selects **Receive as money**.
  5. The system shows the amount to be converted and the result, and asks for final confirmation.
  6. Recipient confirms.
  7. The system requests conversion for the recipient from the payment system.
  8. The payment system processes it and returns the result.
  9. The system sets the gift to **converted** and makes the original gift unusable.
  10. The system shows the recipient that conversion is complete.
- **Alternate flows**
  - 4a. Recipient selects **Decline gift**: the system explains that the payment will be refunded to the buyer and the buyer will be notified → asks for final confirmation → recipient confirms → system requests cancel/refund for the buyer → payment system refunds and returns result → gift set to **declined** and unusable → buyer is notified of decline + refund → recipient sees decline complete.
  - 8a. Conversion fails → return to step 3 (show both options again with explanations).
- **Stakeholders & interests:** Recipient — not forced to accept; can choose money or decline; understands the impact on the buyer. Buyer — accurate refund when declined and confirmation of it. Admin — conversion vs decline clearly separated; no double refund or inconsistent state. Seller — declined/converted items are not shipped and order status reflects it.
- **Preconditions:** Recipient authenticated; a valid gift delivered; gift not yet used/received; within the decision deadline; product allows convert/decline in the To-Be system.
- **Postconditions (convert):** conversion completed for recipient; gift saved as converted; no reuse or further refund possible; buyer **not** notified of decline; conversion record stored.
- **Postconditions (decline):** buyer's payment cancelled/refunded; gift saved as declined; gift unusable; buyer notified of decline + refund; decline/refund record stored.
- **Special requirements:**
  - Functional suitability — recipient can choose between the two options.
  - Usability — the difference and outcome of each option are clearly shown; minimal clicks.
  - Performance — status reflects immediately after the request.
  - Reliability — on error the status must not become "completed"; no double conversion/refund.
  - Security — only the authenticated recipient of that gift can do this.

### UC-S1/S2 — Order & delivery management (판매자 주문/배송 관리)
- **Primary actor:** Seller. **Supporting:** Gift platform.
- **Main success flow:** (1) product approved and sales page opened; (2) buyer pays for a gift to a recipient; (3) recipient enters address after the KakaoTalk notification; (4) seller checks order info and the recipient address for each order number in the seller center; (5) seller ships via their courier; (6) after delivery, recipient does reviews / extensions etc.
- **Alternate flows**
  - 4a (As-Is): Seller looks up each order number separately in Order and Delivery menus.
  - **4b (To-Be):** The platform provides **one Excel file** containing all orders **and** recipient delivery info, keyed by order number, so the seller can process in bulk.
- **Preconditions:** Seller is approved; seller is business-verified and logged in to the seller center.
- **Postconditions:** Sales info stored; stock updated in real time.
- **Special requirements:** Usability — intuitive UI. Performance — no delay under many orders. Reliability — no missing delivery info. Security — personal info (phone, address) protected (masked in UI).

## 6. Screen list & traceability

| Screen ID | Page | Actor | Use case / step | Requirement shown |
|---|---|---|---|---|
| SCR-00 | `index.html` demo hub | — | — | Role switch, reset data, failure toggle |
| SCR-B01 | `buyer/index.html` Home: recipient picker | Buyer | UC-B1, UC-B2 step 1 | Recipient-driven flow |
| SCR-B02 | `buyer/index.html` Recommendations | Buyer | UC-B2 steps 2–3, alt 3a/3b | **Segmented recommendation**, dynamic banner, derived tags only |
| SCR-B03 | `buyer/product.html` Product detail | Buyer | UC-B2 step 4 | Convertible badge |
| SCR-B04 | `buyer/checkout.html` Checkout | Buyer | UC-B2 steps 5–8, alt 8a | Stepper, message card, payment method |
| SCR-B05 | `buyer/complete.html` Sent | Buyer | UC-B2 steps 9–10 | Confirmation |
| SCR-B06 | `buyer/history.html` Purchase history | Buyer | UC-B3 / alt 3c | Status + decline/refund notices |
| SCR-R01 | `recipient/index.html` Gift inbox | Recipient | UC-R1 | Status badges, deadline |
| SCR-R02 | `recipient/gift.html` Gift view | Recipient | UC-R1, UC-R3 steps 1–2 | Receive / "Don't want it?" entry |
| SCR-R03 | `recipient/receive.html` Option + address | Recipient | UC-R2 | Simplified address input |
| SCR-R04 | `recipient/decline.html` Choose handling | Recipient | UC-R3 steps 3–8, 4a, 8a | **Convert vs decline** comparison, confirm, failure recovery |
| SCR-R05 | `recipient/result.html` Result | Recipient | UC-R3 step 10 / 4a end | Final status |
| SCR-S01 | `seller/index.html` Orders & delivery | Seller | UC-S1, alt 4b | **Integrated table keyed by order no.**, masking |
| SCR-S02 | `seller/index.html` Export modal | Seller | UC-S1 alt 4b | **Excel download (order + delivery)** |
| SCR-S03 | `seller/index.html` Tracking upload | Seller | UC-S2 | Inline + bulk file upload with validation |

Use these screen IDs in code comments (`// SCR-R04`) and in the presentation slides.

## 7. Quality characteristics (ISO/IEC 25010) targeted by the prototype

- **Usability** — appropriateness recognizability (segmented categories), learnability
  (clear stepper), operability (minimal clicks; one-file export), user error protection
  (confirmation before irreversible decline/convert), accessibility.
- **Functional suitability** — recipient decision options; seller integrated data.
- **Reliability** — fault tolerance on payment failure; no double processing.
- **Security** — confidentiality (masked PII, derived tags only), accountability (history log).
- **Performance efficiency** — client-side filtering renders instantly (< 1 s).
