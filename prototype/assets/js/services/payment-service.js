// Mock external payment system. Async with latency, idempotent per key, failure injection via devFlags.
import { consumeDevFlag, getIdempotentResult, saveIdempotentResult } from "../core/store.js";

const latency = () => new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));
const inFlight = new Map(); // key → pending promise (blocks double clicks while processing)

/**
 * Run `kind` once per idempotencyKey. Success is remembered (a repeated key returns the same txId);
 * failure is not, so the caller can retry with the same key.
 */
function processOnce(kind, idempotencyKey, amount, failFlag) {
  if (!idempotencyKey) return Promise.resolve({ ok: false, code: "MISSING_IDEMPOTENCY_KEY", message: "요청 정보가 올바르지 않아요." });
  const key = `${kind}:${idempotencyKey}`;
  const done = getIdempotentResult(key);
  if (done) return Promise.resolve(done);
  if (inFlight.has(key)) return inFlight.get(key);

  const run = (async () => {
    await latency();
    if (!Number.isInteger(amount) || amount <= 0) return { ok: false, code: "INVALID_AMOUNT", message: "금액이 올바르지 않아요." };
    if (consumeDevFlag(failFlag)) return FAILURES[failFlag];
    const result = { ok: true, txId: `tx_${kind}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, amount };
    saveIdempotentResult(key, result);
    return result;
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, run);
  return run;
}

const FAILURES = {
  failNextPayment: { ok: false, code: "PAYMENT_DECLINED", message: "결제가 승인되지 않았어요. 다른 결제수단을 선택하거나 다시 시도해 주세요." },
  failNextSettlement: { ok: false, code: "SETTLEMENT_FAILED", message: "일시적인 오류로 처리하지 못했어요. 잠시 후 다시 시도해 주세요." },
};

export function pay({ amount, method, idempotencyKey }) {
  return processOnce("pay", idempotencyKey, amount, "failNextPayment");
}

export function refund({ giftId, amount, idempotencyKey }) {
  return processOnce(`refund-${giftId}`, idempotencyKey, amount, "failNextSettlement");
}

export function convertToCash({ giftId, userId, amount, idempotencyKey }) {
  return processOnce(`convert-${giftId}-${userId}`, idempotencyKey, amount, "failNextSettlement");
}
