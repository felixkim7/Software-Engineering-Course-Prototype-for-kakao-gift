// SCR-R05 Result — UC-R3 step 10 (convert) / end of alt 4a (decline). recipient/result.html?gift=g1001
// Read-only: reloading never re-processes (the decline page guard shows "이미 처리된 선물이에요").
import { escapeHtml, formatDate, formatKRW } from "../core/format.js";
import { getGift, getProduct, getUser, getWallet, useRecipientSession } from "../core/store.js";
import { AppHeader, EmptyState, Stepper, Thumb, initPage } from "../ui/components.js";
import { icon } from "../ui/icons.js";

const S = {
  title: "처리 완료",
  steps: ["방법 선택", "확인", "완료"],
  converted: (amount) => `💰 ${amount}을 받았어요`,
  balance: (amount) => `페이머니 잔액 ${amount}`,
  convertedNote: "기존 선물은 사용이 종료되었어요.",
  declined: "선물을 거절했어요",
  declinedNote: (buyer, amount) => `${buyer}님에게 ${amount} 환불이 완료되었어요.`,
  tx: (txId, at) => `거래번호 ${txId} · ${at}`,
  inbox: "받은 선물함으로",
  none: "처리 결과가 없어요",
};

const params = new URLSearchParams(location.search);
const me = useRecipientSession(params.get("as"));
const gift = getGift(params.get("gift"));
const app = document.querySelector("#app");

function render() {
  const product = getProduct(gift.productId);
  const amount = formatKRW(gift.settlement.amount);
  const isConvert = gift.status === "CONVERTED";
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title, back: false })}</div>
    ${Stepper(S.steps, 2)}
    <section class="result-hero result-hero--${isConvert ? "convert" : "decline"}" role="status">
      <span class="result-hero__icon">${icon(isConvert ? "wallet" : "undo", { size: 34, strokeWidth: 2 })}</span>
      <h1 class="result-hero__title">${isConvert ? S.converted(amount) : S.declined}</h1>
      <p class="result-hero__line">${isConvert ? S.balance(`<b class="text-money">${formatKRW(getWallet(me).balance)}</b>`) : escapeHtml(S.declinedNote(getUser(gift.buyerId).name, amount))}</p>
      ${isConvert ? `<p class="result-hero__line">${S.convertedNote}</p>` : ""}
    </section>
    <div class="page-x done-product result-product"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span>
      <p><b>${escapeHtml(product.brand)}</b>${escapeHtml(product.name)}</p></div>
    <p class="result-tx">${S.tx(gift.settlement.txId, formatDate(gift.settlement.at, { time: true }))}</p>
    <div class="result-actions"><a class="btn btn--primary btn--block" href="index.html">${S.inbox}</a></div>`;
}

const decided = gift && gift.recipientId === me && gift.settlement && ["CONVERTED", "DECLINED_REFUNDED"].includes(gift.status);
if (decided) render();
else app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>${EmptyState({ title: S.none, actionLabel: S.inbox, actionHref: "index.html" })}`;
initPage();
