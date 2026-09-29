# Demo script (~5 minutes)

Live walk-through of the three To-Be improvements across all roles, in one browser tab.
"말할 내용" is what the presenter says (Korean, 1–2 lines). "보여주는 것" names the use case step and the
ISO/IEC 25010 quality characteristic from `requirements.md` §7.

## Before the presentation

1. Open `prototype/index.html` with Live Server, press **Ctrl+Shift+R** once (fresh modules).
2. Hub → **데모 데이터 초기화**.
3. *(For step 11)* 판매자 센터 → **송장 일괄 업로드** → **데모용 작성 예시 받기** — do this now, the link is hidden in 발표 모드.
4. Hub → turn **발표 모드** on (hides the 역할 전환 button and demo helper links; NEW pills stay).
5. Browser window ≈ 1280 × 900 (the phone frame is centered; the seller center fits without zoom).
6. Switching roles during the demo: on any phone screen tap **✕** (top right) → hub → role card.
   In the seller center use **데모 허브** (top right).

## Walk-through

| # | Where / what to click | 말할 내용 | 보여주는 것 |
|---|---|---|---|
| 1 | Hub → **구매자 열기** | "구매자, 수령자, 판매자 세 역할로 재구축한 선물하기를 보여드리겠습니다." | SCR-00 |
| 2 | Tap **김지우** (🎂 D-3 card) | "선물할 친구를 고르면 생일이 다가온 친구가 먼저 보여요." | UC-B1 · Usability (appropriateness recognizability) |
| 3 | Recommendation screen: point at the recipient card and the chips | "지우님의 정보로 관계·상황·연령대·성별 조건이 자동으로 채워져요. 생년월일은 보이지 않고 '20대 · 여성 · 친구' 같은 태그만 보여요." | UC-B2 steps 2–3 · **To-Be ① segmented recommendation** · Security (derived tags only) |
| 4 | Tap 상황 **응원**, then **생일** again (필터 초기화 would clear every chip and the card theme) | "조건을 바꾸면 추천이 바로 바뀌고, 개수도 함께 바뀌어요." | UC-B2 alt 3a · Performance (instant filtering) |
| 5 | Open **하겐다즈 리얼블랑** → **김지우에게 선물하기** | "상품마다 받는 분이 금액으로 받거나 거절할 수 있는지 미리 알려줘요." | UC-B2 step 4 · NEW 금액전환·거절 가능 badge |
| 6 | Checkout: show the 생일 card, tick the agreement, **결제하고 선물 보내기** | "진행 단계가 위에 보이고, 결제 버튼은 동의해야 눌려요. 여러 번 눌러도 한 번만 결제돼요." | UC-B2 steps 5–10 · Usability (stepper) · Reliability (no double payment) |
| 7 | ✕ → hub → **수령자 열기** → inbox shows the new gift with the yellow bubble | "지우님 선물함에 방금 보낸 선물이 도착했어요. 금액전환·거절 기한도 D-day로 보여요." | UC-R1 |
| 8 | Open it → **배송지 입력하고 받기** → **최근 배송지 불러오기** → **입력 완료** → **받기** | "배송지는 최근 주소를 한 번에 불러올 수 있어요. 입력하면 금액전환·거절은 더 이상 할 수 없다고 미리 알려줘요." | UC-R2 · Usability (simplified input, error protection) |
| 9 | Seller: hub → **판매자 센터 열기** → tile **발송 대기** | "판매자는 주문과 받는 분 배송지를 주문번호 기준 한 화면에서 봐요. 연락처와 주소는 가려져 있어요." | UC-S1 alt 4b · **To-Be ③ integrated order+delivery** · Security (masking) |
| 10 | **엑셀 다운로드** → 다운로드; then in the top row (받는 분 김*우) pick **CJ대한통운**, type `681234567890`, **등록** | "주문과 배송지가 한 파일로 내려받아지고, 송장번호를 입력하면 바로 배송 중으로 바뀌어요." | UC-S1 4b, UC-S2 · Usability (operability), Efficiency |
| 11 | *(optional)* **송장 일괄 업로드** → upload the example file prepared before the demo → **n건 등록** | "엑셀로 여러 건을 한 번에 올리고, 잘못된 줄은 미리 걸러줘요." | UC-S2 bulk · User error protection |
| 12 | Recipient: hub → 수령자 → the same gift | "지우님 화면에서도 배송 중과 송장번호가 보여요." | cross-role data consistency |
| 13 | Buyer: hub → 구매자 → 김지우 → **전체 카테고리 · 카페** → **투썸플레이스** → 선물하기 → 결제 | "두 번째로 교환권을 보내볼게요." | UC-B2 |
| 14 | Recipient: open it → **이 선물, 마음에 들지 않나요?** → **선물 거절하기** → 다음 → **선물 거절 확정** | "받는 분이 직접 거절할 수 있어요. 두 선택지의 결과가 나란히 보여서 비교하기 쉬워요." | UC-R3 alt 4a · **To-Be ② decline** · Functional suitability, Usability |
| 15 | Buyer: hub → 구매자 → **선물 보낸 내역** | "보낸 분에게는 거절과 환불 알림이 오고, 상태가 '거절됨 · 환불 완료'로 보여요." | UC-R3 4a postcondition · UC-B3 |
| 16 | Buyer: 김지우 → **전체 카테고리 · 케익·디저트** → **하겐다즈 비스킷앤크림** (6th card) → 결제; Recipient: open it → **금액으로 받기** → 다음 → **금액으로 받기 확정** | "이번엔 금액으로 받아볼게요. 페이머니 잔액이 바로 늘어나요." | UC-R3 main flow · **To-Be ② convert** |
| 17 | Buyer: 선물 보낸 내역 · Seller: 판매자 센터 | "보낸 분에게는 여전히 '전달 완료'로 보여서 알리지 않고, 판매자에게는 '발송 불필요'로 표시돼 잘못 발송하지 않아요." | UC-R3 postconditions · seller stakeholder interest |

## Alternate flows (if time allows, ~1 min)

| Setup (hub 데모 설정) | Then | 말할 내용 | 보여주는 것 |
|---|---|---|---|
| **다음 결제 실패** on | Buyer: pay for any gift | "결제가 실패하면 선물은 만들어지지 않고, 결제수단을 바꿔 다시 시도할 수 있어요." | UC-B2 alt 8a · Reliability |
| **다음 환불·금액 전환 실패** on | Recipient: 금액으로 받기 확정 | "처리 중 오류가 나도 선물은 그대로 남고, 선택 화면으로 돌아와요. 다시 누르면 한 번만 처리돼요." | UC-R3 alt 8a · Reliability (fault tolerance, no double processing) |
| — | Recipient: open **정관장 에브리타임** (from 아빠) or the expired **배스킨라빈스** voucher | "금액전환이 불가한 상품이나 기한이 지난 선물은 이유와 함께 막아줘요." | UC-R3 preconditions |

## Reset between rehearsals

Hub → **데모 데이터 초기화**. The walk-through above runs twice in a row after one reset
(verified automatically: every step, no console errors).
