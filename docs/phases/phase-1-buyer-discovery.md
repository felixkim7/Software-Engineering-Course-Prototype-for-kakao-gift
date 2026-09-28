# Phase 1 — Buyer: Recipient selection & segmented recommendation

**Use cases:** UC-B1 (select recipient), UC-B2 steps 1–4, alt flows 3a/3b.
**Screens:** SCR-B01, SCR-B02, SCR-B03.
**To-Be improvement showcased:** *Recommendation categories segmented by relationship,
situation and age group* (Usability).

**Read first:** `CLAUDE.md`, `docs/requirements.md` §5 UC-B2, `docs/data-model.md` §1–2,
`docs/design-system.md` §3–4.

## Visual reference

Open before coding: `docs/reference-screens/` → B01__*, B02__*, B03__*, XX__*, and `docs/visual-spec.md`.
SCR-B01/B02 should look like the real gift home: same header, banner, section and product-card styles. The segmented chip block (NEW) and the recipient summary bar don't exist in the real app; build them from the app's own chip/tab and list styles and put them where the real home shows recipient-related content. SCR-B03 should replicate the real product detail page (image, brand row, name, price row, tabs, sticky bottom buttons).
Screenshot = source of truth for visuals; this spec = source of truth for functionality and flow.

## Screens

### SCR-B01 — Home: "누구에게 선물할까요?" (`buyer/index.html`, state A)
- Stepper at step 1 (받는 사람).
- Horizontal list of friend avatars; friends with an upcoming birthday first, with "🎂 D-3" chip.
- Search box to filter friends by name.
- "나에게 선물하기" is **not** needed.
- Secondary link: "받는 사람 없이 둘러보기" → goes to SCR-B02 without a recipient (alt 3b).
- Secondary link: "선물 보낸 내역" → `history.html` (built in Phase 2; show disabled until then).

### SCR-B02 — Recommendations (`buyer/index.html`, state B, or `?to=u1`)
- Stepper at step 2 (선물 고르기).
- **Recipient summary bar:** avatar, name, and **derived tags only** (e.g. "20대 · 여성 · 친구").
  Small info icon → tooltip: "받는 분의 정보는 추천에만 사용되며 구매자에게 공개되지 않아요." (Security req.)
- **Dynamic banner** (UC-B2 step 2): content changes with the recipient's situation,
  e.g. birthday soon → "지우님 생일이 3일 남았어요 🎂 생일 선물 BEST", coworker → "고마운 동료에게 부담 없는 선물".
- **Segmented filter chips** (the core improvement) — four groups, pre-filled from the recipient's derived tags:
  - 관계: 친구 · 연인 · 가족 · 직장동료
  - 상황: 생일 · 감사 · 축하 · 응원 · 쾌유 · 그냥
  - 연령대: 10대 · 20대 · 30대 · 40대 · 50대+
  - 성별: 여성 · 남성 · 전체
  - Mark this block with a "NEW" pill.
- Sections below the chips:
  1. "{name}님에게 딱 맞는 선물" — products scored by `recommend.js`, top 8.
  2. "{연령대} {성별} 인기 선물" — sorted by popularity within the segment (alt 3a).
  3. Category tabs "전체 카테고리" for free browsing (alt 3b).
- Changing any chip re-renders instantly (< 1 s, no fake delay here).
- Result count ("추천 24개") and an empty state with "필터 초기화" if 0 results.
- "받는 사람 변경" returns to SCR-B01.

### SCR-B03 — Product detail (`buyer/product.html?id=p101&to=u1`)
- Large emoji/placeholder thumbnail, brand, name, price, type badge (교환권 / 배송상품).
- Badge "금액전환·거절 가능" (NEW) if `convertible`; if not, a muted note "이 상품은 금액전환이 불가해요".
- Short description, (fake) validity period for vouchers, options preview for delivery items
  (note: "옵션은 받는 분이 선택해요").
- Bottom CTA: "선물하기" → `checkout.html?id=…&to=…` (page created in Phase 2; for now it may be a placeholder).

## Recommendation logic (`core/recommend.js`)

```
score(product, filters) =
    3 * match(relation) + 3 * match(situation) + 2 * match(ageGroup) + 1 * match(gender)
  + popularity / 50
```
- A group with no selection counts as a match.
- Return products sorted by score desc, ties by popularity.
- Pure function, no DOM — easy to explain in the presentation.

## Acceptance criteria

- [ ] Selecting a friend on SCR-B01 opens SCR-B02 with chips pre-filled from that friend's derived tags.
- [ ] Banner text changes depending on the recipient (test at least: birthday-soon friend, coworker, family).
- [ ] Toggling chips re-orders/filters results instantly; count updates; empty state works.
- [ ] Birth date or exact age never appears in the DOM of buyer pages (search the DOM).
- [ ] "받는 사람 없이 둘러보기" shows recommendations without the summary bar and with neutral chips.
- [ ] Product detail shows the correct convertible badge / note.
- [ ] URL params (`?to=`, `?id=`) survive refresh.
- [ ] Works at 390px width and inside the desktop phone frame; no console errors.

## Out of scope

Checkout, payment, history (Phase 2). Wishlist. Text search over products (optional stretch: simple name filter).

## Prompt to paste into Claude Code

> Read CLAUDE.md, docs/PROGRESS.md and docs/phases/phase-1-buyer-discovery.md.
> Phase 0 is complete. Implement Phase 1: plan first, then build SCR-B01 → recommend.js → SCR-B02 → SCR-B03.
> Keep recommend.js a pure function with a short comment explaining the scoring.
> Verify the acceptance criteria and update docs/PROGRESS.md at the end.
