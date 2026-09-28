// SCR-B06 Purchase history — UC-B3 / UC-B2 alt 3c. Order cards follow reference 164809.
// Buyer-facing labels only: a CONVERTED gift reads "전달 완료" and its conversion never shows (UC-R3 postcondition).
import { escapeHtml, formatDate, formatKRW } from "../core/format.js";
import { PAYMENT_METHOD_LABELS, STATUS_LABELS } from "../core/strings.js";
import {
  getCurrentUserId, getGift, getProduct, getUser, listGiftsBy, listNotifications, markNotificationsRead, setCurrentUser, subscribe,
} from "../core/store.js";
import { resendGiftMessage } from "../services/messaging-service.js";
import { AppHeader, EmptyState, StatusBadge, Thumb, UnderlineTabs, initPage, selectOne } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { openSheet, toast, withLoading } from "../ui/overlays.js";

const S = {
  title: "선물 보낸 내역",
  tabs: [{ value: "all", label: "전체" }, { value: "active", label: "진행 중" }, { value: "done", label: "완료" }, { value: "declined", label: "거절/환불" }],
  orderDate: "주문일", orderNo: "주문번호", to: "to.",
  messageFailed: "메시지 미전송",
  empty: "보낸 선물이 없어요", emptyCaption: "친구에게 첫 선물을 보내 보세요.", goGift: "선물하러 가기",
  detail: "주문 상세", recipient: "받는 사람", amount: "결제금액", method: "결제수단", message: "보낸 메시지",
  timeline: "진행 상태", close: "닫기",
  resend: "메시지 다시 보내기", resent: "선물 메시지를 다시 보냈어요.", resendFailed: "이번에도 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
};
const TAB_STATUSES = {
  active: ["SENT", "OPENED", "ADDRESS_SUBMITTED", "SHIPPED"],
  done: ["DELIVERED", "USED", "CONVERTED"],
  declined: ["DECLINED_REFUNDED"],
};

setCurrentUser("u0");
const me = getCurrentUserId();
const unread = listNotifications(me).filter((n) => !n.read); // shown this visit, then marked read
const app = document.querySelector("#app");
let tab = "all";

function render() {
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    ${unread.length ? `<section class="notice-list" aria-label="새 알림">${unread.map((n) => `
      <p class="notice-item">${icon("bell", { size: 18 })}<span>${escapeHtml(n.text)}<small>${formatDate(n.at, { time: true })}</small></span></p>`).join("")}</section>` : ""}
    ${UnderlineTabs({ label: "주문 상태", active: tab, options: S.tabs })}
    <div class="order-list" data-list></div>`;
  renderList();
}

function OrderCard(g) {
  const product = getProduct(g.productId);
  const recipient = getUser(g.recipientId);
  return `<button class="order-card" type="button" data-gift="${g.id}">
    <span class="order-card__head"><span>${S.orderDate} <b>${formatDate(g.createdAt, { time: true })}</b></span>${icon("chevronRight", { size: 18 })}</span>
    <span class="order-card__to"><b>${S.to}</b> ${escapeHtml(recipient?.name ?? "")}</span>
    <span class="order-card__product"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span>
      <span><span class="order-card__brand">${escapeHtml(product.brand)}</span><span class="order-card__name">${escapeHtml(product.name)}</span>
      <b>${formatKRW(g.amount)}</b></span></span>
    <span class="order-card__status"><span>${S.orderNo} ${g.orderNo}</span>
      <span>${g.messageFailed ? `<span class="badge badge--warning">${S.messageFailed}</span> ` : ""}${StatusBadge(g.status, "buyer")}</span></span>
  </button>`;
}

function renderList() {
  const gifts = listGiftsBy({ buyerId: me }).filter((g) => tab === "all" || TAB_STATUSES[tab].includes(g.status));
  app.querySelector("[data-list]").innerHTML = gifts.length
    ? gifts.map(OrderCard).join("")
    : EmptyState({ title: S.empty, caption: S.emptyCaption, actionLabel: S.goGift, actionHref: "index.html" });
}

function openDetail(g) {
  const product = getProduct(g.productId);
  const steps = g.history.filter((h) => h.status !== "CONVERTED"); // the buyer is not told about a conversion
  openSheet({
    label: S.detail,
    content: `<h2 class="sheet__title">${S.detail}</h2>
      <div class="done-product"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span><p><b>${escapeHtml(product.brand)}</b>${escapeHtml(product.name)}</p></div>
      <dl class="info-rows info-rows--sheet">
        <dt>${S.recipient}</dt><dd>${escapeHtml(getUser(g.recipientId)?.name ?? "")}</dd>
        <dt>${S.amount}</dt><dd>${formatKRW(g.amount)}</dd>
        <dt>${S.method}</dt><dd>${PAYMENT_METHOD_LABELS[g.paymentMethod] ?? "-"}</dd>
        <dt>${S.orderNo}</dt><dd>${g.orderNo}</dd>
        <dt>${S.message}</dt><dd class="sheet-message">${escapeHtml(g.message)}</dd>
      </dl>
      <h3 class="timeline__title">${S.timeline}</h3>
      <ol class="timeline">${steps.map((h) => `<li><b>${STATUS_LABELS.buyer[h.status]}</b><time>${formatDate(h.at, { time: true })}</time></li>`).join("")}</ol>
      ${g.messageFailed ? `<button class="btn btn--dark btn--block" type="button" data-action="resend" data-gift="${g.id}">${S.resend}</button>` : ""}
      <button class="btn btn--outline btn--block sheet__close" type="button" data-sheet-close>${S.close}</button>`,
  });
}

document.addEventListener("click", async (e) => {
  const resendBtn = e.target.closest('[data-action="resend"]');
  if (resendBtn) {
    resendBtn.disabled = true;
    const result = await withLoading(resendGiftMessage({ giftId: resendBtn.dataset.gift }));
    if (result.ok) { resendBtn.remove(); toast(S.resent, { variant: "notice" }); }
    else { resendBtn.disabled = false; toast(S.resendFailed); }
    return;
  }
  const card = e.target.closest(".order-card");
  if (card) openDetail(getGift(card.dataset.gift));
  const tabBtn = e.target.closest(".utabs__item");
  if (tabBtn) { selectOne(tabBtn); tab = tabBtn.dataset.value; renderList(); }
});
subscribe(() => renderList()); // e.g. after "다시 보내기" or a change from another tab

render();
markNotificationsRead(me);
initPage();
