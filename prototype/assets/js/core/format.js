// Display formatting helpers. Data stays raw (integers in KRW, ISO dates); format only when rendering.

const DAY_MS = 24 * 60 * 60 * 1000;

/** 12000 → "12,000원" */
export function formatKRW(amount) {
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

/** 58000 → "5.8만", 528 → "528" (wish counts, like the screenshots) */
export function formatCount(n) {
  if (n < 10000) return n.toLocaleString("ko-KR");
  return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}만`;
}

const pad = (n) => String(n).padStart(2, "0");

/** ISO → "2026.09.28" or, with time, "2026.09.28 16:47:11" (order-history style) */
export function formatDate(iso, { time = false } = {}) {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  return time ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` : date;
}

/** "김지우" → "지우" (friends are called by their given name); other lengths unchanged. */
export const givenName = (name) => (String(name).length === 3 ? String(name).slice(1) : String(name));

/** "010-1234-5678" → "010-****-5678" */
export function maskPhone(phone) {
  return String(phone).replace(/^(\d{3})-?\d{3,4}-?(\d{4})$/, "$1-****-$2");
}

/** "김지우" → "김*우", "김민" → "김*" */
export function maskName(name) {
  const s = String(name);
  if (s.length <= 1) return s;
  if (s.length === 2) return `${s[0]}*`;
  return s[0] + "*".repeat(s.length - 2) + s[s.length - 1];
}

/** Escape user-entered text before putting it into innerHTML. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Whole calendar days from `now` until `iso` (negative = past). */
export function daysUntil(iso, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = new Date(iso);
  const end = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((end - start) / DAY_MS);
}

/** "D-3", "D-Day", "D+2" */
export function dDay(iso, now = new Date()) {
  const days = daysUntil(iso, now);
  if (days === 0) return "D-Day";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}
