// SCR-R04 Choose how to handle the gift — UC-R3 steps 3–8, alt 4a (decline), alt 8a (failure).
// recipient/decline.html?gift=g1001 (&as=u2). Step A options → Step B confirm → Step C processing → SCR-R05.
import { dDay, escapeHtml, formatDate, formatKRW } from "../core/format.js";
import { getGift, getProduct, getUser, getWallet, useRecipientSession } from "../core/store.js";
import { DECIDE_REASON_LABELS, canDecide } from "../core/state-machine.js";
import { decideGift } from "../services/decision-service.js";
import { AppHeader, EmptyState, InfoBox, OptionCompare, Stepper, Thumb, bindRadioGroup, initPage } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { hideLoading, showLoading } from "../ui/overlays.js";

const S = {
  title: "선물 처리 방법",
  steps: ["방법 선택", "확인", "완료"],
  heading: "이 선물을 어떻게 할까요?",
  from: (buyer, amount) => `From. ${buyer} · ${amount}`,
  convert: "금액으로 받기", decline: "선물 거절하기",
  convertPoints: (amount) => [`선물 금액 ${amount}이 내 페이머니로 들어와요`, "보낸 분에게 **알리지 않아요**", "기존 선물은 사용할 수 없게 돼요", "되돌릴 수 없어요"],
  declinePoints: (buyer) => [`결제 금액이 ${buyer}님에게 환불돼요`, "보낸 분에게 **거절 사실이 전달돼요**", "기존 선물은 사용할 수 없게 돼요", "되돌릴 수 없어요"],
  deadline: (date, dday) => `처리 기한: ${date}까지 (${dday})`,
  keep: "그냥 받을래요",
  next: "다음", prev: "이전",
  confirmConvert: "금액으로 받기 확정", confirmDecline: "선물 거절 확정",
  destination: "받는 곳", wallet: "페이머니", balance: "페이머니 잔액",
  convertList: ["보낸 분에게는 알리지 않아요", "기존 선물은 사용이 종료돼요", "확정하면 되돌릴 수 없어요"],
  declineLead: (buyer, amount) => `${buyer}님에게 ${amount}이 환불되고, 거절 알림이 전달돼요.`,
  declineList: ["기존 선물은 사용이 종료돼요", "확정하면 되돌릴 수 없어요"],
  processing: { convert: "금액 전환 처리 중…", decline: "환불 요청 중…" },
  failed: "처리 중 문제가 발생했어요. 선물은 그대로 남아 있어요. 다시 선택해 주세요.",
  inProgress: "다른 화면에서 처리 중이에요. 잠시 후 다시 시도해 주세요.",
  forbidden: "본인에게 온 선물만 확인할 수 있어요.",
  notFound: "선물을 찾을 수 없어요",
  back: "선물로 돌아가기", inbox: "받은 선물함으로",
};

const params = new URLSearchParams(location.search);
const me = useRecipientSession(params.get("as"));
const giftId = params.get("gift");
const gift = getGift(giftId);
const product = gift && getProduct(gift.productId);
const buyer = gift && getUser(gift.buyerId);
const app = document.querySelector("#app");

let choice = null; // "convert" | "decline" — kept when going back or after a failure
let busy = false;

function setBottom(html) {
  document.querySelector(".bottom-cta")?.remove();
  app.insertAdjacentHTML("afterend", `<div class="bottom-cta ${html.includes("data-action=\"prev\"") ? "bottom-cta--split" : ""}">${html}</div>`);
}

// UC-R3 step 3: show both options and explain the result of each
function renderChoose(error = "") {
  const amount = formatKRW(gift.amount);
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    ${Stepper(S.steps, 0)}
    <section class="decide-head page-x">
      <div class="done-product"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span><p><b>${escapeHtml(product.brand)}</b>${escapeHtml(product.name)}</p></div>
      <h1 class="decide-head__title" tabindex="-1">${S.heading}</h1>
      <p class="decide-head__sub">${escapeHtml(S.from(buyer.name, amount))}</p>
    </section>
    ${error ? `<div class="page-x decide-error" tabindex="-1">${InfoBox(error, { tone: "danger", iconName: "alert" })}</div>` : ""}
    <div class="page-x">${OptionCompare([
      { id: "convert", icon: "wallet", title: S.convert, amount, points: S.convertPoints(amount) },
      { id: "decline", icon: "undo", title: S.decline, amount, points: S.declinePoints(buyer.name) },
    ], choice)}</div>
    <p class="decide-foot">${S.deadline(formatDate(gift.decisionDeadline), dDay(gift.decisionDeadline))}
      · <a class="text-btn" href="gift.html?gift=${gift.id}">${S.keep}</a></p>`;
  setBottom(`<button class="btn btn--primary btn--block" type="button" data-action="next" ${choice ? "" : "disabled"}>${S.next}</button>`);
  // UC-R3 step 4 / 4a: the recipient picks one option (click, Tab + Enter, or arrow keys)
  bindRadioGroup(app.querySelector(".option-compare"), (value) => {
    choice = value;
    document.querySelector('[data-action="next"]').disabled = false;
  });
}

// UC-R3 step 5 / 4a: show the amount and the consequence, ask for final confirmation
function renderConfirm() {
  const amount = formatKRW(gift.amount);
  const balance = getWallet(me).balance;
  const isConvert = choice === "convert";
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    ${Stepper(S.steps, 1)}
    <section class="decide-confirm decide-confirm--${choice}" aria-labelledby="confirm-h">
      <p class="decide-confirm__kind">${icon(isConvert ? "wallet" : "undo", { size: 20 })}${isConvert ? S.convert : S.decline}</p>
      <h1 class="decide-confirm__amount" id="confirm-h" tabindex="-1">${amount}</h1>
      ${isConvert
        ? `<dl class="info-rows info-rows--sheet decide-confirm__rows"><dt>${S.destination}</dt><dd>${S.wallet}</dd>
            <dt>${S.balance}</dt><dd>${formatKRW(balance)} → <span class="text-money">${formatKRW(balance + gift.amount)}</span></dd></dl>`
        : `<p class="decide-confirm__lead">${escapeHtml(S.declineLead(buyer.name, amount))}</p>`}
      <ul class="decide-confirm__list">${(isConvert ? S.convertList : S.declineList).map((t) => `<li>${t}</li>`).join("")}</ul>
    </section>`;
  setBottom(`<button class="btn btn--outline" type="button" data-action="prev">${S.prev}</button>
    <button class="btn ${isConvert ? "btn--primary" : "btn--danger"}" type="button" data-action="confirm">${isConvert ? S.confirmConvert : S.confirmDecline}</button>`);
  app.querySelector("#confirm-h").focus();
}

// UC-R3 steps 6–8: confirmed → settle once (buttons locked, loading shown) → result or back to step 3
async function confirmChoice() {
  if (busy) return; // repeated clicks never start a second settlement
  busy = true;
  document.querySelectorAll(".bottom-cta .btn").forEach((b) => (b.disabled = true));
  showLoading(S.processing[choice]);
  const result = await decideGift({ giftId, userId: me, choice });
  hideLoading();
  busy = false;
  if (result.ok) {
    location.replace(`result.html?gift=${giftId}`); // UC-R3 step 10 (replace: Back can't re-open this step)
    return;
  }
  if (DECIDE_REASON_LABELS[result.code]) return renderBlocked(result.code); // e.g. processed in another tab meanwhile
  // alt 8a: return to step 3 with both options and the previous choice
  renderChoose(result.code === "IN_PROGRESS" ? S.inProgress : S.failed);
  app.querySelector(".decide-error").focus();
}

function renderBlocked(reason) {
  const title = reason === "NOT_RECIPIENT" ? S.forbidden : DECIDE_REASON_LABELS[reason] ?? S.notFound;
  const canGoBack = gift && reason !== "NOT_RECIPIENT";
  app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    ${EmptyState({ title, actionLabel: canGoBack ? S.back : S.inbox, actionHref: canGoBack ? `gift.html?gift=${gift.id}` : "index.html" })}`;
  document.querySelector(".bottom-cta")?.remove();
}

document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "next" && choice) renderConfirm();
  if (action === "prev") {
    renderChoose();
    app.querySelector('.option-card[aria-checked="true"]')?.focus();
  }
  if (action === "confirm") confirmChoice();
});

// Guard on load (UC-R3 preconditions): only the recipient, not used/addressed, within the deadline, convertible product
const check = gift ? canDecide(gift, me) : { ok: false, reason: "NOT_FOUND" };
if (check.ok) renderChoose();
else renderBlocked(check.reason);
initPage();
