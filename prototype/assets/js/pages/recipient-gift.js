// SCR-R02 Gift view — UC-R1, UC-R3 steps 1–2 (entry point). recipient/gift.html?gift=g1001 (&as=u2)
import { daysUntil, escapeHtml, formatDate, maskPhone } from "../core/format.js";
import { CATEGORY_LABELS } from "../core/strings.js";
import { getGift, getProduct, getUser, useRecipientSession } from "../core/store.js";
import { DECIDE_REASON_LABELS, canDecide, transition } from "../core/state-machine.js";
import { AppHeader, Avatar, EmptyState, GiftMessageCard, InfoBox, NewBadge, StatusBadge, Tag, Thumb, initPage } from "../ui/components.js";
import { Barcode, DeadlineChip, DeliveryTimeline, barcodeNumber } from "../ui/recipient.js";
import { confirmModal, openSheet, toast } from "../ui/overlays.js";

const S = {
  title: "받은 선물",
  from: (name) => `<b>${name}</b>님이 보낸 선물`,
  type: { voucher: "교환권", delivery: "배송상품" },
  validity: (date, days) => `유효기간 ${date}까지 (${days}일 남음)`,
  showBarcode: "매장에서 바코드를 보여주세요",
  deliveryInfo: "배송지를 입력하면 판매자가 발송해요.",
  options: (list) => `옵션 ${list} 중 선택`,
  deliveryTitle: "배송 현황", address: "배송지",
  converted: "이 선물은 금액으로 받았어요.", declined: "거절한 선물이에요. 보낸 분에게 환불되었어요.", used: "사용한 교환권이에요.",
  receive: "배송지 입력하고 받기", use: "사용하기",
  useTitle: "교환권 사용", markUsed: "사용 완료로 표시",
  markUsedConfirm: "사용 완료로 표시할까요?\n표시하면 되돌릴 수 없어요.", markUsedDone: "사용 완료로 표시했어요.",
  decide: "이 선물, 마음에 들지 않나요?",
  decideHint: (date) => `${date}까지 금액으로 받거나 거절할 수 있어요`,
  addressDone: "배송지를 입력했어요. 판매자가 곧 발송해요.",
  forbidden: "본인에게 온 선물만 확인할 수 있어요.",
  notFound: "선물을 찾을 수 없어요",
  inbox: "받은 선물함으로",
};
const VOUCHER_DAYS = 93;
const DAY = 24 * 60 * 60 * 1000;

const params = new URLSearchParams(location.search);
const me = useRecipientSession(params.get("as"));
const giftId = params.get("gift");
const app = document.querySelector("#app");

function statusSection(g, product) {
  if (g.status === "CONVERTED") return `<div class="page-x">${InfoBox(S.converted)}</div>`;
  if (g.status === "DECLINED_REFUNDED") return `<div class="page-x">${InfoBox(S.declined)}</div>`;
  if (product.type === "voucher") {
    const until = new Date(new Date(g.createdAt).getTime() + VOUCHER_DAYS * DAY).toISOString();
    return `<section class="co-section voucher ${g.status === "USED" ? "is-used" : ""}">${Barcode(barcodeNumber(g))}
      <p class="voucher__validity">${g.status === "USED" ? S.used : S.validity(formatDate(until), daysUntil(until))}</p></section>`;
  }
  if (g.status === "SENT" || g.status === "OPENED") {
    return `<div class="page-x">${InfoBox(S.deliveryInfo, { iconName: "truck" })}
      ${product.options.length ? `<p class="voucher__validity">${S.options(product.options.map((o) => o.label).join(", "))}</p>` : ""}</div>`;
  }
  const d = g.delivery;
  return `<section class="co-section"><h2 class="co-title">${S.deliveryTitle}</h2>${DeliveryTimeline(g)}
    <dl class="info-rows info-rows--sheet"><dt>${S.address}</dt>
      <dd>${escapeHtml(d.receiverName)} · ${maskPhone(d.phone)}<small>(${escapeHtml(d.zip)}) ${escapeHtml(d.address1)} ${escapeHtml(d.address2)}</small></dd></dl></section>`;
}

/** UC-R3 entry (NEW): offered only while canDecide() is ok; otherwise the reason in muted text. */
function decideEntry(g) {
  const check = canDecide(g, me);
  if (check.ok) {
    return `<div class="decide-entry"><a class="text-btn" href="decline.html?gift=${g.id}">${S.decide}</a>${NewBadge()}
      <p class="decide-entry__hint">${DeadlineChip(g)} ${S.decideHint(formatDate(g.decisionDeadline))}</p></div>`;
  }
  const quiet = ["CONVERTED", "DECLINED_REFUNDED"].includes(g.status); // already decided → nothing to explain
  return quiet ? "" : `<p class="decide-entry decide-entry__reason">${DECIDE_REASON_LABELS[check.reason]}</p>`;
}

function primaryCta(g, product) {
  if (product.type === "delivery" && (g.status === "SENT" || g.status === "OPENED")) {
    return `<div class="bottom-cta"><a class="btn btn--primary btn--block" href="receive.html?gift=${g.id}">${S.receive}</a></div>`;
  }
  if (product.type === "voucher" && g.status === "OPENED") {
    return `<div class="bottom-cta"><button class="btn btn--primary btn--block" type="button" data-action="use">${S.use}</button></div>`;
  }
  return "";
}

function render() {
  const g = getGift(giftId);
  const product = getProduct(g.productId);
  const buyer = getUser(g.buyerId);
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    <section class="gift-from">${Avatar(buyer)}<p>${S.from(escapeHtml(buyer.name))}<small>${formatDate(g.createdAt, { time: true })}</small></p></section>
    <div class="page-x">${GiftMessageCard({ message: g.message, theme: g.cardTheme })}</div>
    <section class="co-section gift-product">
      <span class="gift-info__thumb">${Thumb(product.thumbnail)}</span>
      <div><p class="gift-product__brand">${escapeHtml(product.brand)}</p><h1 class="gift-product__name">${escapeHtml(product.name)}</h1>
        <p class="gift-product__tags">${StatusBadge(g.status, "recipient")}${Tag(S.type[product.type])}${Tag(CATEGORY_LABELS[product.category])}</p></div>
    </section>
    ${statusSection(g, product)}
    ${decideEntry(g)}`;
  document.querySelector(".bottom-cta")?.remove();
  app.insertAdjacentHTML("afterend", primaryCta(g, product));
}

function openVoucher() {
  const g = getGift(giftId);
  const sheet = openSheet({
    label: S.useTitle,
    content: `<h2 class="sheet__title">${S.useTitle}</h2><div class="voucher voucher--big">${Barcode(barcodeNumber(g))}</div>
      <p class="voucher__validity">${S.showBarcode}</p>
      <button class="btn btn--outline btn--block sheet__close" type="button" data-action="mark-used">${S.markUsed}</button>`,
  });
  sheet.el.querySelector('[data-action="mark-used"]').addEventListener("click", async () => {
    sheet.close();
    if (!(await confirmModal({ message: S.markUsedConfirm }))) return;
    transition(giftId, "USED", "매장에서 사용");
    render();
    toast(S.markUsedDone);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest('[data-action="use"]')) openVoucher();
});

const gift = getGift(giftId);
if (!gift) {
  app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>${EmptyState({ title: S.notFound, actionLabel: S.inbox, actionHref: "index.html" })}`;
} else if (gift.recipientId !== me) {
  // Security: only the gift's recipient may see it (no product, message or sender is rendered)
  app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>${EmptyState({ title: S.forbidden, actionLabel: S.inbox, actionHref: "index.html" })}`;
} else {
  if (gift.status === "SENT") transition(gift, "OPENED", "선물 확인"); // first open (UC-R1)
  render();
  if (params.get("done") === "address") {
    toast(S.addressDone, { variant: "notice" });
    params.delete("done");
    history.replaceState(null, "", `?${params}`);
  }
}
initPage();
