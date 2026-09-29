// SCR-R03 Option & address — UC-R2 (To-Be: simplified address input). recipient/receive.html?gift=g1001
import { escapeHtml } from "../core/format.js";
import { getGift, getProduct, getUser, listGiftsBy, updateGift, useRecipientSession } from "../core/store.js";
import { transition } from "../core/state-machine.js";
import { AppHeader, EmptyState, Stepper, Thumb, initPage } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { confirmModal, openSheet } from "../ui/overlays.js";

const S = {
  title: "선물 받기",
  steps: ["옵션 선택", "배송지 입력"],
  optionTitle: "옵션 선택", next: "다음",
  addressTitle: "배송지 입력", recent: "최근 배송지 불러오기",
  name: "받는 분", phone: "연락처", address: "주소", zip: "우편번호", search: "주소 검색", address2: "상세주소", memo: "배송 메모",
  searchTitle: "주소 검색", searchPlaceholder: "도로명, 건물명 검색",
  memoCustom: "직접 입력", memoCustomPlaceholder: "배송 메모를 입력해 주세요",
  submit: "입력 완료",
  errors: {
    option: "옵션을 선택해 주세요.", name: "받는 분 이름을 입력해 주세요.", phone: "연락처를 010-0000-0000 형식으로 입력해 주세요.",
    address: "주소 검색으로 주소를 선택해 주세요.", address2: "상세주소를 입력해 주세요.",
  },
  confirm: (f, optionLabel) => [
    "아래 정보로 선물을 받을게요.", "",
    optionLabel ? `옵션: ${optionLabel}` : null,
    `받는 분: ${f.name} · ${f.phone}`,
    `주소: (${f.zip}) ${f.address1} ${f.address2}`,
    f.memo ? `배송 메모: ${f.memo}` : null, "",
    "배송지를 입력하면 금액으로 받거나 거절할 수 없어요.",
  ].filter((l) => l !== null).join("\n"),
  confirmYes: "받기", confirmNo: "수정",
  unavailable: "배송지를 입력할 수 없는 선물이에요", forbidden: "본인에게 온 선물만 확인할 수 있어요.", back: "선물로 돌아가기",
};
const MEMO_OPTIONS = ["문 앞에 놓아주세요", "경비실에 맡겨주세요", "배송 전에 연락 부탁드려요", S.memoCustom];
const SAMPLE_ADDRESSES = [
  { zip: "04107", address1: "서울특별시 마포구 백범로 35 (신수동, 서강대학교)" },
  { zip: "04066", address1: "서울특별시 마포구 독막로 1 (합정동)" },
  { zip: "06236", address1: "서울특별시 강남구 테헤란로 152 (역삼동)" },
];
const PHONE = /^010-\d{4}-\d{4}$/;

const params = new URLSearchParams(location.search);
const me = useRecipientSession(params.get("as"));
const gift = getGift(params.get("gift"));
const product = gift && getProduct(gift.productId);
const app = document.querySelector("#app");
const hasOptions = product?.options.length > 0;
let step = hasOptions ? 0 : 1;
let optionId = gift?.optionId ?? null;
let submitting = false;

const formatPhone = (value) => value.replace(/\D/g, "").slice(0, 11).replace(/^(\d{3})(\d{1,4})?(\d{1,4})?$/, (_, a, b, c) => [a, b, c].filter(Boolean).join("-"));

const field = (id, label, input) => `<div class="field"><label class="field__label" for="${id}">${label}</label>${input}
  <p class="field-error" id="${id}-error" hidden></p></div>`;

function render() {
  app.innerHTML = `
    <div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>
    ${Stepper(S.steps, step)}
    <div class="page-x done-product"><span class="gift-info__thumb">${Thumb(product.thumbnail)}</span><p><b>${escapeHtml(product.brand)}</b>${escapeHtml(product.name)}</p></div>
    ${step === 0 ? optionStep() : addressStep()}`;
  document.querySelector(".bottom-cta")?.remove();
  app.insertAdjacentHTML("afterend", `<div class="bottom-cta">${step === 0
    ? `<button class="btn btn--primary btn--block" type="button" data-action="next" ${optionId ? "" : "disabled"}>${S.next}</button>`
    : `<button class="btn btn--primary btn--block" type="submit" form="addr-form">${S.submit}</button>`}</div>`);
}

function optionStep() {
  return `<section class="co-section" aria-labelledby="opt-h"><h2 class="co-title" id="opt-h">${S.optionTitle}</h2>
    <div class="option-list" role="radiogroup" aria-labelledby="opt-h">${product.options.map((o) => `
      <label class="option-radio"><input class="radio" type="radio" name="option" value="${o.id}" ${o.id === optionId ? "checked" : ""}>${escapeHtml(o.label)}</label>`).join("")}</div></section>`;
}

function addressStep() {
  return `<form class="co-section addr-form" id="addr-form" novalidate aria-labelledby="addr-h">
    <h2 class="co-title" id="addr-h">${S.addressTitle}</h2>
    <button class="btn btn--outline btn--block recent-btn" type="button" data-action="recent">${icon("undo", { size: 18 })}${S.recent}</button>
    ${field("name", S.name, `<input class="input" id="name" name="name" autocomplete="name">`)}
    ${field("phone", S.phone, `<input class="input" id="phone" name="phone" type="tel" inputmode="numeric" placeholder="010-0000-0000" autocomplete="tel">`)}
    ${field("address1", S.address, `<div class="field__row"><input class="input" id="zip" name="zip" placeholder="${S.zip}" readonly aria-label="${S.zip}">
        <button class="btn btn--small" type="button" data-action="search-address">${S.search}</button></div>
      <input class="input" id="address1" name="address1" placeholder="${S.search}으로 입력돼요" readonly>`)}
    ${field("address2", S.address2, `<input class="input" id="address2" name="address2" autocomplete="address-line2">`)}
    ${field("memo", S.memo, `<select class="input" id="memo" name="memo">${MEMO_OPTIONS.map((m) => `<option>${m}</option>`).join("")}</select>
      <input class="input" id="memo-custom" name="memoCustom" placeholder="${S.memoCustomPlaceholder}" maxlength="50" hidden aria-label="${S.memoCustom}">`)}
  </form>`;
}

const $ = (id) => app.querySelector(`#${id}`);

function readForm() {
  const memo = $("memo").value === S.memoCustom ? $("memo-custom").value.trim() : $("memo").value;
  return { name: $("name").value.trim(), phone: $("phone").value.trim(), zip: $("zip").value, address1: $("address1").value, address2: $("address2").value.trim(), memo };
}

/** Inline validation: marks each invalid field and focuses the first one. Returns true when valid. */
function validate(f) {
  const errors = {
    name: !f.name && S.errors.name,
    phone: !PHONE.test(f.phone) && S.errors.phone,
    address1: !f.address1 && S.errors.address,
    address2: !f.address2 && S.errors.address2,
  };
  Object.entries(errors).forEach(([id, message]) => {
    const input = $(id);
    const error = $(`${id}-error`);
    input.setAttribute("aria-invalid", String(Boolean(message)));
    input.setAttribute("aria-describedby", `${id}-error`);
    error.textContent = message || "";
    error.hidden = !message;
  });
  const first = Object.keys(errors).find((id) => errors[id]);
  if (first) $(first === "address1" ? "zip" : first).focus();
  return !first;
}

function fillRecent() {
  const last = listGiftsBy({ recipientId: me }).find((g) => g.id !== gift.id && g.delivery?.address1)?.delivery;
  const d = last ?? { receiverName: getUser(me).name, phone: "010-1234-5678", ...SAMPLE_ADDRESSES[0], address2: "101호", memo: MEMO_OPTIONS[0] };
  Object.entries({ name: d.receiverName, phone: d.phone, zip: d.zip, address1: d.address1, address2: d.address2 }).forEach(([id, v]) => ($(id).value = v));
  const known = MEMO_OPTIONS.includes(d.memo);
  $("memo").value = known ? d.memo : S.memoCustom;
  $("memo-custom").hidden = known;
  $("memo-custom").value = known ? "" : d.memo;
}

function searchAddress() {
  const list = (q) => SAMPLE_ADDRESSES.filter((a) => a.address1.includes(q)).map((a) => `
    <li><button class="addr-result" type="button" data-zip="${a.zip}" data-address="${a.address1}"><b>${a.zip}</b>${a.address1}</button></li>`).join("");
  const sheet = openSheet({
    label: S.searchTitle,
    content: `<h2 class="sheet__title">${S.searchTitle}</h2>
      <label class="searchbar">${icon("search", { size: 20 })}<span class="visually-hidden">${S.searchTitle}</span><input type="search" data-addr-query placeholder="${S.searchPlaceholder}"></label>
      <ul class="addr-results" data-addr-list>${list("")}</ul>`,
  });
  sheet.el.addEventListener("input", (e) => { sheet.el.querySelector("[data-addr-list]").innerHTML = list(e.target.value.trim()); });
  sheet.el.addEventListener("click", (e) => {
    const pick = e.target.closest(".addr-result");
    if (!pick) return;
    $("zip").value = pick.dataset.zip;
    $("address1").value = pick.dataset.address;
    sheet.close();
    $("address2").focus();
  });
}

async function submit() {
  if (submitting) return;
  const f = readForm();
  if (!validate(f)) return;
  const optionLabel = product.options.find((o) => o.id === optionId)?.label;
  submitting = true;
  const ok = await confirmModal({ message: S.confirm(f, optionLabel), confirmText: S.confirmYes, cancelText: S.confirmNo });
  if (!ok) { submitting = false; return; }
  updateGift(gift.id, { optionId, delivery: { receiverName: f.name, phone: f.phone, zip: f.zip, address1: f.address1, address2: f.address2, memo: f.memo } });
  transition(gift.id, "ADDRESS_SUBMITTED", "배송지 입력 완료");
  location.replace(`gift.html?gift=${gift.id}&done=address`);
}

document.addEventListener("change", (e) => {
  if (e.target.name === "option") {
    optionId = e.target.value;
    document.querySelector('[data-action="next"]').disabled = false;
  }
  if (e.target.id === "memo") $("memo-custom").hidden = e.target.value !== S.memoCustom;
});
document.addEventListener("input", (e) => {
  if (e.target.id === "phone") e.target.value = formatPhone(e.target.value);
});
document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "next" && optionId) { step = 1; render(); $("name").focus(); }
  if (action === "recent") fillRecent();
  if (action === "search-address") searchAddress();
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  submit();
});

const blocked = !gift ? S.unavailable : gift.recipientId !== me ? S.forbidden
  : product.type !== "delivery" || !["SENT", "OPENED"].includes(gift.status) ? S.unavailable : null;
if (blocked) {
  app.innerHTML = `<div class="sticky-top">${AppHeader({ variant: "sub", title: S.title })}</div>${EmptyState({ title: blocked, actionLabel: S.back, actionHref: gift ? `gift.html?gift=${gift.id}` : "index.html" })}`;
} else {
  if (gift.status === "SENT") transition(gift, "OPENED", "선물 확인"); // opened via a direct link
  render();
}
initPage();
