// SCR-S02 Excel export and SCR-S03 bulk tracking upload — modals of the seller center (UC-S1 alt 4b, UC-S2).
import { escapeHtml, formatDate } from "../core/format.js";
import { STATUS_LABELS } from "../core/strings.js";
import { logAccess } from "../core/store.js";
import { registerTrackingBulk, validateTracking } from "../services/delivery-service.js";
import { exportTable, parseTrackingFile } from "../services/export-service.js";
import { NewBadge } from "./components.js";
import { openDialog, toast, withLoading } from "./overlays.js";

export const EXPORT_HEADERS = ["주문번호", "주문일시", "상품명", "옵션", "수량", "결제금액", "받는 분", "연락처", "주소", "배송메모", "상태", "택배사", "송장번호"];
const TEMPLATE_HEADERS = ["주문번호", "택배사", "송장번호"];
const stamp = () => formatDate(new Date().toISOString()).replaceAll(".", "");

const radio = (name, value, label, { checked = false, disabled = false } = {}) =>
  `<label class="field-row ${disabled ? "is-disabled" : ""}"><input class="radio" type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>${label}</label>`;

/**
 * SCR-S02. scopes: { filtered, all, selected } row arrays; toCells(row, fullPii) → cells in EXPORT_HEADERS order.
 * Full personal data needs an explicit acknowledgement and is written to the access log.
 */
export function openExportDialog({ scopes, toCells, actor }) {
  const base = `선물하기_주문배송통합_${stamp()}`;
  const name = (format) => `${base}.${format}`;
  const dlg = openDialog({
    label: "엑셀 다운로드",
    content: `<form class="dlg-form" novalidate>
      <h2 class="panel__title">엑셀 다운로드 ${NewBadge()}</h2>
      <p class="panel__desc">주문 정보와 받는 분 배송지를 <b>주문번호 기준 한 파일</b>로 내려받아요.</p>
      <fieldset class="dlg-field"><legend>범위</legend>
        ${radio("scope", "filtered", `현재 필터 결과 <b>${scopes.filtered.length}건</b>`, { checked: true })}
        ${radio("scope", "all", `전체 <b>${scopes.all.length}건</b>`)}
        ${radio("scope", "selected", `선택한 행 <b>${scopes.selected.length}건</b>`, { disabled: !scopes.selected.length })}</fieldset>
      <fieldset class="dlg-field"><legend>개인정보</legend>
        ${radio("pii", "masked", "마스킹해서 받기 (010-****-1234)", { checked: true })}
        ${radio("pii", "full", "전체 표시")}
        <label class="field-row dlg-ack" hidden><input class="checkbox" type="checkbox" name="ack">배송 목적 외에 사용하지 않으며, 다운로드 기록이 남는 것에 동의합니다.</label></fieldset>
      <fieldset class="dlg-field"><legend>파일 형식</legend>
        ${radio("format", "xlsx", "엑셀 (.xlsx)", { checked: true })}${radio("format", "csv", "CSV (.csv)")}</fieldset>
      <p class="dlg-filename">파일명 <b data-filename>${name("xlsx")}</b></p>
      <p class="field-error" data-error hidden></p>
      <div class="dialog__actions"><button class="btn btn--grey" type="button" data-close>취소</button><button class="btn btn--primary" type="submit">다운로드</button></div>
    </form>`,
  });
  const form = dlg.el.querySelector("form");
  const value = (n) => form.querySelector(`[name="${n}"]:checked`)?.value;
  form.addEventListener("change", () => {
    form.querySelector(".dlg-ack").hidden = value("pii") !== "full";
    form.querySelector("[data-filename]").textContent = name(value("format"));
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const full = value("pii") === "full";
    const error = form.querySelector("[data-error]");
    if (full && !form.querySelector('[name="ack"]').checked) {
      error.textContent = "개인정보를 전체 표시하려면 동의가 필요해요.";
      error.hidden = false;
      return;
    }
    const rows = scopes[value("scope")];
    const result = await withLoading(exportTable({
      headers: EXPORT_HEADERS, rows: rows.map((r) => toCells(r, full)), filename: base, format: value("format"),
    }), "파일을 만드는 중…");
    if (full) logAccess({ actor, action: "PII_EXPORT", count: rows.length });
    dlg.close();
    toast(result.fallback ? "엑셀 라이브러리를 불러오지 못해 CSV(UTF-8)로 내려받았어요." : `${rows.length}건을 ${result.format === "xlsx" ? "엑셀" : "CSV"} 파일로 내려받았어요.`);
  });
}

/**
 * SCR-S03 bulk upload. orders: all of the seller's rows ({ id, orderNo, status }); onApplied() refreshes the table.
 * Flow: 양식 다운로드 → fill courier + tracking in Excel → upload → per-row check → "n건 등록" applies only valid rows.
 */
export function openBulkUploadDialog({ orders, onApplied }) {
  const byOrderNo = new Map(orders.map((o) => [o.orderNo, o]));
  const ready = orders.filter((o) => o.status === "ADDRESS_SUBMITTED");
  let valid = [];
  let invalidCount = 0;

  const dlg = openDialog({
    label: "송장 일괄 업로드",
    className: "panel--wide",
    content: `<h2 class="panel__title">송장 일괄 업로드 ${NewBadge()}</h2>
      <ol class="bulk-steps">
        <li><b>1</b><span>양식을 내려받아 택배사·송장번호를 입력하세요. <small>발송 대기 ${ready.length}건의 주문번호가 채워져 있어요.</small></span></li>
        <li><b>2</b><span>작성한 파일(.xlsx, .csv)을 올리면 한 줄씩 미리 검사해요. 오류가 있는 줄은 건너뛰어요.</span></li></ol>
      <div class="bulk-actions"><button class="btn btn--outline btn--small" type="button" data-action="template">양식 다운로드</button>
        <button class="link-btn demo-helper" type="button" data-action="sample">데모용 작성 예시 받기</button></div>
      <label class="file-pick"><input type="file" accept=".xlsx,.csv" data-file><span class="btn btn--dark btn--small">파일 선택</span><small data-file-name>선택된 파일 없음</small></label>
      <div data-preview></div>
      <div class="dialog__actions"><button class="btn btn--grey" type="button" data-close>닫기</button>
        <button class="btn btn--primary" type="button" data-action="apply" disabled>등록</button></div>`,
  });
  const $ = (sel) => dlg.el.querySelector(sel);

  function checkRow(r, seen) {
    const order = byOrderNo.get(r.orderNo);
    if (!order) return "주문번호를 찾을 수 없어요";
    if (seen.has(r.orderNo)) return "파일 안에서 중복된 주문이에요";
    if (order.status === "CONVERTED" || order.status === "DECLINED_REFUNDED") return "발송 불필요 주문이에요 (금액 전환·거절)";
    if (order.status !== "ADDRESS_SUBMITTED") return `발송 대기 상태가 아니에요 (${STATUS_LABELS.seller[order.status]})`;
    const check = validateTracking(r);
    return check.ok ? "" : check.message;
  }

  function preview(rows) {
    const seen = new Set();
    const checked = rows.map((r) => {
      const problem = checkRow(r, seen);
      if (!problem) seen.add(r.orderNo);
      return { ...r, problem };
    });
    valid = checked.filter((r) => !r.problem);
    invalidCount = checked.length - valid.length;
    $("[data-preview]").innerHTML = `<p class="bulk-summary">등록 가능 <b class="text-positive">${valid.length}건</b> · 오류 <b class="text-danger">${invalidCount}건</b></p>
      <div class="dt-scroll dt-scroll--short"><table class="dt"><thead><tr><th>행</th><th>주문번호</th><th>택배사</th><th>송장번호</th><th>검사 결과</th></tr></thead>
      <tbody>${checked.map((r) => `<tr class="${r.problem ? "is-error" : ""}"><td>${r.line}</td><td>${escapeHtml(r.orderNo)}</td><td>${escapeHtml(r.courier)}</td><td>${escapeHtml(r.trackingNo)}</td>
        <td>${r.problem ? `<span class="text-danger">✗ ${escapeHtml(r.problem)}</span>` : '<span class="text-positive">✓ 등록 가능</span>'}</td></tr>`).join("")}</tbody></table></div>`;
    const apply = $('[data-action="apply"]');
    apply.disabled = !valid.length;
    apply.textContent = `${valid.length}건 등록`;
  }

  function sampleRows() {
    const rows = ready.map((o, i) => [o.orderNo, "CJ대한통운", `6${String(Date.now()).slice(-8)}${String(i).padStart(3, "0")}`]);
    if (rows.length) rows[rows.length - 1][2] = "12-34"; // wrong tracking format
    rows.push(["20990101-999999", "CJ대한통운", "681200000001"]); // unknown order
    const noShip = orders.find((o) => o.status === "CONVERTED" || o.status === "DECLINED_REFUNDED");
    if (noShip) rows.push([noShip.orderNo, "한진택배", "512345678901"]); // must never be shipped
    return rows;
  }

  dlg.el.addEventListener("click", async (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "template") await exportTable({ headers: TEMPLATE_HEADERS, rows: ready.map((o) => [o.orderNo, "", ""]), filename: `송장업로드_양식_${stamp()}` });
    if (action === "sample") await exportTable({ headers: TEMPLATE_HEADERS, rows: sampleRows(), filename: `송장업로드_예시_${stamp()}` });
    if (action === "apply" && valid.length) {
      const results = await withLoading(registerTrackingBulk(valid.map((r) => ({ giftId: byOrderNo.get(r.orderNo).id, courier: r.courier, trackingNo: r.trackingNo }))), "송장을 등록하는 중…");
      const ok = results.filter((r) => r.ok).length;
      dlg.close();
      toast(`${ok}건 등록, ${invalidCount + results.length - ok}건 오류`);
      onApplied();
    }
  });
  dlg.el.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    $("[data-file-name]").textContent = file.name;
    try {
      preview(await parseTrackingFile(file));
    } catch (err) {
      $("[data-preview]").innerHTML = `<p class="field-error">${escapeHtml(err.message)}</p>`;
    }
  });
}
