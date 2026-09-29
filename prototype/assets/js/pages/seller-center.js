// SCR-S01 주문·배송 통합 관리 — UC-S1 (alt 4b: orders + delivery info in one table/file keyed by 주문번호), UC-S2 (ship + tracking).
// Seller = s1 (하겐다즈 공식스토어). Export → SCR-S02, bulk upload → SCR-S03 (ui/seller-dialogs.js). ?dev=1 shows the 200-order button.
import { daysUntil, escapeHtml, formatDate, formatKRW, maskAddress, maskName, maskPhone } from "../core/format.js";
import { COURIERS, STATUS_LABELS } from "../core/strings.js";
import { generateOrders } from "../core/seed-data.js";
import { getGift, getProduct, getSeller, importGifts, listGiftsBy, logAccess, subscribe } from "../core/store.js";
import { advanceDelivery, registerTracking, validateTracking } from "../services/delivery-service.js";
import { loadXlsx } from "../services/export-service.js";
import { NewBadge, initPage } from "../ui/components.js";
import { mountDataTable } from "../ui/data-table.js";
import { icon } from "../ui/icons.js";
import { openDrawer, toast } from "../ui/overlays.js";
import { openBulkUploadDialog, openExportDialog } from "../ui/seller-dialogs.js";

const SELLER_ID = "s1";
const S = {
  title: "주문·배송 통합 관리",
  asIs: "기존: 주문관리·배송관리 메뉴에서 주문번호로 따로 대조",
  toBe: "개선: 한 화면·한 파일에서 주문과 배송지를 함께 확인",
  search: "주문번호, 상품명, 받는 분 검색",
  export: "엑셀 다운로드", upload: "송장 일괄 업로드",
  courierPick: "택배사 선택", trackingPlaceholder: "송장번호", register: "등록", registering: "등록 중…",
  registered: (no) => `${no} 송장을 등록했어요 · 배송 중`, deliver: "배송 완료 처리", delivered: (no) => `${no} 배송 완료로 바꿨어요`,
  noShip: "발송 불필요",
  drawer: "주문 상세", orderInfo: "주문 정보", receiverInfo: "받는 분 정보", shipping: "배송", history: "상태 이력",
  noAddress: "받는 분이 아직 옵션·배송지를 입력하지 않았어요.",
  noShipReason: "받는 분이 금액 전환·거절을 선택해 발송할 필요가 없어요.",
  piiNote: (at, seller) => `개인정보 열람 기록됨 · ${at} · ${seller}`,
  dev: "개발용: 주문 200건 생성", devDone: "테스트 주문 200건을 추가했어요.",
  empty: "조건에 맞는 주문이 없어요.",
};
const GROUPS = {
  all: { label: "전체", statuses: null },
  waiting: { label: "배송지 입력 대기", statuses: ["SENT", "OPENED"] },
  ready: { label: "발송 대기", statuses: ["ADDRESS_SUBMITTED"] },
  shipping: { label: "배송 중", statuses: ["SHIPPED"] },
  delivered: { label: "배송 완료", statuses: ["DELIVERED"] },
  noship: { label: "발송 불필요", statuses: ["CONVERTED", "DECLINED_REFUNDED"] },
};
const TILES = ["ready", "shipping", "delivered", "noship"];
const PERIODS = [["all", "전체"], ["today", "오늘"], ["7", "7일"], ["30", "30일"]];
const TONE = { SENT: "grey", OPENED: "grey", ADDRESS_SUBMITTED: "warning", SHIPPED: "blue", DELIVERED: "positive", CONVERTED: "grey", DECLINED_REFUNDED: "grey" };

const app = document.querySelector("#app");
const view = { group: "all", period: "all", query: "" };
const drafts = new Map(); // giftId → { courier, trackingNo } typed before 등록 (kept across table re-renders)
let allRows = [];
let table;

function toRow(g) {
  const p = getProduct(g.productId);
  const d = g.delivery ?? {};
  return {
    id: g.id, orderNo: g.orderNo, createdAt: g.createdAt, orderedAt: formatDate(g.createdAt, { time: true }),
    product: p.name, option: p.options.find((o) => o.id === g.optionId)?.label ?? "", qty: g.quantity, amount: g.amount,
    receiver: d.receiverName ?? "", phone: d.phone ?? "", address1: d.address1 ?? "",
    address: [d.zip && `(${d.zip})`, d.address1, d.address2].filter(Boolean).join(" "), memo: d.memo ?? "",
    status: g.status, statusLabel: STATUS_LABELS.seller[g.status], courier: d.courier ?? "", trackingNo: d.trackingNo ?? "",
  };
}

/** Cells in the same order as EXPORT_HEADERS (ui/seller-dialogs.js); personal data masked unless `full` (acknowledged in the export dialog). */
const toCells = (r, full) => [r.orderNo, r.orderedAt, r.product, r.option, r.qty, r.amount,
  full ? r.receiver : maskName(r.receiver), full ? r.phone : maskPhone(r.phone), full ? r.address : maskAddress(r.address1),
  r.memo, r.statusLabel, r.courier, r.trackingNo];

function inPeriod(r) {
  if (view.period === "all") return true;
  const age = -daysUntil(r.createdAt);
  return view.period === "today" ? age === 0 : age < Number(view.period);
}
function matchesQuery(r) {
  const q = view.query.trim();
  return !q || [r.orderNo, r.product, r.receiver].some((v) => v.includes(q));
}
const baseRows = () => allRows.filter((r) => inPeriod(r) && matchesQuery(r)); // tiles count these
const inGroup = (r, group) => !GROUPS[group].statuses || GROUPS[group].statuses.includes(r.status);
const currentRows = () => baseRows().filter((r) => inGroup(r, view.group));

// ---------- table cells ----------
const statusCell = (r) => `<span class="badge badge--${TONE[r.status]}">${r.statusLabel}</span>`;

function courierCell(r) {
  if (r.status !== "ADDRESS_SUBMITTED") return escapeHtml(r.courier || "—");
  const chosen = drafts.get(r.id)?.courier ?? "";
  return `<select class="input input--s" data-courier="${r.id}" aria-label="${r.orderNo} 택배사"><option value="">${S.courierPick}</option>
    ${COURIERS.map((c) => `<option ${c === chosen ? "selected" : ""}>${c}</option>`).join("")}</select>`;
}

function trackingCell(r) {
  if (r.status === "ADDRESS_SUBMITTED") {
    return `<span class="track-form"><input class="input input--s" data-tracking="${r.id}" inputmode="numeric" maxlength="15" placeholder="${S.trackingPlaceholder}"
      value="${escapeHtml(drafts.get(r.id)?.trackingNo ?? "")}" aria-label="${r.orderNo} 송장번호"><button class="btn btn--small" type="button" data-register="${r.id}">${S.register}</button></span>`;
  }
  if (r.status === "SHIPPED") return `${escapeHtml(r.trackingNo)} <button class="link-btn" type="button" data-deliver="${r.id}">${S.deliver}</button>`;
  if (r.status === "CONVERTED" || r.status === "DECLINED_REFUNDED") return `<span class="muted">${S.noShip}</span>`; // never takes a tracking number
  return escapeHtml(r.trackingNo || "—");
}

const COLUMNS = [
  { key: "orderNo", label: "주문번호", sortable: true, render: (r) => `<button class="dt-link" type="button" data-open="${r.id}">${r.orderNo}</button>` },
  { key: "orderedAt", label: "주문일시", sortable: true },
  { key: "product", label: "상품명", render: (r) => `<span class="clamp">${escapeHtml(r.product)}</span>` },
  { key: "option", label: "옵션", render: (r) => escapeHtml(r.option) || "—" },
  { key: "qty", label: "수량", align: "right" },
  { key: "amount", label: "결제금액", sortable: true, align: "right", render: (r) => formatKRW(r.amount) },
  { key: "receiver", label: "받는 분", render: (r) => escapeHtml(maskName(r.receiver)) || "—" },
  { key: "phone", label: "연락처", render: (r) => (r.phone ? maskPhone(r.phone) : "—") },
  { key: "address1", label: "주소", render: (r) => escapeHtml(maskAddress(r.address1)) || "—" },
  { key: "memo", label: "배송메모", render: (r) => `<span class="clamp">${escapeHtml(r.memo) || "—"}</span>` },
  { key: "statusLabel", label: "상태", sortable: true, render: statusCell },
  { key: "courier", label: "택배사", render: courierCell },
  { key: "trackingNo", label: "송장번호", render: trackingCell },
];

// ---------- rendering ----------
function renderShell() {
  app.innerHTML = `
    <div class="seller-head"><h1 class="seller__h1">${S.title} ${NewBadge()}</h1>
      <p class="asis-note"><span>${S.asIs}</span>${icon("chevronRight", { size: 16 })}<b>${S.toBe}</b></p></div>
    <div class="tiles" role="group" aria-label="상태별 주문" data-tiles></div>
    <div class="toolbar card">
      <label class="toolbar__item">상태 <select class="input input--s" data-group-select>${Object.entries(GROUPS).map(([k, g]) => `<option value="${k}">${g.label}</option>`).join("")}</select></label>
      <div class="seg-mini" role="group" aria-label="기간">${PERIODS.map(([k, l]) => `<button type="button" data-period="${k}" aria-pressed="${k === view.period}">${l}</button>`).join("")}</div>
      <label class="toolbar__search">${icon("search", { size: 18 })}<span class="visually-hidden">검색</span><input class="input input--s" type="search" data-query placeholder="${S.search}"></label>
      <button class="btn btn--outline btn--small" type="button" data-action="export">${icon("sheet", { size: 18 })}${S.export}</button>
      <button class="btn btn--dark btn--small" type="button" data-action="upload">${icon("upload", { size: 18 })}${S.upload}</button>
    </div>
    <div class="card" data-table></div>
    ${new URLSearchParams(location.search).has("dev") ? `<p class="dev-row"><button class="link-btn" type="button" data-action="dev-orders">${S.dev}</button></p>` : ""}`;
  table = mountDataTable(app.querySelector("[data-table]"), {
    columns: COLUMNS, rows: [], rowKey: "orderNo", caption: S.title, emptyText: S.empty,
    rowClass: (r) => (GROUPS.noship.statuses.includes(r.status) ? "is-muted" : ""),
    onRowClick: (r) => openDetail(r.id),
  });
}

function refresh() {
  allRows = listGiftsBy({ sellerId: SELLER_ID }).map(toRow);
  const base = baseRows();
  app.querySelector("[data-tiles]").innerHTML = TILES.map((k) => `<button class="tile" type="button" data-tile="${k}" aria-pressed="${view.group === k}">
    <span>${GROUPS[k].label}</span><b>${base.filter((r) => inGroup(r, k)).length}</b></button>`).join("");
  app.querySelector("[data-group-select]").value = view.group;
  table.setRows(currentRows());
}

function openDetail(giftId) {
  const g = getGift(giftId);
  const r = toRow(g);
  const hasPii = Boolean(r.receiver);
  const seller = getSeller(SELLER_ID).name;
  if (hasPii) logAccess({ actor: SELLER_ID, action: "PII_VIEW", giftId }); // accountability for unmasked personal data
  const row = (dt, dd) => `<dt>${dt}</dt><dd>${dd}</dd>`;
  openDrawer({
    label: `${S.drawer} ${r.orderNo}`,
    content: `<header class="drawer__head"><h2>${S.drawer}</h2><button class="icon-btn" type="button" data-close aria-label="닫기">${icon("close")}</button></header>
      <p class="drawer__order">${r.orderNo} ${statusCell(r)}</p>
      <h3 class="drawer__h3">${S.orderInfo}</h3>
      <dl class="info-rows info-rows--sheet">${row("주문일시", r.orderedAt)}${row("상품명", escapeHtml(r.product))}${row("옵션", escapeHtml(r.option) || "—")}${row("수량", r.qty)}${row("결제금액", formatKRW(r.amount))}</dl>
      <h3 class="drawer__h3">${S.receiverInfo}</h3>
      ${hasPii ? `<dl class="info-rows info-rows--sheet">${row("받는 분", escapeHtml(r.receiver))}${row("연락처", escapeHtml(r.phone))}${row("주소", escapeHtml(r.address))}${row("배송메모", escapeHtml(r.memo) || "—")}</dl>
        <p class="pii-note">${icon("info", { size: 16 })}${S.piiNote(formatDate(new Date().toISOString(), { time: true }), escapeHtml(seller))}</p>`
      : `<p class="drawer__empty">${GROUPS.noship.statuses.includes(r.status) ? S.noShipReason : S.noAddress}</p>`}
      <h3 class="drawer__h3">${S.shipping}</h3>
      <dl class="info-rows info-rows--sheet">${row("택배사", escapeHtml(r.courier) || "—")}${row("송장번호", escapeHtml(r.trackingNo) || "—")}</dl>
      <h3 class="drawer__h3">${S.history}</h3>
      <ol class="timeline">${g.history
        .filter((h, i, all) => i === 0 || STATUS_LABELS.seller[h.status] !== STATUS_LABELS.seller[all[i - 1].status]) // SENT + OPENED read the same to a seller
        .map((h) => `<li><b>${STATUS_LABELS.seller[h.status]}</b><time>${formatDate(h.at, { time: true })}</time></li>`).join("")}</ol>`,
  });
}

// UC-S2: inline courier + tracking → registerTracking → SHIPPED
async function register(giftId, button) {
  const draft = drafts.get(giftId) ?? {};
  const check = validateTracking({ courier: draft.courier ?? "", trackingNo: draft.trackingNo ?? "" });
  if (!check.ok) {
    const field = app.querySelector(check.code === "UNKNOWN_COURIER" ? `[data-courier="${giftId}"]` : `[data-tracking="${giftId}"]`);
    field.setAttribute("aria-invalid", "true");
    field.focus();
    toast(check.message);
    return;
  }
  button.disabled = true;
  button.textContent = S.registering;
  const result = await registerTracking({ giftId, courier: draft.courier, trackingNo: draft.trackingNo });
  if (!result.ok) {
    button.disabled = false;
    button.textContent = S.register;
    toast(result.message);
    return;
  }
  drafts.delete(giftId);
  toast(S.registered(getGift(giftId).orderNo));
  refresh();
}

async function deliver(giftId, button) {
  button.disabled = true;
  const result = await advanceDelivery({ giftId });
  toast(result.ok ? S.delivered(getGift(giftId).orderNo) : result.message);
  refresh();
}

// ---------- events ----------
app.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-tile]");
  if (tile) {
    view.group = view.group === tile.dataset.tile ? "all" : tile.dataset.tile;
    refresh();
    app.querySelector(`[data-tile="${tile.dataset.tile}"]`).focus();
  }
  const period = e.target.closest("[data-period]");
  if (period) {
    view.period = period.dataset.period;
    app.querySelectorAll("[data-period]").forEach((b) => b.setAttribute("aria-pressed", String(b === period)));
    refresh();
  }
  const open = e.target.closest("[data-open]");
  if (open) openDetail(open.dataset.open);
  const reg = e.target.closest("[data-register]");
  if (reg) register(reg.dataset.register, reg);
  const del = e.target.closest("[data-deliver]");
  if (del) deliver(del.dataset.deliver, del);
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "export") {
    const selected = new Set(table.getSelected());
    openExportDialog({ scopes: { filtered: currentRows(), all: allRows, selected: allRows.filter((r) => selected.has(r.orderNo)) }, toCells, actor: SELLER_ID });
  }
  if (action === "upload") openBulkUploadDialog({ orders: allRows, onApplied: refresh });
  if (action === "dev-orders") { importGifts(generateOrders(200)); refresh(); toast(S.devDone); }
});
app.addEventListener("input", (e) => {
  const t = e.target;
  if (t.matches("[data-query]")) { view.query = t.value; refresh(); return; }
  if (t.dataset.tracking) {
    drafts.set(t.dataset.tracking, { ...drafts.get(t.dataset.tracking), trackingNo: t.value.trim() });
    t.removeAttribute("aria-invalid");
  }
});
app.addEventListener("change", (e) => {
  const t = e.target;
  if (t.matches("[data-group-select]")) { view.group = t.value; refresh(); }
  if (t.dataset.courier) {
    drafts.set(t.dataset.courier, { ...drafts.get(t.dataset.courier), courier: t.value });
    t.removeAttribute("aria-invalid");
  }
});
subscribe((_, change) => { if (change?.type === "external") refresh(); }); // e.g. a recipient enters an address in another tab

renderShell();
refresh();
initPage();
loadXlsx(); // warm up SheetJS so the first download is instant (falls back to CSV if it can't load)
