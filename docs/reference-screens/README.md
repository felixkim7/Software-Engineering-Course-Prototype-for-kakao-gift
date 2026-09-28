# Reference Screens (As-Is KakaoTalk Gift)

Put the screenshots of the **real KakaoTalk Gift (카카오톡 선물하기)** service in this folder.
Claude Code reads these images and reproduces their look and behavior in the prototype.
They are the **single source of truth for visual design**, and they take priority over the
default values in `docs/design-system.md`.

## How to add screenshots

1. Save each screenshot as PNG or JPG in this folder.
2. Name it `<screen-id>__<short-description>.png`, using the screen IDs from
   `docs/requirements.md` §6. Examples:

   | File name | What it shows |
   |---|---|
   | `B01__home-friend-picker.png` | Gift home / choosing a friend |
   | `B02__home-recommend-list.png` | Home with recommendation sections, banners, category tabs |
   | `B02__category-list.png` | Category / ranking list |
   | `B03__product-detail-top.png` | Product detail, top part |
   | `B03__product-detail-bottom.png` | Product detail, bottom part + sticky buttons |
   | `B04__checkout-message-card.png` | Message card selection |
   | `B04__checkout-payment.png` | Payment screen |
   | `B05__send-complete.png` | Gift sent screen |
   | `B06__sent-history.png` | 보낸 선물함 / order history |
   | `R00__chat-gift-bubble.png` | The gift message bubble in a KakaoTalk chat room |
   | `R01__gift-box.png` | 선물함 (received gift list) |
   | `R02__gift-voucher-detail.png` | Received voucher (barcode) detail |
   | `R02__gift-delivery-detail.png` | Received delivery-item detail |
   | `R03__address-input.png` | Option + address input |
   | `S01__seller-order-list.png` | Seller center order management |
   | `S01__seller-delivery-list.png` | Seller center delivery management |
   | `XX__common-tabbar.png` | Anything shared (tab bar, header, popups, toasts) |

   Several screenshots per screen are fine (`B03__product-detail-top.png`,
   `B03__product-detail-bottom.png`, ...). Use `XX__` for shared UI.
3. Optional: add one line per file to the index below with anything the image doesn't
   show (e.g. "the header turns white when scrolling", "tapping the heart opens a toast").

## Screens with no As-Is counterpart (new To-Be features)

These don't exist in the real app. Claude Code must design them **in the same visual
language** (same components, colors, type, spacing, iconography) so they look like a
native part of the app:

- SCR-B02 segmented recommendation chips (relationship / situation / age / gender)
- SCR-R04 decline vs convert-to-cash choice + confirmation
- SCR-R05 decline / convert result
- SCR-S01 integrated order + delivery table, SCR-S02 Excel export, SCR-S03 bulk tracking upload

## Screenshot index (fill in)

| File | Screen ID | Notes (behavior, states not visible in the image) |
|---|---|---|
| | | |
