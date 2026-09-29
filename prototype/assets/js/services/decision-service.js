// UC-R3 (선물 거절 및 금액 전환) steps 7–9 and alt 4a, in one place so every screen shares the same rules:
//   · only the recipient, only while canDecide() is ok (precondition)
//   · no double processing: in-flight promise per gift + `processing` lock on the gift + idempotency key "decide-{giftId}"
//   · no completion on failure (alt 8a): the status is left exactly as it was
import { formatKRW, givenName } from "../core/format.js";
import { addNotification, creditWallet, getGift, getUser, updateGift } from "../core/store.js";
import { canDecide, transition } from "../core/state-machine.js";
import { convertToCash, refund } from "./payment-service.js";

const LOCK_TTL_MS = 30 * 1000; // a lock older than this is stale (e.g. the tab was closed mid-request)
const inFlight = new Map(); // giftId → pending promise, so double/triple clicks share one run

const isLocked = (gift) => Boolean(gift.processing) && Date.now() - gift.processing < LOCK_TTL_MS;

/**
 * choice: "convert" (금액으로 받기) | "decline" (선물 거절하기).
 * Resolves { ok: true, settlement } or { ok: false, code, message } — never throws for an expected failure.
 */
export function decideGift({ giftId, userId, choice }) {
  if (inFlight.has(giftId)) return inFlight.get(giftId);
  const run = settle(giftId, userId, choice).finally(() => inFlight.delete(giftId));
  inFlight.set(giftId, run);
  return run;
}

async function settle(giftId, userId, choice) {
  const gift = getGift(giftId);
  const check = gift ? canDecide(gift, userId) : { ok: false, reason: "NOT_FOUND" };
  if (!check.ok) return { ok: false, code: check.reason };
  if (isLocked(gift)) return { ok: false, code: "IN_PROGRESS" }; // another tab is processing this gift

  const statusBefore = gift.status;
  const idempotencyKey = `decide-${giftId}`;
  updateGift(giftId, { processing: Date.now() });
  try {
    // UC-R3 step 7 / 4a: ask the payment system to convert (to the recipient) or refund (to the buyer)
    const result = choice === "convert"
      ? await convertToCash({ giftId, userId, amount: gift.amount, idempotencyKey })
      : await refund({ giftId, amount: gift.amount, idempotencyKey });

    // UC-R3 step 8 → alt 8a: failure leaves the gift untouched
    if (!result.ok) {
      if (getGift(giftId).status !== statusBefore) throw new Error("UC-R3 8a violated: status changed after a failed settlement");
      return { ok: false, code: result.code, message: result.message };
    }

    // UC-R3 step 9: record the settlement, make the original gift unusable, credit or notify
    const settlement = { type: choice === "convert" ? "CONVERT" : "REFUND", amount: gift.amount, txId: result.txId, at: new Date().toISOString() };
    updateGift(giftId, { settlement });
    if (choice === "convert") {
      transition(giftId, "CONVERTED", `금액으로 받음 · 페이머니 ${formatKRW(gift.amount)} 적립`);
      creditWallet(userId, gift.amount, giftId, "CONVERT"); // postcondition: the buyer is NOT notified
    } else {
      transition(giftId, "DECLINED_REFUNDED", "선물 거절, 구매자 환불");
      const name = givenName(getUser(userId).name);
      addNotification({ userId: gift.buyerId, giftId, type: "DECLINED_REFUNDED", text: `${name}님이 선물을 거절하여 ${formatKRW(gift.amount)}이 환불되었어요.` });
    }
    return { ok: true, settlement };
  } finally {
    updateGift(giftId, { processing: null });
  }
}
