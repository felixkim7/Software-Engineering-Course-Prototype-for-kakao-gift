# Visual Spec — extracted from `docs/reference-screens/`

Source of truth for `prototype/assets/css/tokens.css`. Written in Phase 0.
If a value here disagrees with a screenshot, the screenshot wins; fix this file.

## 0. Method & pixel ratio

- All 12 screenshots are Android (Samsung, 1080 px wide; heights 2316 or long scroll
  captures of 4162 / 8243). The status bar is Android (time left, icons + battery right).
- **Pixel ratio used: 2.625** (1080 ÷ 2.625 = **411 CSS px** layout width). Why: with this
  ratio the measured values land on a 4/8 px grid (side padding 42 → 16, grid gap 21 → 8,
  button height 126 → 48, sheet handle 10 → 4). With ÷3 they land on 14/7/42, which is unlikely.
- Colors were sampled from the pixels with PIL (most common color in a region), not guessed.
  JPEG noise is about ±3 per channel, so values are rounded to the nearest clean hex.
- Font sizes are estimated from glyph ink height (Hangul ink ≈ 0.87 em, Latin cap ≈ 0.72 em,
  checked against each other on the "FOR ME / 홈" tab row: both → 15 px).
- The prototype phone frame is 390 px wide (CLAUDE.md). Layouts are fluid (%, flex, grid),
  so the 411 px values carry over; only full-width images shrink by ~5%.

## 1. Screenshot index

| File (`Screenshot_20260928_…`) | Screen ID | What it shows |
|---|---|---|
| `164450` (long) | SCR-B01/B02 | Home, **선물 테마** segment: friend picker → theme icon grid → 실시간 선물랭킹 (audience circles, sub-tabs, price chips, 3-col ranked grid) → 더보기 |
| `164501` | SCR-B01/B02 | Home, **카테고리** segment (icon grid), bottom nav, ad popup |
| `164507` | SCR-B02 | Home, **최근 본** segment: circular recent thumbnails + "내가 본 BBQ와 비슷한 상품" row |
| `164514` | SCR-B02 (alt 3b) | 카테고리 page: 2-col icon list, 내 관심 카테고리 chips, ad banner, LuX dark card |
| `164602` | SCR-B01 | Home **after a friend is chosen**: "현지 ❤에게 선물하기" card, 수정, 생일 알림 |
| `164609` (long) | SCR-B02 | Category product list (케익·디저트): teal banner, sub-tabs, sort row, 2-col grid |
| `164618` (long) | SCR-B03 | Product detail, full page + sticky bottom bar |
| `164632` | SCR-B03 | Product detail with **option bottom sheet** (quantity, total, CTA) |
| `164646` (very long) | SCR-B04 | Checkout: message card + theme strip, address choice, gift info, points, payment methods, summary, pay CTA |
| `164809` | SCR-B06 | Order detail in history: 주문일, to. 현지 group, status, 취소/재전송 buttons, accordions |
| `164819` | SCR-B06 | Same, with **confirm dialog** "주문을 취소하시겠습니까?" and yellow-checked checkboxes |
| `164826` | SCR-B06 | After cancel: status "결제 취소 예정" + Android heads-up notification from 카카오톡 선물하기 |

**Not covered by any screenshot:** recipient screens (R01–R05), chat bubble (R00), seller
center (S01–S03), an in-app toast, a loading spinner, empty states, stepper. These use the
components below (same colors, type, radii) per design-system.md §0.

## 2. Color palette

| Token | Hex | Where it's used |
|---|---|---|
| `--color-accent` | `#FEE500` | Primary CTA fill (선물하기, 결제하기, dialog 네), selected radio, checked checkbox, star rating |
| `--color-accent-strong` | `#FFEB00` | Home "+" squircle, 카카오페이 머니 card (slightly brighter yellow) |
| `--color-accent-ink` | `#191919` | Text on yellow |
| `--color-ink` | `#191919` | Primary text, brand names, prices, black buttons (나에게, active chip `#222`) |
| `--color-ink-strong` | `#000000` | Section titles, active top-tab underline |
| `--color-ink-2` | `#424242` | Product names in cards, rank badge fill |
| `--color-ink-body` | `#303030` | Body labels (friend prompt, icon-grid labels) |
| `--color-ink-3` | `#767676` | Captions: wish counts, sort row, "어제 생일", review count, brand in order list |
| `--color-ink-4` | `#949494` | Unselected radio ring, sheet handle |
| `--color-ink-5` | `#CCCCCC` | Placeholders ("0 P") |
| `--color-line` | `#EDEDED` | Card borders, hairlines, input borders |
| `--color-line-strong` | `#DADADA` | Top-tab bar bottom border, pill chip border, outline buttons |
| `--color-bg` | `#FFFFFF` | Page / card surface |
| `--color-bg-soft` | `#FAFAFA` | Bottom nav, sub-tab bar, order info box, detail section band |
| `--color-bg-grey` | `#F5F5F5` | Home friend-picker band, order-history page background, segment track, 수정 button |
| `--color-section-gap` | `#EDEDED` | 8 px band between checkout sections |
| `--color-tag-bg` | `#F0F0F0` | "무료배송" tag, dialog secondary button (아니오) |
| `--color-tag-ink` | `#595959` | "무료배송" tag text |
| `--color-sale` | `#F2473A` | Discount %, 최대혜택가, status text "결제 완료 (배송지 미입력)" (`#DD4844` measured there) |
| `--color-sale-strong` | `#F6432F` | 쿠폰받기 pill, bottom-nav red dot |
| `--color-pink` | `#F46068` | "생일 친구" pill, 생일 알림 outline pill, "최대 2% 적립" pill, GNB promo label "키엘 메디립" |
| `--color-orange` | `#EA7122` | GNB promo label "더블할인중!" |
| `--color-blue` | `#4684EB` | Ranking: ALL circle, 모두가 label, active sub-tab, recent-view ring |
| `--color-blue-soft` | `#E5F1FF` | Ranking sub-tab box background |
| `--color-blue-pale` | `#E8F0FC` | Inactive audience circles |
| `--color-blue-muted` | `#7DA4DF` | Inactive ranking sub-tab labels |
| `--color-link` | `#206FBE` | Underlined links ("[필수] 개인정보 이용 …") |
| `--color-point` | `#1A73D9` | Point amounts ("0원", "총 0원"), "혜택", count "3" |
| `--color-info-bg` | `#F2F6FF` | "나에게 선물 시 … 저렴해요" box (border `#C9D9F5`) |
| `--color-info-bg-2` | `#F8F9FB` | Payment benefit box, points summary box |
| `--color-qty-bg` | `#F7FBFE` | "수량 1개" box in checkout |
| `--color-promo-bg` | `#FFF0DD` | "오늘의 쨍특딜은 딱 24시간 동안!" bar |
| `--color-banner-teal` | `#238A86` | Category banner (chip on it `#1C6E6A`); banner color changes per category |
| `--color-message-blue` | `#75A9FC` | Checkout message card theme (one of many themes) |
| `--color-badge-exclusive` | `#000000` + `#FFE400` text | "단독" badge |
| `--color-badge-hot` | `#FFF600` + `#3E1B08` text | "쨍특" badge |
| `--color-card-brown` / `--color-card-blue` | `#7E7266` / `#0A6BC0` | Bank cards in 카카오페이 결제 list |
| `--color-dim` | `rgba(0,0,0,.4)` | Dialog overlay (white → `#999999` measured) |
| `--color-counter-bg` | `rgba(0,0,0,.4)` | "1/2" image counter pill |

To-Be only (no screenshot; chosen to fit the palette):
`--color-positive #1E9E62`, `--color-warning #E08A00`, `--color-danger` = `--color-sale`,
`--color-money` = `--color-blue` (convert-to-cash reuses the app's ranking blue rather than a new purple),
`--color-new` = `--color-sale-strong` (NEW pill).

## 3. Typography

Font: the screenshots use Samsung's system Korean font. Stack:
`"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif`.
Weights seen: 400 and 700 only (no visible 500/600). Numbers use the same font (no tabular figures).

| Role | Size / weight | Line height | Seen in |
|---|---|---|---|
| App header title ("선물하기") | 20 / 700 | 1 | all buyer screens |
| Section title ("실시간 선물랭킹", "이 브랜드의 추천 상품") | 20 / 700 home, 18 / 700 detail & checkout | 1.3 | 164450, 164618, 164646 |
| Top tab label ("홈", "랭킹", "FOR ME") | 15 / 700 | 1 | GNB |
| Top tab promo label ("더블할인중!") | 10 / 700, sale red | 1 | GNB |
| Segment label (선물 테마/카테고리/최근 본) | 15 / 700 active, 15 / 400 inactive | 1 | home |
| Icon-grid label | 14 / 400 | 1.2 | home, 카테고리 |
| Card brand + "›" | 13 / 700 (3-col), 14 / 700 (2-col) | 1.3 | ranking, list |
| Card product name | 13 / 400, **2-line clamp**, lh 16 px (3-col); 14 / 400, lh 18 px (2-col) | | ranking, list |
| Card price | 15 / 700 (3-col), 16 / 700 (2-col); discount % same size, sale red | 1.2 | |
| "최대혜택가 …" | 12 / 700 sale red | 1.3 | |
| Caption (wish count, sort, gift promo) | 12–13 / 400, ink-3 | 1.3 | |
| Tag ("무료배송") | 11 / 400 | 1 | |
| Detail brand | 17 / 700 | 1.3 | 164618 |
| Detail product name | 18 / 400 | 24 px | 164618 |
| Detail price | 22 / 700 | 1.2 | 164618 |
| Sheet total ("결제금액 32,900원") | 15 / 400 label, 24 / 700 amount | | 164632 |
| CTA label | 16 / 400 (yellow & black buttons), 18 / 400 checkout pay button | | |
| Body / list rows (order, checkout) | 16 / 400 | 1.4 | 164646, 164809 |
| Message-card headline | 30 / 700 white, centered | 1.3 | 164646 |
| Dialog message | 16 / 400 | 1.55 | 164819 |
| Bottom-nav label | 11 / 400 | 1 | 164501 |

Line clamping: product names in all cards are 1–2 lines with ellipsis (2 in ranking/list,
1 in "최근 본" row and brand-recommendation row).

## 4. Spacing & sizing (CSS px @ 411 wide)

| Item | Value |
|---|---|
| Side padding | 16 |
| Grid gap (cards) | 8 (3-col cards: 121 px image) · 2-col: 8 gap, 189 px image |
| Section vertical gap | 32–40 between home sections; checkout sections separated by an 8 px `--color-section-gap` band |
| Status bar | 27 (Android), text 15 / 400 `--color-ink-2` |
| App header | 40 (icons 24, stroke ~1.75, 40 px touch targets) |
| Top tab bar (GNB) | 47 incl. promo label row; labels spaced ~20 apart; active underline 2 px, text width; 1 px bottom border |
| Friend-picker band | 16 padding, `bg-grey`; card height 125, radius 16; "+" squircle 42, radius 14 |
| Segmented control | 301 × 40 track, pill; active segment pill white with 1 px shadow |
| Icon grid | 5 columns, tile 48 squircle (radius 18), label gap 6, row pitch 80 |
| Audience circles | 4 columns, circle 44 |
| Ranking sub-tab box | height 40, radius 8, 1 px border `#D6E6FA` |
| Price chips | height 30, padding 0 14, pill, gap 8, horizontal scroll |
| Card image radius | 8 |
| Rank badge | 22 × 22, radius 4, top-left inset 8 |
| Tag ("무료배송") | height 20, padding 0 6, radius 3 |
| Bottom nav | 58 tall, icons 24, 5 items |
| Buttons | primary 48 tall, radius 8; secondary (order actions) 36 tall, radius 3; dialog 38 tall, radius 8 |
| Bottom sheet | top radius 16, handle 36 × 4 (radius 2), 10 from top; content padding 16 |
| Dialog | width 280, radius 12, padding 28 24 24, button gap 6 |
| Checkout message card | 343 × 377, radius 16 |
| Theme thumbnails | 51 square, radius 8; selected: 3 px ink border |
| Radio | 22 circle |
| Checkbox | 20 square, radius 3 |
| Thumbnail in lists | 70 (order) / 76 (checkout), radius 8 |
| Hairline | 1 px `--color-line` |
| Shadows | Almost flat. Cards on grey use none; floating "top" button and segment pill use `0 1px 3px rgba(0,0,0,.08)`; bottom sheet `0 -4px 20px rgba(0,0,0,.12)` |

## 5. Components inventory

| Component | Description | Seen in |
|---|---|---|
| `AppHeader` home | back ‹ + shopping-bag icon · centered "선물하기" · search + close ✕ | 164450… |
| `AppHeader` sub | back ‹ + left title (20/700) · search right | 164514 |
| `AppHeader` modal | back ‹ · centered title ("현지 ❤에게") · close ✕ | 164646 |
| `TopTabs` (GNB) | horizontal-scroll bold labels, optional red promo label above, black 2 px underline | 164450… |
| `FriendPicker` | grey band; big white card (+ squircle, "선물할 친구를 선택해 주세요."); narrow birthday-friend card (avatar, pink "생일 친구" pill, name, "어제 생일") | 164450 |
| `FriendSelectedCard` | avatar squircle, "현지 ❤에게 선물하기", 수정 mini-button, hairline, "주고 받은 선물 추억 3", pink outline "생일 알림" pill | 164602 |
| `Segmented` | grey pill track with white active pill (3 options) | home |
| `CategoryGrid` | 5-col squircle image tiles + label | home |
| `RecentStrip` | circular thumbnails, selected with blue ring + pointer | 164507 |
| `SectionHeader` | 20/700 title + grey ⓘ | home |
| `AudienceSelector` | 4 circles (ALL / 여성이 / 남성이 / 청소년이), blue when selected | home |
| `SubTabBox` | light-blue box with 3 text tabs (많이 받은 / 받고 싶은 / 급상승) | home |
| `ChipGroup` | outline pills, active = black fill + white bold | home price chips, detail 다른구성/인기상품 |
| `ProductCard` grid-3 | image 1:1 + rank badge + promo badge, brand ›, 2-line name, %+price, 최대혜택가, gift promo line, 무료배송 tag, cart + ♡ count | 164450 |
| `ProductCard` grid-2 | same, larger text, "단독" badge | 164609 |
| `ProductCard` mini | horizontal-scroll card with 1-line name | 164507, 164618 |
| `CategoryBanner` | full-width colored banner, chip + 2-line white headline + product image, share button | 164609 |
| `UnderlineTabs` | 3 equal tabs on `bg-soft`, active bold + short underline, separators | 164609 |
| `SortRow` | "⇵ MD 추천순  ▽ 가격" right-aligned caption | 164609 |
| `ProductHero` | 1:1 image, badge top-right, "1/2" counter pill | 164618 |
| `InfoBox` | tinted rounded box with icon + text (blue info, peach promo) | 164618 |
| `BottomCTA` detail | ♡ (9만+) · 공유 · black "나에게" · yellow "선물하기" with avatar | 164618 |
| `BottomSheet` | handle, content, sticky buttons (장바구니 outline + yellow CTA) | 164632 |
| `QtyStepper` | bordered box: − · number · + | 164632 |
| `MessageCard` | colored card, big white headline, "T 메시지 편집" button, mic button; theme thumbnail strip below | 164646 |
| `Radio` / `Checkbox` | yellow fill when on (black dot / black check), grey ring/box when off | 164646, 164819 |
| `PayCard` | full-width colored card (yellow pay money, brown KB, blue bank), check circle right | 164646 |
| `SummaryRows` | label/value rows, sub-rows with "ㄴ", final total 24/700 | 164646 |
| `OrderGroup` | white card: "to. 이름", product row, grey info box (order no + 영수증 조회), red status line, 2×2 outline buttons, 무료배송 | 164809 |
| `Accordion` | white row with bold title + chevron, stacked with 8 px bands | 164809 |
| `Dialog` | centered white box, left-aligned message, grey 아니오 + yellow 네 | 164819 |
| `Toast` (heads-up) | white rounded bar with TALK icon, "카카오톡 선물하기" bold + message, slides from top — the only notification UI in the screenshots; used for simulated KakaoTalk messages | 164826 |
| `Toast` (plain) | no screenshot → dark `rgba(0,0,0,.8)` pill, white 14 text, above bottom CTA | — |
| `ScrollTopButton` | 48 white square, radius 6, line border, ↑ | 164450, 164609 |
| `BottomNav` | 홈 · 카테고리 · 럭스 · 위시 · 선물함, red dot badge | 164501 |
| `FooterLinks` | 고객센터 \| 이용약관 \| **개인정보처리방침** \| 지식재산권보호센터 | 164826 |

## 6. Per-screen layout notes (top → bottom)

**164450 Home / 선물 테마** — status bar → header (‹, bag · 선물하기 · search, ✕) → GNB tabs
(FOR ME [키엘 메디립], **홈** underlined, 랭킹, 쨍쨍한특가 [더블할인중!], 보습위크, 와인/위스키 …) →
grey band: friend-picker card + 생일 친구 card → segmented (선물 테마 | 카테고리 | 최근 본) →
5×3 icon grid (생일, 보습위크, 맛있는선물, 건강·비타민, 쨍쨍한특가 / 가벼운선물, 명품선물,
스몰럭셔리, 출산·돌, 결혼·집들이 / 교환권, 직장동료, 합격·응원, 웃긴선물, 신상선물[NEW]) →
"실시간 선물랭킹 ⓘ" → audience circles (ALL 모두가 selected, 여성이, 남성이, 청소년이) →
sub-tab box (많이 받은 | **받고 싶은** | 급상승) → price chips (…1만원대, 2만원대, **3만원대**, 4만원대…)
→ 3-col ranked grid (6 items) → "더보기 ⌄" outline button → floating ↑ button.

**164501 Home / 카테고리** — same top → icon grid (추천선물, 케익·디저트, 비타민·홍삼, 미니가전,
과일·소고기 / 기초·색조, 향수·바디, 패션·주얼리, 리빙·키친, 카페·치킨 / 와인·위스키,
골프·스포츠, 상품권, 육아용품, 팬덤·캐릭터) → ranking section → **bottom nav** (fixed) and an ad
popup (ignored).

**164507 Home / 최근 본** — circular recent thumbnails (first selected, blue ring + pointer) →
"내가 본 **BBQ**와 비슷한 상품" → horizontal mini cards (BBQ "내가 본" badge, 가마치통닭,
꾸브라꼬숯불치킨, 교촌치킨) → ranking section.

**164514 카테고리 page** — sub header (‹ 카테고리 · search) → 2-col list of 56 px squircle +
label (교환권, 상품권·이용권, 뷰티, 패션, 식품, 주류, 리빙, 레저·스포츠, 책·음반티켓,
유아동·반려, 디지털·가전) → grey band: "내 관심 카테고리 ⓘ" + chips with thumbnails →
ad banner "요즘 가장 인기있는 선물은?" (광고 2/8) → "럭셔리 선물, LuX" dark (#222) rounded card
with 4-col icon grid (white labels).

**164602 Home, friend chosen** — friend card becomes: avatar · "현지 ❤에게 선물하기" · 수정 →
hairline → gift-memory thumbnails "주고 받은 선물 추억 3" · 생일 알림 pill. Rest unchanged.
*This is where the To-Be segmented recommendation (SCR-B02) hooks in.*

**164609 Category list (케익·디저트)** — header + GNB → teal banner (chip "케익·디저트",
"달콤한 축하에 / 빠질 수 없는 선물", cake image right, share btn) → underline tabs
(**전체** | 케이크 | 디저트) → sort row → 2-col grid (하겐다즈 32,900원, 고디바 39,900원,
조선호텔델리 39,900원, 하트티라미수 29,000원, 파리바게뜨 36,000원 "배달주문", 오설록 33,900원).

**164618 Product detail** — header → hero 1:1 (단독, 1/2) → brand row (logo circle, 하겐다즈(케이크) ›)
→ name 2 lines → 원산지 line → ★★★★ 25,687건의 선물후기 › → price 32,900원 + 쿠폰받기 →
blue info box "나에게 선물 시 3,290원 더 저렴해요" → hairline → 배송정보 row → peach promo bar →
band → 선물코드 만들기 (+ caption, icon button) → band → 이 브랜드의 추천 상품 + chips +
mini cards → kanana 선물 요약 → **sticky bottom bar** (♡ 9만+, 공유, 나에게, 선물하기).

**164632 Option sheet** — page behind stays visible (white fade, not dark dim) → sheet: handle
→ qty stepper → "총 1개" · "결제금액 32,900원 ⌄" → hairline → ⚠ 제주/도서산간 배송이 불가한
상품입니다. → [🛍 장바구니] [avatar 현지 ❤에게 선물하기].

**164646 Checkout** — header (‹ · 현지 ❤에게 · ✕) → message card (blue theme, "사랑 듬뿍 받고 /
건강하고 행복하길!", "T 메시지 편집", mic) → theme strip (전체 + thumbnails, selected outlined) →
band → 선물 배송지 입력: ◉ 선물 받는 친구가 입력할 거예요 / ○ 내가 친구 대신 입력할 거예요 +
consent caption + link → band → 선물정보 card (brand · 무료배송, thumb + name + price, 수량 1개 box,
결제수단 제한상품 ⓘ) → band → 쇼핑포인트 사용 (input + 전액사용) → band → 결제 수단 (benefit box,
쇼핑포인트 충전결제 promo, 카카오페이 결제 + 빠른결제 toggle, pay cards list, 카드추가/카드관리,
카카오페이 혜택, 기타결제 ⌄) → band → 현금영수증 신청 (grey box, notes, 변경하기) → band →
결제 정보 (총 주문 금액 / ㄴ 상품 금액 / ㄴ 배송비 무료 / 최종 결제금액 32,900원 / 포인트 적립 box)
→ band → agreement line → **sticky "32,900원 결제하기"**.

**164809 Order detail (history)** — header + GNB (no promo labels) → grey page: "주문일 2026.09.28
16:47:11" + 전체취소 → select-all card (☐ 전체선택 · 선택취소) → group card (☐ to. 현지 ❤ ⌃ /
hairline / ☐ / thumb + 하겐다즈(케이크), name, 32,900원, 수량 1개 / grey box: 주문번호 3480603606 +
영수증 조회, hairline, red "결제 완료 (배송지 미입력)", [취소][재전송][💬 상담하기][✏ 문의하기] /
🚚 무료배송) → accordions (결제 정보 ⓘ, 포인트 적립 혜택 0원, 배송상품 취소 및 교환/반품 안내).
Order numbers here are 10 digits; our spec's `YYYYMMDD-NNNNNN` is kept (spec wins for data).

**164819 Cancel dialog** — all three checkboxes turn yellow-checked → dim → dialog
"주문을 취소하시겠습니까? / 선물하신 상품이 포함되어 있다면 선물을 받은 친구에게 선물취소
메시지가 보내집니다. (사전 예약 선물 제외)" → [아니오] [네].

**164826 After cancel** — heads-up notification "카카오톡 선물하기 주문이 취소되었습니다." →
checkboxes, 전체취소 and action buttons disappear → status "결제 취소 예정" (red) → footer links.

## 7. Interaction notes

- **Sticky:** header + GNB tabs stay at the top; bottom nav fixed on home; detail bottom bar and
  checkout pay button fixed at the bottom; floating ↑ button bottom-right above them.
- **Horizontal scroll (no scrollbar):** GNB tabs, price chips, recent thumbnails, mini-card rows,
  interest-category chips, message-theme strip.
- **Segmented control / tabs / chips** swap content in place (no page change).
- **Bottom sheet** opens from the detail CTA (option + quantity) before going to checkout.
- **New page:** product detail, checkout, order detail. **Dialog** for destructive confirm (cancel).
- Heads-up notification appears after the action completes, from the top of the screen.
- Checkboxes/radios fill yellow when on; disabled/unavailable cards go pale grey with grey text
  ("유효하지 않은 카드").

## 8. Images

Product photos, category tiles and banners may be cropped from these screenshots and saved
under `prototype/assets/img/` (CLAUDE.md §2 / PROGRESS decisions). Products without a
cropped image use a same-size tinted box with an emoji.
