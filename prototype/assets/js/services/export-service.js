// Seller Excel export / tracking import (SCR-S02, SCR-S03).
// .xlsx via SheetJS (the xlsx-js-style build = SheetJS 0.18.5 + cell styles, for the bold header) loaded from jsDelivr;
// if it can't load (offline), CSV with a UTF-8 BOM so Korean opens correctly in Excel.
const XLSX_URL = "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js";
const LOAD_TIMEOUT_MS = 8000;
let loading = null;

/** Resolves window.XLSX, or null when the library is unavailable. Safe to call many times. */
export function loadXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = XLSX_URL;
    script.onload = () => resolve(window.XLSX ?? null);
    script.onerror = () => resolve(null);
    setTimeout(() => resolve(window.XLSX ?? null), LOAD_TIMEOUT_MS);
    document.head.append(script);
  });
  return loading;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// A cell starting with = + - @ would run as a formula in Excel (CSV injection) → prefix with '
const safeText = (v) => (typeof v === "string" && /^[=+\-@]/.test(v) ? `'${v}` : v);
const csvCell = (v) => {
  const s = String(safeText(v ?? ""));
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

/**
 * headers: ["주문번호", …]; rows: arrays in the same order; filename without extension.
 * format "xlsx" (default) falls back to CSV when SheetJS is missing. Returns { format, fallback }.
 */
export async function exportTable({ headers, rows, filename, format = "xlsx" }) {
  const XLSX = format === "xlsx" ? await loadXlsx() : null;
  if (!XLSX) {
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    downloadBlob(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
    return { format: "csv", fallback: format === "xlsx" };
  }
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows.map((r) => r.map(safeText))]);
  headers.forEach((_, c) => (sheet[XLSX.utils.encode_cell({ r: 0, c })].s = { font: { bold: true } }));
  sheet["!cols"] = headers.map((h, c) => ({ wch: Math.min(40, Math.max(h.length * 2 + 2, ...rows.map((r) => String(r[c] ?? "").length + 2))) }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "주문배송");
  const data = XLSX.write(book, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${filename}.xlsx`);
  return { format: "xlsx", fallback: false };
}

/** Small CSV parser (quoted fields, commas, newlines, BOM). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** file: .xlsx or .csv → Promise<[{ line, orderNo, courier, trackingNo }]> (header row located by name). */
export async function parseTrackingFile(file) {
  let table;
  if (/\.csv$/i.test(file.name)) {
    table = parseCsv(await file.text());
  } else {
    const XLSX = await loadXlsx();
    if (!XLSX) throw new Error("엑셀 파일을 읽으려면 인터넷 연결이 필요해요. CSV로 올려 주세요.");
    const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
    table = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: true, defval: "" });
  }
  const clean = (v) => String(v ?? "").trim().replace(/^'/, "");
  const header = (table[0] ?? []).map(clean);
  const col = (name, fallback) => (header.indexOf(name) >= 0 ? header.indexOf(name) : fallback);
  const [iOrder, iCourier, iTracking] = [col("주문번호", 0), col("택배사", 1), col("송장번호", 2)];
  return table.slice(1)
    .map((r, i) => ({ line: i + 2, orderNo: clean(r[iOrder]), courier: clean(r[iCourier]), trackingNo: clean(r[iTracking]) }))
    .filter((r) => r.orderNo || r.courier || r.trackingNo);
}
