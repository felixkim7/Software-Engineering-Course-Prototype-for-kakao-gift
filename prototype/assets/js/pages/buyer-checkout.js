// SCR-B04 Checkout — UC-B2 steps 5–9, alt 8a (payment failure), reliability (message retry).
// buyer/checkout.html?id=p07&to=u1&situation=birthday · layout follows reference 164646.
import { escapeHtml, formatKRW } from "../core/format.js";
import { BUYER_STEPS, PAYMENT_METHOD_LABELS } from "../core/strings.js";
import { createGift, getCurrentUserId, getProduct, getUser, setCurrentUser, updateGift } from "../core/store.js";
import { pay } from "../services/payment-service.js";
import { sendGiftMessage } from "../services/messaging-service.js";
import {
  AppHeader, Avatar, EmptyState, GiftMessageCard, InfoBox, MESSAGE_THEMES, Stepper, THEME_FOR_SITUATION, Thumb, imgSrc, initPage,
} from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { hideLoading, showLoading, toast } from "../ui/overlays.js";

const S = {
  title: (name) => `${name}에게`,
  themeLabel: "카드 테마",
  messageLabel: "메시지",
  maxLength: 200,
  addressTitle: "선물 배송지 입력",
  addressRecipient: "선물 받는 친구가 입력할 거예요",
  addressSelf: "내가 친구 대신 입력할 거예요",
  addressHelp: "받는 분이 카카오톡에서 옵션과 배송지를 직접 입력해요.",
  giftInfo: "선물정보",
  to: "받는 사람",
  quantity: "수량 1개",
  methodTitle: "결제 수단",
  methodSub: { pay: "등록된 페이머니·카드로 빠르게", card: "신용카드·체크카드 결제", bank: "내 계좌에서 바로 결제" },
  sumTitle: "결제 정보",
  total: "총 주문 금액", itemPrice: "상품 금액", shipping: "배송비", free: "무료", final: "최종 결제금액",
  agree: "주문 내용을 확인했으며 결제에 동의합니다",
  cta: (amount) => `${formatKRW(amount)} 결제하고 선물 보내기`,
  paying: "결제 처리 중…",
  payFailed: "결제가 승인되지 않았어요. 다른 결제수단을 선택하거나 다시 시도해 주세요.",
  missing: "선물 정보가 부족해요",
  missingCaption: "받는 사람과 상품을 다시 선택해 주세요.",
  home: "선물하기 홈으로",
};

setCurrentUser("u0"); // buyer screens always act as the demo buyer
const params = new URLSearchParams(location.search);
const product = getProduct(params.get("id"));
const recipient = getUser(params.get("to"));
const app = document.querySelector("#app");

const form = {
  theme: THEME_FOR_SITUATION[params.get("situation")] ?? "basic",
  message: "",
  edited: false, // once the buyer types, switching themes keeps their text
  method: "pay",
};
form.message = MESSAGE_THEMES[form.theme].text;

const idempotencyKey = `pay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; // one per checkout visit
let paying = false;

function render() {
  const p = product;
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "modal", title: S.title(recipient.name) })}</div>
    ${Stepper(BUYER_STEPS, 2)}
    <section class="co-card" aria-label="메시지 카드">
      <div data-card>${GiftMessageCard({ message: form.message, theme: form.theme, editable: true })}</div>
      <div class="theme-strip" role="radiogroup" aria-label="${S.themeLabel}">${Object.entries(MESSAGE_THEMES).map(([key, t]) => `
        <button class="theme-tile" type="button" role="radio" data-theme="${key}" aria-checked="${key === form.theme}">
          <img src="${imgSrc(t.thumb)}" alt=""><span>${t.label}</span></button>`).join("")}</div>
      <label class="field-label" for="gift-message">${S.messageLabel}</label>
      <textarea class="textarea" id="gift-message" maxlength="${S.maxLength}" rows="3">${escapeHtml(form.message)}</textarea>
      <p class="counter" aria-live="polite"><span data-counter>${form.message.length}</span>/${S.maxLength}</p>
    </section>
    <div class="band"></div>
    ${p.type === "delivery" ? `<section class="co-section" aria-labelledby="addr-h"><h2 class="co-title" id="addr-h">${S.addressTitle}</h2>
      <label class="field-row"><input class="radio" type="radio" name="addr" checked>${S.addressRecipient}</label>
      <label class="field-row is-disabled"><input class="radio" type="radio" name="addr" disabled>${S.addressSelf}</label>
      <p class="co-help">${S.addressHelp}</p></section><div class="band"></div>` : ""}
    <section class="co-section" aria-labelledby="info-h"><h2 class="co-title" id="info-h">${S.giftInfo}</h2>
      <div class="gift-info">
        <p class="gift-info__to"><span>${S.to}</span>${Avatar(recipient, { size: "s" })}<b>${escapeHtml(recipient.name)}</b></p>
        <p class="gift-info__brand"><b>${escapeHtml(p.brand)}</b>${p.freeShipping ? `<span>${icon("truck", { size: 18, strokeWidth: 1.5 })}무료배송</span>` : ""}</p>
        <div class="gift-info__product"><span class="gift-info__thumb">${Thumb(p.thumbnail)}</span>
          <div><p class="gift-info__name">${escapeHtml(p.name)}</p><p class="gift-info__price">${formatKRW(p.price)}</p></div></div>
        <p class="gift-info__qty">${S.quantity}</p>
      </div></section>
    <div class="band"></div>
    <section class="co-section" aria-labelledby="method-h"><h2 class="co-title" id="method-h">${S.methodTitle}</h2>
      <div class="pay-methods" role="radiogroup" aria-labelledby="method-h">${Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => `
        <label class="pay-option"><input class="radio" type="radio" name="method" value="${value}" ${value === form.method ? "checked" : ""}>
          <span><b>${label}</b><small>${S.methodSub[value]}</small></span></label>`).join("")}</div>
      <div data-pay-error></div></section>
    <div class="band"></div>
    <section class="co-section" aria-labelledby="sum-h"><h2 class="co-title" id="sum-h">${S.sumTitle}</h2>
      <dl class="sum-rows">
        <dt><b>${S.total}</b></dt><dd><b>${formatKRW(p.price)}</b></dd>
        <dt class="sub">ㄴ ${S.itemPrice}</dt><dd class="sub">${formatKRW(p.price)}</dd>
        ${p.type === "delivery" ? `<dt class="sub">ㄴ ${S.shipping}</dt><dd class="sub">${S.free}</dd>` : ""}
        <dt class="sum-rows__final">${S.final}</dt><dd class="sum-rows__final">${formatKRW(p.price)}</dd>
      </dl></section>
    <div class="band"></div>
    <section class="co-section co-agree"><label class="field-row"><input class="checkbox" type="checkbox" data-agree>${S.agree}</label></section>`;

  app.insertAdjacentHTML("afterend", `<div class="bottom-cta"><button class="btn btn--primary btn--block" type="button" data-action="pay" disabled>${S.cta(p.price)}</button></div>`);
}

const payButton = () => document.querySelector('[data-action="pay"]');
const agreed = () => app.querySelector("[data-agree]").checked;

function updateCard() {
  app.querySelector("[data-card]").innerHTML = GiftMessageCard({ message: form.message, theme: form.theme, editable: true });
}

/** Steps 7–10: pay → create gift (SENT) → send message → complete. Failure at pay leaves no gift behind. */
async function submit() {
  if (paying || !agreed()) return; // in-flight lock: double clicks do nothing
  paying = true;
  payButton().disabled = true;
  app.querySelector("[data-pay-error]").innerHTML = "";
  showLoading(S.paying);

  const payment = await pay({ amount: product.price, method: form.method, idempotencyKey });
  if (!payment.ok) {
    hideLoading();
    paying = false;
    payButton().disabled = false;
    const errorBox = app.querySelector("[data-pay-error]");
    errorBox.innerHTML = InfoBox(S.payFailed, { tone: "danger", iconName: "alert" });
    errorBox.scrollIntoView({ block: "center", behavior: "smooth" }); // next to the payment methods the buyer may change
    toast(S.payFailed);
    return;
  }

  const gift = createGift({
    buyerId: getCurrentUserId(), recipientId: recipient.id, productId: product.id, amount: product.price,
    message: form.message.trim() || MESSAGE_THEMES[form.theme].text, cardTheme: form.theme,
    paymentMethod: form.method, paymentTxId: payment.txId, messageFailed: false,
  });
  const message = await sendGiftMessage({ giftId: gift.id });
  if (!message.ok) updateGift(gift.id, { messageFailed: true }); // order + payment are kept; B05 offers "다시 보내기"
  hideLoading();
  location.replace(`complete.html?gift=${gift.id}`); // replace: the back button never re-opens a paid checkout
}

document.addEventListener("click", (e) => {
  const tile = e.target.closest(".theme-tile");
  if (tile) {
    form.theme = tile.dataset.theme;
    if (!form.edited) {
      form.message = MESSAGE_THEMES[form.theme].text;
      app.querySelector("#gift-message").value = form.message;
      app.querySelector("[data-counter]").textContent = form.message.length;
    }
    app.querySelectorAll(".theme-tile").forEach((t) => t.setAttribute("aria-checked", String(t === tile)));
    updateCard();
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "edit-message") app.querySelector("#gift-message").focus();
  if (action === "pay") submit();
});
document.addEventListener("input", (e) => {
  if (e.target.id !== "gift-message") return;
  form.message = e.target.value;
  form.edited = true;
  app.querySelector("[data-counter]").textContent = form.message.length;
  app.querySelector("[data-card-text]").textContent = form.message.trim() || MESSAGE_THEMES[form.theme].text; // textContent: never parsed as HTML
});
document.addEventListener("change", (e) => {
  if (e.target.name === "method") form.method = e.target.value;
  if (e.target.matches("[data-agree]")) payButton().disabled = !agreed() || paying;
});

if (product && recipient) render();
else app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "modal", title: "주문/결제" })}</div>${EmptyState({ title: S.missing, caption: S.missingCaption, actionLabel: S.home, actionHref: "index.html" })}`;
initPage();
