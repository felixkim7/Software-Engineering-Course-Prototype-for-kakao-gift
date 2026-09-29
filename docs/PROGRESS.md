# Progress Tracker

Claude Code: update this file at the end of every phase (and whenever a decision is made).
Keep entries short. Newest notes at the top of each section.

## Current phase

**All phases complete** (Phase 6 done 2026-09-29) — demo-ready. Remaining manual checks are listed under Phase 6.

## Phase checklist

- [x] Phase 0 — Foundation (scaffold, design system, store, mock services, demo hub)
- [x] Phase 1 — Buyer: recipient selection & segmented recommendation
- [x] Phase 2 — Buyer: checkout, payment, send, history
- [x] Phase 3 — Recipient: inbox, gift view, delivery receipt
- [x] Phase 4 — Recipient: decline / convert to cash ★
- [x] Phase 5 — Seller center: integrated order + delivery, Excel, tracking upload
- [x] Phase 6 — Integration, polish, demo readiness

## Phase log

<!-- Template — copy for each finished phase
### Phase N — <name> (done YYYY-MM-DD)
- Built: <pages / modules>
- Acceptance criteria: all passed | exceptions: …
- Notes: …
-->

### Phase 6 — Integration, polish, demo readiness (done 2026-09-29)
- Built: `ui/demo-chrome.js` (floating 역할 전환 menu + presentation mode), hub 발표 모드 toggle, component gallery
  behind `?dev=1`, `docs/demo-script.md`, `docs/screenshots.md`, README rewrite.
- Bug sweep / walk-through: the spec's 6-step cross-role walk-through (buyer → recipient address → seller Excel +
  tracking → recipient 배송 중 → decline → convert) was scripted and run **twice in a row after one reset: 28/28 steps OK,
  no console errors or warnings** — nothing was broken before the polish work.
- Fixed in this phase: low-contrast small badges / greyed rows / deadline chip / error text / NEW pill / danger button
  (darkened text or To-Be colours, palette unchanged); label-in-name mismatches (수정, banner, deadline chip); seller label
  "발송 완료" vs tile "배송 중" → one word "배송 중" for every role, seller tiles and recipient timeline read `strings.js`;
  remaining 합니다체 system messages → 해요체 (formal consent lines kept as in the real app).
- Acceptance criteria:
  - PASS walk-through twice after one reset (see above).
  - PASS `?present=1`: role switcher + helper links (B05 수령자 화면 링크, 배송 완료 처리, 데모용 작성 예시, dev buttons)
    hidden on every page, remembered until `?present=0`; NEW pills kept.
  - PASS zero console errors or warnings: 12 mobile pages × 360/390/430 px, seller × 1024/1280/1440 px, hub; no page
    scrolls sideways.
  - PASS Lighthouse accessibility: buyer home 100, recipient decline 100, seller center 100 (also checkout 100,
    recipient gift view 100).
  - PASS demo-script.md and screenshots.md written against the actual UI (product paths and URLs checked).
  - PASS PROGRESS.md: all phases ticked; known issues accepted below.
- Consistency / a11y / performance / traceability: status labels from `strings.js` only; every page module starts
  with its screen IDs + use cases; keyboard-operable controls (native elements, ARIA radio groups, focus traps in
  overlays), visible focus, `prefers-reduced-motion`; recommendation filter ~2 ms, seller filters ~15 ms with 213 rows.
- Final fidelity pass (side by side with 164450 / 164646 / 164809 at 411 px): header, GNB, cards, typography and colours
  match. Intentional deviations: friend band with search + list instead of the single "+" card (To-Be B01), stepper on
  buyer screens (To-Be), labelled theme thumbnails without the "전체" button, history as a list of all sent gifts (the
  reference shows a single order's detail), plus the B03 deviations recorded in Phase 1.
- NEEDS MANUAL CHECK (can't be automated): a teammate reads SCR-R04 cold and understands both options; open one
  downloaded .xlsx in Excel / Numbers / Google Sheets; rehearse demo-script.md once on the presentation laptop.

### Phase 5 — Seller center (done 2026-09-29)
- Built: `seller/index.html` + `pages/seller-center.js` (SCR-S01), `ui/seller-dialogs.js` (SCR-S02 export, SCR-S03 bulk
  upload), `services/export-service.js` (SheetJS xlsx + CSV/BOM fallback + .xlsx/.csv parser), `registerTrackingBulk()`,
  `openDialog` / `openDrawer` (shared with the sheet), DataTable `rowClass` / `onRowClick` / pinned 주문번호 column,
  `maskAddress()`, store `auditLog` / `logAccess()` / `importGifts()`, `generateOrders()`; `placeholder.js` removed.
- Acceptance criteria (headless Chrome + `node tools/check-core.mjs`, files inspected as zip/XML):
  - PASS table: 13 s1 orders; tiles 발송 대기 6 · 배송 중 3 · 배송 완료 2 · 발송 불필요 2; tile + status select + 오늘/7일/30일 +
    search combine (search "강민재" → tiles recount).
  - PASS masking: table shows 김*우 · 010-****-1111 · 서울특별시 마포구 ***; drawer unmasked with "개인정보 열람 기록됨" and a
    PII_VIEW log entry; full export only after the acknowledgement (PII_EXPORT logged) — unmasked phone + address verified in
    both .xlsx and .csv.
  - PASS files: .xlsx has 주문번호 first, Korean intact, bold header (style with `<b/>`), column widths; CSV starts with the
    UTF-8 BOM; with jsDelivr blocked the export falls back to CSV + toast.
  - PASS inline tracking: missing courier / "123" rejected with messages; valid number → SHIPPED.
  - PASS bulk: demo example file → preview "등록 가능 3건 · 오류 3건" (bad number, unknown order, 발송 불필요) → toast
    "3건 등록, 3건 오류"; blank template round-trips (reports the missing courier).
  - PASS CONVERTED / DECLINED: greyed rows, no inputs, bulk + service refuse them, trackingNo stays empty.
  - PASS cross-role: recipient-addressed g1001 appears as 발송 대기; after registering → recipient 배송 중 · 우체국택배
    6070123456789, buyer 배송 중; converted/declined gifts show 발송 불필요.
  - PASS 200 orders (`?dev=1`): 213 rows, search ≈ 15 ms, tile ≈ 13 ms, sort ≈ 12 ms.
  - PASS no console errors at 1280 px and 1024 px. Phase 1–4 checks re-run without regressions.
  - NEEDS MANUAL CHECK: open a downloaded .xlsx in Excel / Numbers / Google Sheets once (verified here by reading the file XML).

### Phase 4 — Recipient decline / convert ★ (done 2026-09-29)
- Built: `services/decision-service.js` (`decideGift()` = UC-R3 steps 7–9 + 4a with in-flight promise, `processing`
  lock, idempotency key `decide-{giftId}`, status check on failure), `recipient/decline.html` + `pages/recipient-decline.js`
  (SCR-R04: options → confirm → processing), `recipient/result.html` + `pages/recipient-result.js` (SCR-R05),
  `bindRadioGroup()` (ARIA radio keyboard pattern), `OptionCompare` bold phrases, `.btn--danger`, `ALREADY_DECIDED` reason.
- Acceptance criteria (headless Chrome + `node tools/check-core.mjs`):
  - PASS convert: g1001 → CONVERTED, wallet 0 → 32,900 with one ledger entry after a triple click, buyer notifications +0,
    buyer history still "전달 완료", gift view shows no CTA.
  - PASS decline: a gift sent by u0 → DECLINED_REFUNDED (REFUND settlement), u0 sees "지우님이 선물을 거절하여 13,500원이
    환불되었어요." and "거절됨 · 환불 완료".
  - PASS `failNextSettlement`: error panel, back on 방법 선택 with the choice kept, status stays OPENED, lock cleared, no
    wallet entry; retry with the same key succeeds.
  - PASS double/triple click: one settlement, one credit, one notification (browser + Node).
  - PASS blocked: 금액전환이 불가한 상품이에요 (g1005) / 처리 기한이 지났어요 (g1004) / 배송지 입력·사용 후 (g1003) /
    `?as=u2` → 본인에게 온 선물만…; reopening a processed gift → 이미 처리된 선물이에요.
  - PASS keyboard: one Tab stop, arrows move + select, 다음/이전 move focus to the step heading / chosen card.
  - PASS no console errors; 390 px + frame. Phase 1–3 checks re-run without regressions.
  - NEEDS MANUAL CHECK: "the two options are understandable without explanation" — ask a teammate to read SCR-R04 cold.

### Phase 3 — Recipient receive (done 2026-09-29)
- Built: `recipient/index.html` + `pages/recipient-inbox.js` (SCR-R01), `recipient/gift.html` + `pages/recipient-gift.js`
  (SCR-R02), `recipient/receive.html` + `pages/recipient-receive.js` (SCR-R03), `ui/recipient.js` (gift bubble, deadline
  chip, barcode, delivery timeline), `css/recipient.css`, `store.useRecipientSession()`, placeholder `recipient/decline.html`
  (Phase 4). Shared page styles (info rows, timeline, form fields, thumbs) moved from buyer.css to components.css.
- Acceptance criteria: all passed (headless Chrome + `node tools/check-core.mjs`): inbox tabs 사용 가능 2 / 배송 0 / 완료 1
  with bubble + NEW dot on the SENT gift and D-30 / D-2 (warning) chips; a gift bought in the buyer flow appears in the
  inbox; opening g1001 SENT → OPENED and the buyer history shows "수령자 확인"; empty submit shows 4 inline errors, phone
  auto-formats, 주소 검색 sheet fills zip + address, 최근 배송지 fills every field, confirm → ADDRESS_SUBMITTED with note
  "배송지 입력 완료", then the decline entry is replaced by the muted reason; option step blocks 다음 until chosen;
  `?as=u2` on u1's gift shows "본인에게 온 선물만 확인할 수 있어요." with no gift data rendered; 390 px + frame OK; no
  console errors. Phase 1–2 checks re-run: no regressions.

### Phase 2 — Buyer checkout (done 2026-09-29)
- Built: `buyer/checkout.html` + `pages/buyer-checkout.js` (SCR-B04, layout per 164646), `buyer/complete.html` +
  `pages/buyer-complete.js` (SCR-B05), `buyer/history.html` + `pages/buyer-history.js` (SCR-B06, cards per 164809),
  message-card themes in `GiftMessageCard`, `resendGiftMessage()`, `markNotificationsRead()`, idempotent `createGift`,
  placeholder `recipient/gift.html` for the B05 demo link (Phase 3).
- Acceptance criteria: all passed (headless Chrome script + `node tools/check-core.mjs`): B01→B05 flow creates exactly
  one SENT gift (3 rapid clicks → 1 gift; deadline = 30 days, end of day); `failNextPayment` → error panel + toast, 0 gifts,
  flag reset, retry succeeds; `failNextMessage` → gift saved with `messageFailed`, warning on B05, 다시 보내기 clears it;
  `<b>hi</b>` renders literally on the card and on B05; history tabs 전체/진행 중/완료/거절·환불 work, CONVERTED shows
  "전달 완료" (no conversion wording anywhere, CONVERTED step removed from the buyer timeline), DECLINED shows
  "거절됨 · 환불 완료"; refund notice shown then marked read; stepper = 받는 사람 / 선물 고르기 (B02, B03) / 메시지·결제 /
  완료; 390 px + frame OK; no console errors.

### Phase 1 — Buyer discovery (done 2026-09-28)
- Built: `buyer/index.html` + `pages/buyer-home.js` (SCR-B01 friend picker, SCR-B02 segmented recommendation),
  `buyer/product.html` + `pages/buyer-product.js` (SCR-B03), `ui/friends.js`, `css/buyer.css`, `core/recommend.js`
  (pure scoring), `buyer/checkout.html` placeholder for Phase 2.
- Acceptance criteria: all passed (headless Chrome script + `node tools/check-core.mjs`): friend → chips pre-filled
  (u1: 친구/생일/20대/여성, 12 results); banner differs for u1 birthday / u2 coworker / u3 family / u6 partner; chip
  click re-renders in ~2 ms; 친구·응원·50대+·남성 → 0 results + empty state, 필터 초기화 → 32; DOM scan of all buyer pages
  finds no birthDate / date / age strings; browse mode has no recipient card and neutral chips; p07 shows
  "금액전환·거절 가능 NEW", p11 shows the muted note; `?to=` `?id=` and chip params survive reload; 390 px + frame OK;
  no console errors.
- Visual check: B03 compared side by side with 164618 (see Decisions for deliberate differences).

### Phase 0 — Foundation (done 2026-09-28)
- Built: `docs/visual-spec.md` (all 12 screenshots, measured colors/sizes), `tokens.css` + base/components/overlays/layout CSS,
  core (store, seed-data, state-machine, format, strings, recommend), mock services (payment, messaging, delivery, export stub),
  UI (components, overlays, icons, data-table, gallery), demo hub, 3 placeholder pages, 80 images cropped by `tools/crop-screens.py`.
- Acceptance criteria: all passed. Verified in headless Chrome via DevTools (no console errors on hub/buyer/recipient/seller;
  illegal transition throws `IllegalTransitionError`; `failNextPayment` fails once then resets; same idempotency key → same txId;
  modal traps focus + ESC closes; toast region `aria-live="polite"`; state survives reload; reset restores seed) and by
  `node tools/check-core.mjs`. Grep: no raw colors outside `tokens.css`.
- Visual check: buyer header + GNB compared side by side with 164501 at 411 px → fixed status bar (27 px / 15 px text),
  header height (40 px), tab spacing (20 px), promo label colors (pink / orange).
- Notes: screen-specific pieces (friend picker, audience circles, pay cards, order group) are left to the phase that builds that screen.

## Decisions & assumptions

- (Phase 6, demo guide) Sub-page headers (recipient screens, 선물 보낸 내역) now also have ✕ → demo hub, so every mobile screen can return to the hub in one tap while 발표 모드 hides the role switcher. Korean step-by-step guide: `README.ko.md`.
- (Phase 6) Presentation mode hides only demo chrome (역할 전환, `.demo-helper` links, dev buttons); the hub's reset and failure toggles stay visible because the alternate-flow demo needs them. During a presented demo, switch roles with the header ✕ (mobile) or 데모 허브 (seller) → hub.
- (Phase 6) SHIPPED reads "배송 중" for every role (data-model.md table updated; the seller label was "발송 완료", which clashed with the spec's 배송 중 tile).
- (Phase 6) `--color-danger` (#D63A28) and `--color-new` (#D63A28) are To-Be colours darkened for 4.5:1; small badges darken their text with color-mix; `--color-ink-muted` (#666) for greyed text on grey. Colours measured from the screenshots are unchanged.
- (Phase 6) Optional stretch items (buyer cancel, seller CS inbox, onboarding tour) were not built — still in the backlog, ask first.
- (Phase 5) SheetJS is loaded as the `xlsx-js-style@1.2.0` build (SheetJS 0.18.5 + cell styles) because the community `xlsx@0.18.5` build can't write the bold header the spec asks for; same `window.XLSX` API, same jsDelivr CDN.
- (Phase 5) Export cells starting with = + - @ are prefixed with ' (CSV/formula-injection guard); "no option" exports as an empty cell.
- (Phase 5) Bulk upload uses one courier sync for all rows (`registerTrackingBulk`) so a 10-row upload doesn't take 10× the mock latency. The upload dialog has a small "데모용 작성 예시 받기" file (valid rows + 3 deliberate errors) so validation can be shown live without editing Excel.
- (Phase 5) Seller detail drawer and full-PII export write to `state.auditLog` (accountability requirement). Seller timeline merges SENT/OPENED (both "배송지 입력 대기"). Store VERSION 7.
- (Phase 5) Global `[hidden] { display: none !important }` in base.css — fixes the export acknowledgement row and the mobile ↑ button, which component `display` rules were un-hiding.
- (Phase 4) The UC-R3 settlement logic lives in `services/decision-service.js` (not in the page) so the rules are shared and testable in Node. The `processing` lock stores a timestamp and expires after 30 s so a closed tab can't leave a gift stuck.
- (Phase 4) SCR-R04 options are stacked at phone width (side-by-side from 600 px+). A small 3-step stepper (방법 선택 → 확인 → 완료) was added for the same progress cue as the buyer flow. Convert confirm uses the app's yellow CTA; decline confirm uses the danger style.
- (Phase 4) Seed adds two blocked demo gifts for u1: g1004 (배스킨라빈스, sent 35 days ago → 처리 기한이 지났어요) and g1005 (아빠 → 정관장, not convertible). Store VERSION 6.
- (Phase 4) canDecide wording aligned with the spec: 금액전환이 불가한 상품이에요 / 처리 기한이 지났어요 / 이미 처리된 선물이에요.
- (Phase 3) No R00–R03 reference screenshots exist → recipient screens are built only from matched components/tokens; no fake chat room (spec builds it only if the R00 screenshot exists).
- (Phase 3) Recipient identity: `?as=` switches the viewing recipient and is remembered in `session.recipientId`; the hub's 수령자 card links to `recipient/?as=u1`.
- (Phase 3) Inbox tabs: 사용 가능 = SENT/OPENED, 배송 = ADDRESS_SUBMITTED/SHIPPED, 완료 = DELIVERED/USED/CONVERTED/DECLINED_REFUNDED (tab labels show counts).
- (Phase 3) "최근 배송지" = the recipient's most recent other gift with an address (u1 → g1003); a sample address is the fallback. The confirm dialog states that decline/convert is no longer possible after entering an address (UC-R3 precondition).
- (Phase 3) Vouchers: validity = 93 days from sending; 사용하기 opens a barcode sheet with an optional "사용 완료로 표시" (→ USED). Barcode is drawn from the order number.
- (Phase 3) Seed: the 투썸 voucher (g1002) was sent 28 days ago so its deadline chip shows D-2 in the warning colour; seeded cards pick a theme from the message wording. Store VERSION 5.
- (Phase 2) Message card themes 생일/감사/축하/응원/기본 use the 5 Kakao theme thumbnails from 164646; 축하 is the real blue card with its full illustration. The theme follows the 상황 chip (쾌유 → 응원, 그냥 → 기본); switching themes replaces the default text until the buyer types.
- (Phase 2) Payment idempotency key = one per checkout visit (a retry after failure reuses it); `createGift` is idempotent per `paymentTxId`; success uses `location.replace` so Back never reopens a paid checkout.
- (Phase 2) Checkout keeps the real 선물 배송지 입력 section for delivery items with only "선물 받는 친구가 입력할 거예요" enabled (recipient enters the address in Phase 3). 쇼핑포인트 / 현금영수증 / card list from 164646 are out of scope.
- (Phase 2) History tab mapping: 진행 중 = SENT/OPENED/ADDRESS_SUBMITTED/SHIPPED, 완료 = DELIVERED/USED/CONVERTED, 거절/환불 = DECLINED_REFUNDED. Buyer pages always act as u0.
- (Post-Phase 1, user) Age-fitting catalog: replaced the fictional-brand products with real 선물하기 listings (name, price, image from gift.kakao.com, downloaded by `tools/fetch-web-images.py`): 50대+/부모님 → 정관장 에브리타임 레귤러 67,000 · 정관장 에브리타임 리미티드 보자기 144,000 · 신세계푸드 한우 1++ 구이 선물세트 159,000 · 락토핏 50대+ 22,900; 10대/20대 → 춘식이 드레스업 인형 26,000 · 산리오 쿠로미 인형 27,900 · 빙글빙글 피카츄 23,000 · 올리브영 기프트카드 3만원권. 스타벅스 now has a real image (9,000원). New category `character` (캐릭터·굿즈) — the home's 팬덤·캐릭터 tile opens it. 하겐다즈 리얼블랑 / 투썸 narrowed from all ages to 20–40대 so age-specific gifts lead. Catalog = 35 products; store VERSION 2 forces a reseed in browsers holding old data.
- (Phase 1) Recommendation threshold: a product is recommended when its tag points ≥ 8 of 9 (관계 3 + 상황 3 + 연령대 2 must fit; 성별 +1 is a bonus). With ≥ 6 almost the whole catalog matched and the empty state was unreachable. Unselected group = match, so neutral chips show all 32.
- (Phase 1) Chip pre-fill: 관계/연령대/성별 from derived tags; 상황 = 생일 only when the birthday is within 7 days, otherwise none. Tapping an active chip clears that group; 성별 has an explicit "전체".
- (Phase 1) Dynamic banner copy follows the 상황 chip first, then 관계; birthday uses the given name ("지우님 생일이 3일 남았어요 🎂", chip "생일 선물 BEST").
- (Phase 1) B01 keeps the real home below the friend band (선물 테마 / 카테고리 / 최근 본 tiles + 실시간 선물랭킹); tiles open browse mode with the matching chip or category pre-selected.
- (Phase 1) B03 deliberate differences from 164618: no 쿠폰받기 pill and no "나에게 선물 시 … 저렴해요" box (out of scope) — replaced by the To-Be convert/decline info box; no 나에게 button; hero image is a tighter crop (baked-in badges removed).
- (Phase 1) Browse mode (no recipient): B03's 선물하기 opens a friend-picker bottom sheet, then goes to checkout.
- (Phase 1) Header ✕ returns to the demo hub; search/cart icons show a "데모에서는 지원하지 않는 기능이에요" toast.
- (Phase 0, user) Kakao logo / Kakao Friends characters are used as images cropped from the screenshots — no text-wordmark substitute. The app header stays bold text "선물하기" because that is what the screenshots show.
- (Phase 0, user) External CDN resources beyond SheetJS are allowed (Pretendard web font from jsdelivr). Icons are still inline SVG (Lucide-style paths) — no icon runtime needed.
- (Phase 0, user) Mobile screens show a fake Android status bar (the screenshots are Android).
- (Phase 0) Pixel ratio 2.625 (1080px → 411 CSS px) for converting screenshot measurements — see visual-spec.md §0.
- (Phase 0) Seed dates are generated relative to "now" (u1's birthday is always D-3, deadlines always valid) so the demo works on any day.
- (Phase 0) Seed uses the real brand names seen in the screenshots (하겐다즈, 고디바, BBQ …) to match the images. Seller s1 = 하겐다즈 공식스토어.
- (Phase 0) Product fields added beyond data-model.md: `discountRate`, `benefitPrice` (최대혜택가), `badge` (단독/쨍특), `freeShipping`, `wishCount` — display only.
- (Phase 0) `convertible: false` products: p11 파리바게뜨 (배달 주문 교환권), p25 정관장.
- (Phase 0) The store reloads on the `storage` event, so hub / buyer / recipient tabs open side by side never overwrite each other.
- (Phase 0) Order numbers keep the spec format `YYYYMMDD-NNNNNN` (the real app shows 10 digits; spec wins for data).
- (Phase 0) Screenshot images are cropped by `tools/crop-screens.py` into `prototype/assets/img/`; add new crops there in later phases.
- Convert-to-cash credits 100% of the paid amount to a generic in-app wallet ("페이머니"). (Assumption — no fee.)
- Decision deadline for decline/convert = 30 days after sending. (Assumption.)
- Decline/convert is not allowed after the recipient has submitted a delivery address or used a voucher. (From UC-R3 precondition "not yet used/received".)
- UI copy is Korean; code and docs are English.
- Visuals copy the real KakaoTalk Gift app from `docs/reference-screens/` (screenshot wins over spec for visuals). Images/logos are cut from screenshots.

## Known issues

All remaining items are **accepted** (no open bugs):

- Accepted: white text on the blue message themes (감사, 축하) is ~2.4:1 — it is the real card from 164646 (screenshot wins for visuals), 30 px bold with a text shadow; other themes use dark text.
- Accepted: sale-red prices / 최대혜택가 and the pink 생일 pills are the real app's colours (≈ 3–3.7:1 for small text); Lighthouse still scores 100 on the audited pages.
- Accepted: `ui/components.js` is 289 lines (limit ~300); Phase 6 additions went to `ui/demo-chrome.js` instead.
- Accepted: after code changes a browser may keep old JS modules (local servers send no cache headers) → Ctrl+Shift+R before the demo (README + demo-script).
- Accepted: two exports on the same day share a filename, so the browser renames or overwrites the second download.

## Ideas / backlog (not in any phase — ask before building)

- Buyer-initiated cancel/refund (Buyer goal 6).
- Seller CS inbox (UC-S3).
- Wishlist.
