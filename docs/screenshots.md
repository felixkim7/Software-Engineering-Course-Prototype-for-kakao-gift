# Screenshots for the "주요 화면 프로토타입" slides

**Setup for every capture:** hub → **데모 데이터 초기화**, then **발표 모드** on (or add `&present=1` to a URL once).
Mobile screens: DevTools device mode **390 × 844** (the phone frame disappears below 480 px) — or capture the
centered phone frame at 1280 px. Seller center: window **1280 × 900**.
URLs are relative to `prototype/` (Live Server root, e.g. `http://127.0.0.1:5500/prototype/`).

| # | Screen | URL | State to set up first | What the slide shows |
|---|---|---|---|---|
| 1 | SCR-00 Demo hub | `index.html` | — | three roles and the use cases they cover |
| 2 | SCR-B01 Choose recipient | `buyer/` | — | friend band with 🎂 D-3 first, search, real home below |
| 3 | SCR-B02 Segmented recommendation | `buyer/?to=u1` | scroll so the chip block is visible | **To-Be ①** chips pre-filled, derived tags only, birthday banner |
| 4 | SCR-B02 Empty result | `buyer/?to=u5&f=1&rel=friend&sit=cheer&age=50s%2B&gen=M` | — | "조건에 맞는 선물이 없어요" + 필터 초기화 |
| 5 | SCR-B02 Other recipients | `buyer/?to=u3` (아빠, 50대+) · `buyer/?to=u4` (동생, 10대) | — | age-fitting results: 정관장·한우 vs 올리브영·쿠로미·피카츄 |
| 6 | SCR-B03 Product detail | `buyer/product.html?id=p07&to=u1&situation=birthday` | — | NEW 금액전환·거절 가능 badge, stepper |
| 7 | SCR-B03 Not convertible | `buyer/product.html?id=p11&to=u1` | — | muted "이 상품은 금액전환이 불가해요" |
| 8 | SCR-B04 Checkout | `buyer/checkout.html?id=p07&to=u1&situation=birthday` | — | themed message card, stepper step 3, payment options |
| 9 | SCR-B04 Payment failure | same URL | hub → **다음 결제 실패** on → tick agreement → pay | error panel (alt 8a), no gift created |
| 10 | SCR-B05 Sent | `buyer/complete.html?gift=…` | complete a checkout (the URL appears after paying) | success + card preview + order no. |
| 11 | SCR-B05 Message failed | same | hub → **다음 선물 메시지 전송 실패** on, then pay | warning + 다시 보내기 (reliability) |
| 12 | SCR-B06 Purchase history | `buyer/history.html` | — (seed has a decline notice) | refund notice, tabs, 거절됨 · 환불 완료 |
| 13 | SCR-R01 Gift inbox | `recipient/?as=u1` | — | bubble + NEW dot, D-30 / D-2 chips, 기한 만료 |
| 14 | SCR-R02 Delivery gift | `recipient/gift.html?gift=g1001` | — | message card, "이 선물, 마음에 들지 않나요? NEW" entry |
| 15 | SCR-R02 Voucher | `recipient/gift.html?gift=g1002` | — | barcode + validity, D-2 |
| 16 | SCR-R02 Blocked entry | `recipient/gift.html?gift=g1005` | — | "금액전환이 불가한 상품이에요" |
| 17 | SCR-R03 Address input | `recipient/receive.html?gift=g1001` | tap **최근 배송지 불러오기** | simplified address form |
| 18 | SCR-R03 Validation | same | tap **입력 완료** on the empty form | inline errors |
| 19 | SCR-R04 Options | `recipient/decline.html?gift=g1002` | select **금액으로 받기** | **To-Be ②** convert vs decline side by side |
| 20 | SCR-R04 Confirm | same | → 다음 | amount + wallet balance before → after |
| 21 | SCR-R04 Failure | same | hub → **다음 환불·금액 전환 실패** on → 확정 | error panel, choice kept (alt 8a) |
| 22 | SCR-R05 Result | `recipient/result.html?gift=…` | finish a convert or decline | "💰 …원을 받았어요" / "선물을 거절했어요" |
| 23 | SCR-S01 Integrated table | `seller/` | — | **To-Be ③** tiles, As-Is → To-Be note, masked columns, 발송 불필요 rows |
| 24 | SCR-S01 Row detail | same | click an order no. | unmasked drawer + "개인정보 열람 기록됨" |
| 25 | SCR-S02 Excel export | same | **엑셀 다운로드** | scope / PII / format options; open the file in Excel for a second shot |
| 26 | SCR-S03 Bulk upload | same | **송장 일괄 업로드** → (turn 발표 모드 off once to get **데모용 작성 예시 받기**) → upload it | preview: 등록 가능 n건 · 오류 3건 |
