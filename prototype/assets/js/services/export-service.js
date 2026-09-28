// Seller Excel export / tracking import. Signatures only — implemented in Phase 5 (SheetJS + CSV fallback).

/** rows: array of flat objects (one per order, keyed by 주문번호) → downloads `${filename}.xlsx` (or .csv). */
export function exportOrdersXlsx(rows, filename) {
  throw new Error("exportOrdersXlsx: implemented in Phase 5");
}

/** file: .xlsx or .csv → Promise<[{ orderNo, courier, trackingNo }]> */
export async function parseTrackingFile(file) {
  throw new Error("parseTrackingFile: implemented in Phase 5");
}
