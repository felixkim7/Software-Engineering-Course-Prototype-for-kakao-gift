# Design System

## 0. Visual fidelity rule (read first)

The prototype must **look and behave like the real KakaoTalk Gift (카카오톡 선물하기) app**,
as shown in the screenshots in `docs/reference-screens/`. The goal is that the audience
immediately recognizes the real service, and the To-Be features look like they belong in it.

Priority order when deciding how something looks:
1. **Reference screenshots** (`docs/reference-screens/*.png|jpg`): copy layout, spacing,
   colors, typography, icon style, component shapes, copy tone, and interaction patterns
   as closely as possible.
2. **`docs/visual-spec.md`**: the measured values extracted from the screenshots (created in Phase 0; see §1).
3. **This file's defaults** (§3 onward): use only for things the screenshots don't show.

Rules:
- **Match, don't reinterpret.** Don't "improve" or modernize the real design. If the
  screenshot has a thin grey divider, a 13px grey caption, and a pill button, build exactly that.
- Reproduce layout structure faithfully: header style, section order, list and card
  structure, tab bars, sticky bottom buttons, bottom sheets, badges, price formatting,
  ranking numbers, the heart / wish icon, and so on.
- Match **text content style** too: the same kinds of section titles, button labels, and
  helper text as in the screenshots (Korean). Product names, brands and prices in seed data
  should look like the ones in the screenshots (realistic Korean product naming).
- **New To-Be screens** (no screenshot): build from the same components and tokens so they
  look native. Don't invent a new visual style for them.
- **Images:** the product images, banners, icons, the Kakao logo and Kakao Friends
  characters in the screenshots are cut out and reused as image files
  (`tools/crop-screens.py` → `prototype/assets/img/`). The header title stays bold text
  "선물하기", exactly as in the screenshots.
- The demo hub (`index.html`) keeps a visible "CSE4115 prototype" label. It is the only page
  that isn't styled as the real app.

## 1. Extracting the visual spec (Phase 0, before any CSS)

Claude Code must open **every** image in `docs/reference-screens/` and write
`docs/visual-spec.md` containing:

1. **Color palette:** every distinct color with an estimated hex value and where it's used
   (background, section background, primary text, secondary text, captions, dividers,
   price / discount red, the yellow accent, badge colors, button fills and borders, links).
2. **Typography:** estimated font sizes and weights for each text role (screen title,
   section title, product brand, product name, price, discount rate, caption, button label,
   tab label). Note line clamping (e.g. product names cut after 2 lines with an ellipsis).
3. **Spacing & sizing:** side padding, gaps between sections, card and thumbnail sizes and
   aspect ratios, grid columns, list row heights, header height, bottom button height,
   tab bar height, corner radii, divider thickness, shadows (if any).
4. **Components inventory:** each recurring UI element (header variants, search bar, banner
   carousel, category icon grid, product card (grid and list variants), ranking item, chips
   and tabs, sticky bottom CTA, bottom sheet, toast, popup dialog, badges, gift message card,
   barcode block, form fields), with a short description and the screenshot it appears in.
5. **Per-screen layout notes:** for each screenshot, the top-to-bottom structure as a list
   (e.g. "header (back, title centered, share icon) → 1:1 product image → brand row with
   arrow → product name 2 lines → price row: discount % red + price bold + original price
   struck grey → divider 8px grey → tabs 상품정보/리뷰/교환·환불 ...").
6. **Interaction notes:** what is sticky, what scrolls horizontally, what opens as a bottom
   sheet vs a new page, and tab or segment behavior.

Then set `assets/css/tokens.css` from `visual-spec.md` (replacing the defaults in §3), and
build the components in §5 to match the inventory.

Pixel values from a phone screenshot must be converted to CSS px: divide by the device
pixel ratio (usually the screenshot width ÷ 390 for a modern iPhone, or ÷ 360–412 for
Android). State the ratio you used in `visual-spec.md`.

If `docs/reference-screens/` is empty, stop and ask the user to add screenshots before
writing CSS.

## 2. Verifying fidelity (every UI phase)

For each screen you build that has a reference screenshot:
- Before coding it, re-open the matching screenshot(s) and list the elements you will build, top to bottom.
- After coding it, compare it against the screenshot element by element (order, sizes,
  colors, spacing, text styles, alignment). Ask the user for a screenshot of the rendered
  page at 390px width if you can't capture one yourself. Fix differences before moving on.
- Record any deliberate deviations (and why) in `docs/PROGRESS.md` under "Decisions".

## 3. Default tokens (fallback only; replaced by values from visual-spec.md)

```css
:root {
  /* Color */
  --color-accent: #FEE500;        /* yellow accent / primary CTA */
  --color-accent-ink: #191919;    /* text on accent */
  --color-ink: #191919;           /* primary text */
  --color-ink-2: #555555;         /* secondary text */
  --color-ink-3: #999999;         /* captions / placeholders */
  --color-line: #EEEEEE;          /* hairline dividers */
  --color-section-gap: #F5F5F5;   /* thick section divider band */
  --color-surface: #FFFFFF;
  --color-bg: #FFFFFF;
  --color-sale: #FF4D4D;          /* discount % */
  --color-positive: #1E9E62;
  --color-info: #2F6FEB;
  --color-warning: #E08A00;
  --color-danger: #E03E3E;
  --color-money: #6B4EFF;         /* convert-to-cash emphasis (To-Be only; adjust to fit the palette) */

  /* Type */
  --font-sans: "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  --fs-11: 11px; --fs-12: 12px; --fs-13: 13px; --fs-14: 14px; --fs-15: 15px;
  --fs-16: 16px; --fs-18: 18px; --fs-20: 20px; --fs-24: 24px;
  --fw-regular: 400; --fw-medium: 500; --fw-bold: 700;
  --lh-tight: 1.3; --lh-body: 1.45;

  /* Space (4px scale) */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 20px; --sp-6: 24px; --sp-8: 32px;

  /* Shape & depth */
  --radius-s: 6px; --radius-m: 10px; --radius-l: 14px; --radius-pill: 999px;
  --shadow-1: none;
  --shadow-sheet: 0 -4px 20px rgba(0,0,0,.12);

  /* Layout */
  --phone-width: 390px; --phone-height: 844px;
  --header-h: 52px; --bottom-cta-h: 64px; --tabbar-h: 56px;
}
```

## 4. Layouts

- **Mobile (buyer / recipient):** content inside a centered "phone frame" (`.phone`,
  390×844) on a grey desktop background; at viewport ≤ 480px the frame disappears. Inside
  the frame, replicate the app chrome from the screenshots: header style, tab bar (if
  shown), sticky bottom buttons, and scroll behavior. Include a fake iOS status bar only if
  the screenshots show one.
- **Recipient entry:** if a chat-bubble screenshot (`R00__…`) exists, add a simple fake
  KakaoTalk chat room screen (`recipient/chat.html`) showing the gift bubble, as the
  demo's entry point to the received gift.
- **Desktop (seller center):** match the seller-center screenshots (`S01__…`) if provided.
  Otherwise use a plain admin layout: left sidebar menu, top bar, white content area, dense table.
- **Demo hub:** simple centered page with three role cards and a "Demo controls" panel.

## 5. Components (`assets/js/ui/components.js` + `components.css`)

Build these to match the components inventory in `visual-spec.md`. The list below is the
minimum; add any recurring component you find in the screenshots.

| Component | Notes |
|---|---|
| `AppHeader` | Variants as in the screenshots (home header with wordmark/search/icons; sub-page header with back arrow + title). |
| `SearchBar` | As in the screenshot. |
| `BannerCarousel` | Horizontal swipe/scroll with page indicator ("1/5" or dots, whichever the screenshot uses). |
| `CategoryGrid` | Icon + label grid (icons recreated as SVG/emoji). |
| `ProductCard` | Grid and list variants: image placeholder, brand, name (line-clamped), discount %, price, optional rank number, wish icon. |
| `SectionHeader` | Section title + "더보기"-style link, as in the screenshots. |
| `Tabs` / `ChipGroup` | Match the screenshot's tab and chip style (underline tabs vs pill chips). `aria-selected` / `aria-pressed`. |
| `BottomCTA` | Sticky bottom bar; match the button layout in the product-detail screenshot (e.g. wish icon + "선물하기" / "나에게 선물하기"). |
| `Stepper` | To-Be addition (usability requirement: show progress). Keep it subtle, in the app's style. |
| `Badge` | Status and NEW badges. |
| `Modal` / `Dialog` | Match the app's popup style. Promise-based `confirmModal()`. |
| `BottomSheet` | Match the app's bottom sheet (handle bar, radius, title). |
| `Toast` | Match the app's toast; `aria-live="polite"`. |
| `LoadingOverlay` | Spinner while mock services "process"; blocks double clicks. |
| `EmptyState` | As in the app. |
| `GiftMessageCard` | The card-theme message card as shown in the checkout / received-gift screenshots. |
| `OptionCompare` | To-Be: convert vs decline cards, built from existing card/button styles. |
| `DataTable` | Seller table: sticky header, sortable columns, row checkbox, status filter. |

## 6. Interaction & copy principles

- Copy the app's copy tone and button wording from the screenshots. For new To-Be screens, use the same tone.
- Every irreversible action (pay, convert, decline) gets a confirmation step that restates
  the consequence, styled like the app's own confirmation popups.
- Show system progress with the app-style loading indicator.
- Mark To-Be improvements with a small **"NEW"** pill (styled to fit the palette) so the
  audience can spot them during the presentation; it can be toggled off from the demo hub.
