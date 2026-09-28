// SCR-B03 Product detail — UC-B2 step 4. buyer/product.html?id=p07&to=u1&situation=birthday
// Layout follows reference 164618. To-Be: 금액전환·거절 가능 badge (NEW) / muted note when not convertible.
import { escapeHtml, formatKRW } from "../core/format.js";
import { CATEGORY_LABELS } from "../core/strings.js";
import { getProduct, getState, getUser, listProducts } from "../core/store.js";
import {
  AppHeader, BottomCTA, EmptyState, InfoBox, NewBadge, ProductGrid, SectionHeader, Tag, Thumb, UnderlineTabs, initPage, selectOne,
} from "../ui/components.js";
import { FriendCards, sortFriends } from "../ui/friends.js";
import { icon } from "../ui/icons.js";
import { openSheet, toast } from "../ui/overlays.js";

const S = {
  type: { voucher: "교환권", delivery: "배송상품" },
  convertible: "금액전환·거절 가능",
  notConvertible: "이 상품은 금액전환이 불가해요",
  convertibleInfo: "받는 분이 원하지 않으면 금액으로 받거나 거절할 수 있어요.",
  reviews: (n) => `${n.toLocaleString("ko-KR")}건의 선물후기`,
  shipping: "배송정보", shippingValue: "배송비 무료", shippingSub: "제주, 도서산간지역 배송불가",
  validity: "유효기간", validityValue: "구매일로부터 93일",
  usage: "사용처", usageValue: (brand) => `전국 ${brand} 매장 (일부 매장 제외)`,
  options: "옵션", optionNote: "옵션은 받는 분이 선택해요",
  promo: "오늘의 쨍특딜은 딱 24시간 동안!",
  tabs: [{ value: "info", label: "상품정보" }, { value: "reviews", label: "선물후기" }, { value: "refund", label: "교환·환불" }],
  related: "함께 보면 좋은 선물",
  pickTitle: "누구에게 선물할까요?",
  shareDone: "상품 링크를 복사했어요.",
  shareFail: "주소창의 링크를 복사해 주세요.",
  notFound: "상품을 찾을 수 없어요",
  notFoundCaption: "판매가 끝났거나 주소가 잘못되었어요.",
  home: "선물하기 홈으로",
};

const DESCRIPTIONS = {
  cafe: "가볍게 마음을 전하기 좋은 카페 교환권이에요. 받는 분이 가까운 매장에서 바로 사용할 수 있어요.",
  dessert: "특별한 날을 더 달콤하게 만들어 줄 디저트 선물이에요. 선물 포장 상태로 안전하게 전달돼요.",
  beauty: "매일 쓰기 좋은 뷰티 아이템이에요. 선물 포장과 쇼핑백이 함께 제공돼요.",
  flower: "싱그러운 꽃으로 마음을 전해 보세요. 받는 분이 원하는 날짜에 맞춰 배송돼요.",
  fashion: "오래 간직할 수 있는 패션·주얼리 선물이에요. 전용 케이스에 담아 보내드려요.",
  digital: "센스 있는 디지털 선물이에요. 정품 보증서가 함께 제공돼요.",
  health: "소중한 분의 건강을 챙기는 선물이에요. 부모님·동료 선물로 많이 찾으세요.",
  food: "든든하고 맛있는 먹거리 선물이에요. 신선하게 포장해 보내드려요.",
  living: "일상을 기분 좋게 만들어 주는 리빙 선물이에요.",
};
const TYPE_NOTE = {
  voucher: "모바일 교환권으로 전달되며, 매장에서 바코드를 보여주고 사용할 수 있어요.",
  delivery: "받는 분이 배송지를 입력하면 판매자가 상품을 발송해요.",
};
const REVIEWS = [
  ["김*우", "선물 받은 친구가 정말 좋아했어요!"],
  ["이*연", "포장이 예뻐서 선물용으로 딱이에요."],
  ["정*진", "받는 사람이 고를 수 있어서 부담이 없었어요."],
];
const REFUND_POLICY = [
  "받는 분은 선물을 받은 뒤 30일 안에, 배송지 입력·사용 전이라면 금액으로 받거나 거절할 수 있어요. 거절하면 보낸 분에게 전액 환불돼요.",
  "교환권은 유효기간 안에 사용하지 않으면 구매 금액의 90%가 보낸 분에게 환불돼요.",
  "배송상품은 발송 후 단순 변심에 의한 교환·반품 시 왕복 배송비가 발생할 수 있어요.",
];

// ---------- state ----------
const params = new URLSearchParams(location.search);
const product = getProduct(params.get("id"));
const recipient = params.get("to") ? getUser(params.get("to")) : null;
const situation = params.get("situation");
const app = document.querySelector("#app");

const checkoutUrl = (toId) => `checkout.html?id=${product.id}&to=${toId}${situation ? `&situation=${situation}` : ""}`;
const linkQuery = [recipient && `to=${recipient.id}`, !recipient && "browse=1", situation && `situation=${situation}`].filter(Boolean).join("&");

function infoRows(p) {
  const rows = p.type === "delivery"
    ? [[S.shipping, S.shippingValue, S.shippingSub]]
    : [[S.validity, S.validityValue, ""], [S.usage, S.usageValue(p.brand), ""]];
  if (p.options.length) rows.push([S.options, p.options.map((o) => o.label).join(", "), S.optionNote]);
  return `<dl class="info-rows">${rows.map(([dt, dd, sub]) => `<dt>${dt}</dt><dd>${escapeHtml(dd)}${sub ? `<small>${sub}</small>` : ""}</dd>`).join("")}</dl>`;
}

function tabPanel(tab) {
  if (tab === "reviews") {
    return `<ul class="reviews">${REVIEWS.map(([name, text]) => `<li><b>${name} · ★★★★★</b>${text}</li>`).join("")}</ul>`;
  }
  if (tab === "refund") return REFUND_POLICY.map((t) => `<p>${t}</p>`).join("");
  return `<p>${DESCRIPTIONS[product.category]}</p><p>${TYPE_NOTE[product.type]}</p>`;
}

function render() {
  const p = product;
  const origin = p.discountRate ? Math.round(p.price / (1 - p.discountRate / 100) / 100) * 100 : 0;
  const related = listProducts().filter((x) => x.id !== p.id && (x.category === p.category || x.sellerId === p.sellerId))
    .sort((a, b) => b.popularity - a.popularity).slice(0, 6);
  document.title = `${p.name} · 카카오톡 선물하기`;

  app.innerHTML = `
    <div class="sticky-top">${AppHeader()}</div>
    <div class="detail-hero">${Thumb(p.thumbnail, p.name)}${p.badge ? `<span class="promo-badge promo-badge--${p.badge === "단독" ? "exclusive" : "hot"}">${p.badge}</span>` : ""}
      <span class="banner__counter" aria-hidden="true">1/1</span></div>
    <section class="detail-body">
      <a class="detail-brand" href="index.html?${recipient ? `to=${recipient.id}` : "browse=1"}&cat=${p.category}#all-categories"><span class="brand-logo">${Thumb(p.thumbnail)}</span>${escapeHtml(p.brand)}${icon("chevronRight", { size: 18 })}</a>
      <h1 class="detail-name">${escapeHtml(p.name)}</h1>
      <div class="detail-badges">${Tag(S.type[p.type])}${Tag(CATEGORY_LABELS[p.category])}
        ${p.convertible ? `<span class="badge badge--money">${S.convertible}</span>${NewBadge()}` : `<span class="detail-note">${S.notConvertible}</span>`}</div>
      <p class="detail-rating"><span class="stars" aria-hidden="true">★★★★★</span>${S.reviews(Math.round(p.wishCount * 0.27))}${icon("chevronRight", { size: 14 })}</p>
      <p class="detail-price">${p.discountRate ? `<span class="detail-price__rate">${p.discountRate}%</span>` : ""}${formatKRW(p.price)}
        ${origin ? `<span class="detail-price__origin">${formatKRW(origin)}</span>` : ""}</p>
    </section>
    ${p.convertible ? `<div class="detail-body detail-body--promo">${InfoBox(S.convertibleInfo)}</div>` : ""}
    ${infoRows(p)}
    ${p.badge === "쨍특" ? `<div class="detail-body detail-body--promo">${InfoBox(S.promo, { tone: "peach", iconName: "gift" })}</div>` : ""}
    <div class="band"></div>
    ${UnderlineTabs({ label: "상품 상세", active: "info", options: S.tabs })}
    <div class="tab-panel" role="tabpanel" data-panel>${tabPanel("info")}</div>
    <div class="band"></div>
    <section class="detail-related">${SectionHeader({ title: S.related })}${ProductGrid(related, { variant: "mini", query: linkQuery })}</section>`;

  app.insertAdjacentHTML("afterend", BottomCTA({ variant: "detail", to: recipient?.name ?? "", wishCount: p.wishCount, showSelf: false }));
}

function pickRecipient() {
  openSheet({
    label: S.pickTitle,
    content: `<h2 class="sheet__title">${S.pickTitle}</h2>${FriendCards(sortFriends(getState().users), (u) => checkoutUrl(u.id))}`,
  });
}

document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "primary") recipient ? (location.href = checkoutUrl(recipient.id)) : pickRecipient();
  if (action === "share") navigator.clipboard?.writeText(location.href).then(() => toast(S.shareDone), () => toast(S.shareFail));
  const tab = e.target.closest(".utabs__item");
  if (tab) {
    selectOne(tab);
    app.querySelector("[data-panel]").innerHTML = tabPanel(tab.dataset.value);
  }
});

if (product) render();
else app.innerHTML = `<div class="sticky-top">${AppHeader()}</div>${EmptyState({ title: S.notFound, caption: S.notFoundCaption, actionLabel: S.home, actionHref: "index.html" })}`;
initPage();
