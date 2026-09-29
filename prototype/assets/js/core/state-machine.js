// Gift lifecycle (docs/data-model.md §3). Every status change goes through transition().
import { getGift, getProduct, updateGift } from "./store.js";

export const ALLOWED = {
  SENT: ["OPENED", "CONVERTED", "DECLINED_REFUNDED"],
  OPENED: ["ADDRESS_SUBMITTED", "USED", "CONVERTED", "DECLINED_REFUNDED"],
  ADDRESS_SUBMITTED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  USED: [],
  CONVERTED: [],
  DECLINED_REFUNDED: [],
};

export class IllegalTransitionError extends Error {
  constructor(from, to) {
    super(`Illegal gift transition: ${from} → ${to}`);
    this.name = "IllegalTransitionError";
    this.from = from;
    this.to = to;
  }
}

export const canTransition = (from, to) => (ALLOWED[from] ?? []).includes(to);

/** Move a gift (object or id) to `toStatus`, append history, persist. Throws IllegalTransitionError. */
export function transition(giftOrId, toStatus, note = "") {
  const gift = typeof giftOrId === "string" ? getGift(giftOrId) : giftOrId;
  if (!canTransition(gift.status, toStatus)) throw new IllegalTransitionError(gift.status, toStatus);
  const entry = { at: new Date().toISOString(), status: toStatus, note };
  return updateGift(gift.id, { status: toStatus, history: [...gift.history, entry] });
}

/** Can `userId` decline / convert this gift right now? (UC-R3 preconditions) */
export function canDecide(gift, userId, now = new Date()) {
  if (gift.recipientId !== userId) return { ok: false, reason: "NOT_RECIPIENT" };
  if (gift.status === "CONVERTED" || gift.status === "DECLINED_REFUNDED") return { ok: false, reason: "ALREADY_DECIDED" };
  if (gift.status !== "SENT" && gift.status !== "OPENED") return { ok: false, reason: "ALREADY_USED" };
  if (now > new Date(gift.decisionDeadline)) return { ok: false, reason: "DEADLINE_PASSED" };
  if (!getProduct(gift.productId)?.convertible) return { ok: false, reason: "NOT_CONVERTIBLE" };
  return { ok: true };
}

export const DECIDE_REASON_LABELS = {
  NOT_RECIPIENT: "선물을 받은 분만 선택할 수 있어요.",
  ALREADY_DECIDED: "이미 처리된 선물이에요.",
  ALREADY_USED: "이미 사용했거나 배송지를 입력한 선물이라 금액전환·거절을 할 수 없어요.",
  DEADLINE_PASSED: "처리 기한이 지났어요.",
  NOT_CONVERTIBLE: "금액전환이 불가한 상품이에요.",
};
