# Phase 5 — Seller center: Integrated order + delivery management

**Use cases:** UC-S1 (view order & delivery info, alt 4b), UC-S2 (ship & upload tracking).
**Screens:** SCR-S01, SCR-S02, SCR-S03 (all on `seller/index.html`).
**To-Be improvement showcased:** *One integrated order + delivery Excel file keyed by
order number* instead of cross-checking two menus (As-Is alt 4a).

**Read first:** `CLAUDE.md`, `docs/requirements.md` §5 UC-S1/S2, `docs/data-model.md` §3–4.

Seller pages act as seller `s1` ("Cafe Lumen 공식스토어" or whatever the seed uses). Desktop layout.

## Visual reference

Open before coding: `docs/reference-screens/` → S01__*, S02__*, S03__* (seller center), XX__*, and `docs/visual-spec.md`.
If seller-center screenshots exist, match their layout (sidebar, top bar, filters, table density, buttons). Otherwise use a plain admin layout with the extracted palette and typography. The integrated table, Excel export and bulk upload are To-Be features; style them like the rest of the seller center.
Screenshot = source of truth for visuals; this spec = source of truth for functionality and flow.

## Screens

### SCR-S01 — 주문/배송 통합 관리 (main table)
- Page title "주문·배송 통합 관리" with NEW pill and a one-line As-Is vs To-Be note:
  "기존: 주문관리·배송관리 메뉴에서 주문번호로 따로 대조 → 개선: 한 화면·한 파일에서 확인".
- Summary tiles: 발송 대기 {n} · 배송 중 {n} · 배송 완료 {n} · 발송 불필요 {n}. Clicking filters the table.
- Toolbar: status filter, date range (fake presets: 오늘 / 7일 / 30일), search (주문번호, 상품명, 받는 분), "엑셀 다운로드", "송장 일괄 업로드".
- `DataTable` columns (one row per order, **주문번호 is the key column, pinned left**):
  주문번호 · 주문일시 · 상품명 · 옵션 · 수량 · 결제금액 · 받는 분 · 연락처 (masked `010-****-1234`) ·
  주소 (masked after 동/구) · 배송메모 · 상태 · 택배사 · 송장번호.
- Row click → side drawer with full details (unmasked, with "개인정보 열람 기록됨" note — security).
- CONVERTED / DECLINED_REFUNDED rows: greyed, status "발송 불필요 (금액 전환 / 거절·환불)",
  no tracking input (seller stakeholder interest).
- SENT/OPENED (address not yet entered) rows: status "배송지 입력 대기", no tracking input.
- ADDRESS_SUBMITTED rows: inline courier select + tracking number input + "등록" button.

### SCR-S02 — Excel export (modal)
- Options: 범위 (현재 필터 결과 / 전체 / 선택한 행), include masked or full PII (full requires a
  checkbox acknowledgement), file format (.xlsx default, .csv).
- File name: `선물하기_주문배송통합_{YYYYMMDD}.xlsx`.
- One sheet, columns identical to the table (unmasked when acknowledged), header row bold, 주문번호 first.
- Implementation (`export-service.js`): load SheetJS from
  `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js` via a `<script>` tag;
  if `window.XLSX` is missing (offline), fall back to CSV with UTF-8 BOM so Korean opens
  correctly in Excel, and show a toast explaining the fallback.

### SCR-S03 — Tracking upload
- **Inline:** courier (CJ대한통운, 한진택배, 롯데택배, 우체국택배, 로젠택배) + tracking number
  (10–13 digits). On 등록 → `deliveryService.registerTracking` → transition to SHIPPED.
- **Bulk (modal):** "양식 다운로드" gives a template (주문번호, 택배사, 송장번호) pre-filled with
  all ADDRESS_SUBMITTED orders. Upload .xlsx/.csv → preview table with per-row validation
  (unknown order no., not in 발송 대기 status, bad courier, bad tracking format) → "n건 등록"
  applies only valid rows; summary toast "8건 등록, 2건 오류".
- Demo helper: per-row "배송 완료 처리" (small, grey) to move SHIPPED → DELIVERED.

## Cross-role effects
- A delivery gift addressed in Phase 3 appears here as 발송 대기.
- After tracking is registered, the recipient's gift view shows 배송 중 with courier + tracking no.,
  and the buyer's history shows 배송 중.
- A gift converted/declined in Phase 4 shows here as 발송 불필요.

## Acceptance criteria

- [ ] Table shows all seed orders for `s1`; filters, search and summary tiles work together.
- [ ] Phone/address masked in the table; unmasked in the drawer and (when acknowledged) in the export.
- [ ] Downloaded .xlsx opens in Excel/Numbers/Google Sheets with Korean text intact and 주문번호 as first column; CSV fallback also opens correctly.
- [ ] Inline tracking registration validates and moves the order to 배송 중.
- [ ] Bulk upload: template round-trip works; invalid rows are reported and skipped.
- [ ] CONVERTED/DECLINED orders can never receive a tracking number.
- [ ] Cross-role effects above verified.
- [ ] Table stays responsive with 200 generated orders (add a hidden dev button "주문 200건 생성" to test).
- [ ] No console errors at 1280px and 1024px.

## Out of scope

Product registration, CS/inquiries, reviews, settlement reports, seller login.

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md and docs/phases/phase-5-seller-center.md.
> Phases 0–4 are complete. Implement Phase 5 (seller center: SCR-S01, S02, S03). Plan first.
> Implement export-service.js with SheetJS from jsDelivr and the CSV (UTF-8 BOM) fallback.
> Verify acceptance criteria including the cross-role effects and update docs/PROGRESS.md.
