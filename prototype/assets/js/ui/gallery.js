// Component gallery for the demo hub (Phase 0 verification). Renders every component once.
// Can be hidden in Phase 6.
import { formatKRW, maskName, maskPhone } from "../core/format.js";
import { STATUS_LABELS } from "../core/strings.js";
import { getProduct, getUser, listGiftsBy, listProducts } from "../core/store.js";
import * as C from "./components.js";
import { mountDataTable } from "./data-table.js";
import { ICON_NAMES, icon } from "./icons.js";
import { confirmModal, openSheet, toast, withLoading } from "./overlays.js";

const THEME_TILES = [
  ["생일", "theme-birthday"], ["보습위크", "theme-moisture"], ["맛있는선물", "theme-tasty"], ["건강·비타민", "theme-health"], ["쨍쨍한특가", "theme-hotdeal"],
  ["가벼운선물", "theme-light"], ["명품선물", "theme-luxury"], ["스몰럭셔리", "theme-small-luxury"], ["출산·돌", "theme-baby"], ["결혼·집들이", "theme-wedding"],
  ["교환권", "theme-voucher"], ["직장동료", "theme-coworker"], ["합격·응원", "theme-cheer"], ["웃긴선물", "theme-funny"], ["신상선물", "theme-new"],
].map(([label, image]) => ({ label, image }));

const PRICE_CHIPS = ["1만원대", "2만원대", "3만원대", "4만원대", "5만원대"].map((label, i) => ({ value: String(i + 1), label }));

const item = (name, body, { wide = false, pad = false } = {}) => `
  <section class="gallery__item ${wide ? "gallery__item--wide" : ""}"><h3 class="gallery__name">${name}</h3>
  <div class="gallery__body ${pad ? "gallery__body--pad" : ""}">${body}</div></section>`;

function sellerRows() {
  return listGiftsBy({ sellerId: "s1" }).map((g) => {
    const d = g.delivery ?? {};
    return {
      orderNo: g.orderNo, product: getProduct(g.productId).name, receiver: d.receiverName ? maskName(d.receiverName) : "—",
      phone: d.phone ? maskPhone(d.phone) : "—", address: d.address1 || "—", status: STATUS_LABELS.seller[g.status], statusKey: g.status, amount: g.amount,
    };
  });
}

export function renderGallery(container) {
  const products = listProducts();
  const ranking = products.slice(0, 6);
  const statuses = Object.keys(STATUS_LABELS.recipient);

  container.innerHTML = `<div class="gallery__grid">
    ${item("AppHeader (home) + TopTabs", C.AppHeader() + C.TopTabs())}
    ${item("AppHeader (sub / modal)", C.AppHeader({ variant: "sub", title: "카테고리" }) + C.AppHeader({ variant: "modal", title: "김지우님에게" }))}
    ${item("SearchBar · SectionHeader", `<div class="page-x">${C.SearchBar()}</div><br>${C.SectionHeader({ title: "실시간 선물랭킹", info: true, moreHref: "#" })}`)}
    ${item("BannerCarousel", C.BannerCarousel([
      { chip: "케익·디저트", title: "달콤한 축하에\n빠질 수 없는 선물", image: "p-haagen-realblanc", color: "var(--color-banner-teal)" },
      { chip: "생일", title: "생일 D-3 친구에게\n딱 맞는 선물", image: "p-mac", color: "var(--color-message-blue)" },
      { chip: "교환권", title: "가볍게 마음 전하는\n커피 한 잔", image: "p-strawberry-cake-set", color: "var(--color-blue)" },
    ]))}
    ${item("Segmented · CategoryGrid", C.Segmented({ label: "홈 탭", active: "theme", options: [{ value: "theme", label: "선물 테마" }, { value: "cat", label: "카테고리" }, { value: "recent", label: "최근 본" }] }) + "<br>" + C.CategoryGrid(THEME_TILES))}
    ${item("ChipGroup · ProductCard grid3 (ranked)", C.ChipGroup({ label: "가격대", chips: PRICE_CHIPS, active: "3" }) + "<br>" + C.ProductGrid(ranking, { variant: "grid3", ranked: true, hrefBase: "buyer/product.html" }))}
    ${item("UnderlineTabs · ProductCard grid2", C.UnderlineTabs({ label: "케익·디저트", active: "all", options: [{ value: "all", label: "전체" }, { value: "cake", label: "케이크" }, { value: "dessert", label: "디저트" }] }) + "<br>" + C.ProductGrid(products.slice(6, 10), { variant: "grid2", hrefBase: "buyer/product.html" }))}
    ${item("ProductCard mini", C.ProductGrid([products[15], products[16], products[17], products[21], products[31]], { variant: "mini", hrefBase: "buyer/product.html" }))}
    ${item("Badges · Tag · Avatars", `<div class="gallery__row">${statuses.map((s) => C.StatusBadge(s)).join("")}</div><br>
      <div class="gallery__row">${C.NewBadge()} ${C.Tag("무료배송")} ${C.PillBadge("생일 친구")}
      ${C.Avatar(null, { size: "s" })}${C.Avatar(null)}${C.Avatar(getUser("u1"), { size: "l" })}</div>`, { pad: true })}
    ${item("Buttons · Checkbox · Radio", `<div class="gallery__row"><button class="btn btn--primary">선물하기</button><button class="btn btn--dark">나에게</button>
      <button class="btn btn--outline">${icon("bag", { size: 20 })}장바구니</button><button class="btn btn--grey">아니오</button><button class="btn btn--small">영수증 조회</button></div><br>
      <div class="gallery__row"><label class="field-row"><input class="checkbox" type="checkbox" checked>전체선택</label><label class="field-row"><input class="checkbox" type="checkbox">선택</label></div><br>
      <div class="gallery__row"><label class="field-row"><input class="radio" type="radio" name="g-r" checked>선물 받는 친구가 입력할 거예요</label><label class="field-row"><input class="radio" type="radio" name="g-r">내가 친구 대신 입력할 거예요</label></div>`, { pad: true })}
    ${item("BottomCTA (detail / single)", C.BottomCTA({ variant: "detail", to: "김지우", wishCount: 95000 }) + "<br>" + C.BottomCTA({ label: `${formatKRW(32900)} 결제하기` }))}
    ${item("Stepper (To-Be) · InfoBox", C.Stepper(["상품 선택", "메시지·결제", "전송 완료"], 1) + `<div class="page-x" style="display:grid;gap:8px">${C.InfoBox("나에게 선물 시 3,290원 더 저렴해요")}${C.InfoBox("오늘의 쨍특딜은 딱 24시간 동안!", { tone: "peach", iconName: "gift" })}</div>`)}
    ${item("OptionCompare (To-Be)", C.OptionCompare([
      { id: "convert", icon: "wallet", title: "금액으로 받기", amount: formatKRW(32900), points: ["페이머니로 바로 들어와요", "보낸 분에게는 알림이 가지 않아요"] },
      { id: "decline", icon: "undo", title: "선물 거절하기", points: ["보낸 분에게 결제 금액이 환불돼요", "보낸 분에게 거절 알림이 전송돼요"] },
    ], "convert"), { pad: true })}
    ${item("GiftMessageCard", C.GiftMessageCard({ message: "사랑 듬뿍 받고\n건강하고 행복하길!", editable: true }), { pad: true })}
    ${item("EmptyState", C.EmptyState({ title: "받은 선물이 없어요", caption: "친구에게 선물을 받으면 여기에 보여요.", actionLabel: "선물하러 가기" }))}
    ${item("BottomNav · ScrollTopButton", `<div class="gallery__phone">${C.ScrollTopButton()}<div style="position:absolute;inset:auto 0 0">${C.BottomNav()}</div></div>`)}
    ${item("Overlays (click)", `<div class="gallery__row">
      <button class="btn btn--outline" data-demo="dialog">Dialog</button><button class="btn btn--outline" data-demo="sheet">BottomSheet</button>
      <button class="btn btn--outline" data-demo="toast">Toast</button><button class="btn btn--outline" data-demo="notice">Toast (notice)</button>
      <button class="btn btn--outline" data-demo="loading">Loading</button></div>`, { pad: true })}
    ${item("Icons", `<div class="gallery__row">${ICON_NAMES.map((n) => `<span title="${n}">${icon(n)}</span>`).join("")}</div>`, { pad: true })}
    ${item("DataTable (seller s1 · sort · filter · select)", '<div data-table></div>', { wide: true })}
  </div>`;

  C.mountBannerCarousel(container.querySelector(".banner"));
  mountDataTable(container.querySelector("[data-table]"), {
    caption: "주문·배송 통합 목록", rowKey: "orderNo", rows: sellerRows(),
    filter: { key: "statusKey", label: "상태", options: Object.entries(STATUS_LABELS.seller).map(([value, label]) => ({ value, label })) },
    columns: [
      { key: "orderNo", label: "주문번호", sortable: true }, { key: "product", label: "상품" }, { key: "receiver", label: "수령인" },
      { key: "phone", label: "연락처" }, { key: "address", label: "주소" }, { key: "status", label: "상태", sortable: true },
      { key: "amount", label: "금액", sortable: true, align: "right", render: (r) => formatKRW(r.amount) },
    ],
  });

  container.addEventListener("click", async (e) => {
    const choice = e.target.closest('[role="tab"], [role="radio"], .chip');
    if (choice) C.selectOne(choice);
    const demo = e.target.closest("[data-demo]")?.dataset.demo;
    if (demo === "dialog") {
      const yes = await confirmModal({ message: "주문을 취소하시겠습니까?\n\n선물하신 상품이 포함되어 있다면 선물을 받은 친구에게 선물취소 메시지가 보내집니다." });
      toast(yes ? "네를 눌렀어요" : "아니오를 눌렀어요");
    }
    if (demo === "sheet") {
      openSheet({ label: "옵션 선택", content: `<p style="padding:16px 0">총 1개 · 결제금액 <b>${formatKRW(32900)}</b></p>
        <div style="display:flex;gap:8px"><button class="btn btn--outline" data-sheet-close>${icon("bag", { size: 20 })}장바구니</button>
        <button class="btn btn--primary btn--grow" data-sheet-close>선물하기</button></div>` });
    }
    if (demo === "toast") toast("위시에 담았어요");
    if (demo === "notice") toast("주문이 취소되었습니다.", { variant: "notice" });
    if (demo === "loading") await withLoading(new Promise((r) => setTimeout(r, 1500)));
  });
}
