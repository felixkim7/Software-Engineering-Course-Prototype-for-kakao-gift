// SCR-B05 Sent — UC-B2 steps 9–10 + reliability (message retry). buyer/complete.html?gift=g3016
import { escapeHtml, formatDate, formatKRW, givenName } from "../core/format.js";
import { BUYER_STEPS, PAYMENT_METHOD_LABELS } from "../core/strings.js";
import { getGift, getProduct, getUser, setCurrentUser } from "../core/store.js";
import { resendGiftMessage } from "../services/messaging-service.js";
import { AppHeader, EmptyState, GiftMessageCard, InfoBox, Stepper, Thumb, initPage } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { toast, withLoading } from "../ui/overlays.js";

const S = {
  title: "선물 보내기 완료",
  done: (name) => `${name}님에게\n선물을 보냈어요!`,
  caption: "받는 분이 선물을 확인하면 보낸 선물 내역에서 알려드릴게요.",
  preview: "받는 분에게 이렇게 보여요",
  orderNo: "주문번호", amount: "결제금액", method: "결제수단", date: "주문일시",
  failed: "선물 메시지를 보내지 못했어요. 결제와 주문은 안전하게 저장되었어요.",
  resend: "다시 보내기", resending: "선물 메시지를 보내는 중…",
  resent: "선물 메시지를 다시 보냈어요.", resendFailed: "이번에도 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
  history: "보낸 선물 내역 보기", home: "홈으로",
  demoLink: "수령자 화면으로 보기 →",
  notFound: "주문 정보를 찾을 수 없어요",
};

setCurrentUser("u0");
const gift = getGift(new URLSearchParams(location.search).get("gift"));
const app = document.querySelector("#app");

const messageStatus = (g) => (g.messageFailed
  ? `<div class="page-x done-warning">${InfoBox(S.failed, { tone: "warning", iconName: "alert" })}
      <button class="btn btn--dark btn--block" type="button" data-action="resend">${S.resend}</button></div>`
  : "");

function render() {
  const product = getProduct(gift.productId);
  const recipient = getUser(gift.recipientId);
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "modal", title: S.title, back: false })}</div>
    ${Stepper(BUYER_STEPS, 3)}
    <section class="done-hero">
      <span class="done-hero__icon">${icon("check", { size: 36, strokeWidth: 2.5 })}</span>
      <h1 class="done-hero__title">${escapeHtml(S.done(givenName(recipient.name)))}</h1>
      <p class="done-hero__caption">${S.caption}</p>
    </section>
    <div data-message-status>${messageStatus(gift)}</div>
    <section class="co-section" aria-labelledby="preview-h"><h2 class="co-title" id="preview-h">${S.preview}</h2>
      ${GiftMessageCard({ message: gift.message, theme: gift.cardTheme })}
      <div class="done-product"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span>
        <p><b>${escapeHtml(product.brand)}</b>${escapeHtml(product.name)}</p></div>
    </section>
    <dl class="info-rows">
      <dt>${S.orderNo}</dt><dd>${gift.orderNo}</dd>
      <dt>${S.amount}</dt><dd>${formatKRW(gift.amount)}</dd>
      <dt>${S.method}</dt><dd>${PAYMENT_METHOD_LABELS[gift.paymentMethod]}</dd>
      <dt>${S.date}</dt><dd>${formatDate(gift.createdAt, { time: true })}</dd>
    </dl>
    <div class="done-actions"><a class="btn btn--outline" href="history.html">${S.history}</a><a class="btn btn--primary" href="index.html">${S.home}</a></div>
    <p class="demo-link demo-helper"><a href="../recipient/gift.html?gift=${gift.id}&as=${gift.recipientId}">${S.demoLink}</a></p>`;
}

async function resend(button) {
  button.disabled = true;
  const result = await withLoading(resendGiftMessage({ giftId: gift.id }), S.resending);
  if (result.ok) {
    app.querySelector("[data-message-status]").innerHTML = "";
    toast(S.resent, { variant: "notice" });
  } else {
    button.disabled = false;
    toast(S.resendFailed);
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="resend"]');
  if (btn) resend(btn);
});

if (gift) render();
else app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "modal", title: S.title })}</div>${EmptyState({ title: S.notFound, actionLabel: S.home, actionHref: "index.html" })}`;
initPage();
