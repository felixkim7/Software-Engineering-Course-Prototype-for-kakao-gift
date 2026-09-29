# KakaoTalk Gift (선물하기) To-Be — Screen Prototype

Front-end-only clickable prototype for Sogang University CSE4115 Software Engineering,
Team Assignment 1 ("재구축 서비스 정의"). Built with vanilla HTML, CSS and JavaScript; all data lives in
`localStorage` and the payment, delivery and messaging systems are simulated.

It walks through the key use cases of three roles and shows the three To-Be improvements (marked **NEW**):

| Role | Screens | To-Be improvement |
|---|---|---|
| 구매자 (buyer) | friend picker → segmented recommendation → product → checkout → sent → history | ① recommendation by 관계 · 상황 · 연령대 · 성별 |
| 수령자 (recipient) | gift inbox → gift view → option & address → decline / convert → result | ② decline the gift or receive it as money |
| 판매자 (seller) | integrated order + delivery table, Excel export, bulk tracking upload | ③ one screen / one file keyed by 주문번호 |

## Run

1. Open this folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `prototype/index.html` → **Open with Live Server**.
   *(Alternative: `npx serve prototype` and open the printed URL.)*

ES modules don't work from `file://`, so always use a local server. After pulling new code, hard-refresh
(Ctrl+Shift+R) so the browser doesn't keep old modules. The Excel export loads SheetJS from jsDelivr;
without internet it falls back to CSV (UTF-8).

## Demo

- **Hub** (`prototype/index.html`): role cards, **데모 데이터 초기화**, failure toggles for the alternate flows
  (결제 실패 · 환불/금액 전환 실패 · 메시지 전송 실패), NEW badge toggle and **발표 모드**.
- **발표 모드** (hub toggle or `?present=1` on any page, `?present=0` to leave): hides the floating
  **역할 전환** button and demo helper links; NEW pills stay.
- **Dev extras**: `index.html?dev=1#gallery` shows the component gallery; `seller/?dev=1` adds a
  "주문 200건 생성" button; recipient pages accept `?as=u2` to view as another recipient.
- 한국어 단계별 데모 가이드: [`README.ko.md`](README.ko.md).
- Walk-through with what to say: [`docs/demo-script.md`](docs/demo-script.md).
  Screens to capture for the slides: [`docs/screenshots.md`](docs/screenshots.md).

## Folder overview

```
prototype/
  index.html            demo hub (SCR-00)
  buyer/                SCR-B01~B06 (mobile, phone frame)
  recipient/            SCR-R01~R05 (mobile, phone frame)
  seller/               SCR-S01~S03 (desktop)
  assets/css/           tokens.css (all colors/sizes) · base · components · overlays · layout-* · buyer · recipient
  assets/js/core/       store, seed-data, state-machine, format, strings, recommend
  assets/js/services/   mock payment / messaging / delivery / decision (UC-R3) / export (Excel)
  assets/js/ui/         components, overlays, icons, data-table, friends, recipient, seller-dialogs, demo-chrome, gallery
  assets/js/pages/      one module per HTML page (header comment = screen IDs + use cases)
  assets/img/           images cropped from docs/reference-screens/ + real 선물하기 product images
tools/
  crop-screens.py       re-crop images:  python tools/crop-screens.py   (needs Pillow)
  fetch-web-images.py   re-download real 선물하기 product images (sources listed inside)
  check-core.mjs        core logic self-check:  node tools/check-core.mjs
```

## Docs

- `CLAUDE.md` — project rules Claude Code reads automatically.
- `docs/requirements.md` — actors, use cases, screen list and traceability.
- `docs/data-model.md` — entities, gift state machine, mock services.
- `docs/reference-screens/` + `docs/visual-spec.md` — the real app's screenshots and the values measured from them.
- `docs/design-system.md` — visual fidelity rules and components.
- `docs/phases/` — one spec per development phase (0–6); `docs/PROGRESS.md` — what was built, decisions, known issues.

Slash commands in Claude Code: `/start-phase N`, `/review-phase N`, `/fix <problem>`.
