// Recipient-side components (SCR-R01~R03). Built from the app's existing styles — no reference screenshot.
import { dDay, daysUntil, escapeHtml, formatDate } from "../core/format.js";
import { STATUS_LABELS } from "../core/strings.js";
import { icon } from "./icons.js";

/** KakaoTalk-style "gift arrived" bubble for SENT gifts, with a NEW dot. */
export function GiftBubble(gift) {
  return `<span class="gift-bubble">
    <span class="gift-bubble__head">${icon("giftFilled", { size: 16 })}선물이 도착했어요<i class="new-dot" aria-label="새 선물"></i></span>
    <span class="gift-bubble__body">${escapeHtml(gift.message)}</span></span>`;
}

/** Decision-deadline chip "D-12" (warning colour when ≤ 3 days) for SENT / OPENED gifts. */
export function DeadlineChip(gift, now = new Date()) {
  if (gift.status !== "SENT" && gift.status !== "OPENED") return "";
  const days = daysUntil(gift.decisionDeadline, now);
  if (days < 0) return `<span class="deadline-chip is-expired">기한 만료</span>`;
  const label = `금액전환·거절 가능 기한 ${formatDate(gift.decisionDeadline)}까지`;
  return `<span class="deadline-chip ${days <= 3 ? "is-soon" : ""}" title="${label}">${dDay(gift.decisionDeadline, now)}<span class="visually-hidden"> ${label}</span></span>`;
}

/** Fake but stable barcode drawn from the digits of `code`. */
export function Barcode(code) {
  const bars = [];
  let x = 0;
  for (const ch of String(code)) {
    const d = Number(ch);
    const w1 = 1 + (d % 3);
    const w2 = 1 + ((d * 7) % 3);
    bars.push(`<rect x="${x}" width="${w1}" height="60"/>`);
    x += w1 + 1 + ((d + 1) % 2);
    bars.push(`<rect x="${x}" width="${w2}" height="60"/>`);
    x += w2 + 2;
  }
  return `<figure class="barcode"><svg viewBox="0 0 ${x} 60" preserveAspectRatio="none" role="img" aria-label="바코드 ${code}" fill="currentColor">${bars.join("")}</svg>
    <figcaption>${String(code).replace(/(\d{4})(?=\d)/g, "$1 ")}</figcaption></figure>`;
}

export const barcodeNumber = (gift) => gift.orderNo.replace("-", "").slice(-12);

const DELIVERY_STEPS = ["ADDRESS_SUBMITTED", "SHIPPED", "DELIVERED"].map((s) => [s, STATUS_LABELS.recipient[s]]);

/** Read-only delivery progress for ADDRESS_SUBMITTED / SHIPPED / DELIVERED gifts. */
export function DeliveryTimeline(gift) {
  const reached = Object.fromEntries(gift.history.map((h) => [h.status, h.at]));
  const d = gift.delivery ?? {};
  return `<ol class="timeline">${DELIVERY_STEPS.map(([status, label]) => `
    <li class="${reached[status] ? "is-done" : "is-pending"}"><b>${label}</b>
      <time>${reached[status] ? formatDate(reached[status], { time: true }) : "예정"}</time>
      ${status === "SHIPPED" && d.trackingNo ? `<small>${escapeHtml(d.courier)} ${escapeHtml(d.trackingNo)}</small>` : ""}</li>`).join("")}</ol>`;
}
